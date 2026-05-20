// src/app/invoices/[id]/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Download,
  FileText,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import {
  canApproveInvoice,
  canRejectInvoice,
  canRecordPayment,
  canMarkBanked,
  canSubmitInvoice,
  canViewAuditTrail,
  canEditInvoice,
} from "@/lib/permissions";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast";
import { fmt, fmtDate, fmtDateTime } from "@/lib/utils";

// Components
import StatusBadge from "@/components/invoices/StatusBadge";
import RejectModal from "./components/RejectModal";
import RecordPaymentModal from "./components/RecordPaymentModal";
import MarkAsBankedModal from "./components/MarkAsBankedModal";
import AuditTrail from "./components/AuditTrail";
import WorkflowPanel from "./components/WorkflowPanel";
import WorkflowRoadmap from "@/components/ui/WorkflowRoadmap";


// ─── Main Page ───────────────────────────────────────────────────

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  // Modals
  const [showReject, setShowReject] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showMarkBanked, setShowMarkBanked] = useState(false);

  const loadInvoice = useCallback(() => {
    setLoading(true);
    api
      .get(`/invoices/${id}`)
      .then((r) => setInvoice(r.data))
      .catch(() => setError("Failed to load invoice."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  // ── Actions ────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      await api.post(`/invoices/${id}/submit-to-finance`);
      toast.success("Invoice submitted to ProcureX.");
      loadInvoice();
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Submit failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.post(`/invoices/${id}/approve`);
      toast.success("Invoice approved.");
      loadInvoice();
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Approve failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    try {
      await api.post(`/invoices/${id}/reject`, { reason: reason });
      toast.warning("Invoice rejected.");
      setShowReject(false);
      loadInvoice();
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Reject failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async (data) => {
    setActionLoading(true);
    try {
      const payload = {
        ...data,
        payment_amount:
          data.payment_amount === "" ? 0 : Number(data.payment_amount),
      };
      await api.post(`/invoices/${id}/record-payment`, payload);
      toast.success("Payment recorded. Internal receipt generated.");
      setShowRecordPayment(false);
      loadInvoice();
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Failed to record payment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkBanked = async (data) => {
    setActionLoading(true);
    try {
      await api.post(`/invoices/${id}/mark-banked`, data);
      toast.success("Invoice marked as banked.");
      setShowMarkBanked(false);
      loadInvoice();
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Failed to mark as banked.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render guards ──────────────────────────────────────────────

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );

  if (error || !invoice)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
        <p>{error ?? "Invoice not found."}</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 text-sm hover:underline"
        >
          ← Go back
        </button>
      </div>
    );

  // ── Action button logic ────────────────────────────────────────

  const showSubmitBtn =
    invoice.status === "Tax Generated" && canSubmitInvoice(permissions);
  const showApproveBtn =
    invoice.status === "Submitted" && canApproveInvoice(permissions);
  const showRejectBtn =
    ["Submitted", "Approved"].includes(invoice.status) &&
    canRejectInvoice(permissions);
  const showRecordPaymentBtn =
    invoice.status === "Approved" && canRecordPayment(permissions);
  const showMarkBankedBtn =
    ["Approved", "Payment Received"].includes(invoice.status) && canMarkBanked(permissions);
  const showEditBtn = invoice.status === "Draft" && canEditInvoice(permissions);
  const showAuditTab = canViewAuditTrail(permissions);

  const hasActions =
    showSubmitBtn ||
    showApproveBtn ||
    showRejectBtn ||
    showRecordPaymentBtn ||
    showMarkBankedBtn ||
    showEditBtn;

  return (
    <>
      {/* Modals */}
      {showReject && (
        <RejectModal
          invoiceNumber={invoice.invoice_number}
          onConfirm={handleReject}
          onClose={() => setShowReject(false)}
          loading={actionLoading}
        />
      )}
      {showRecordPayment && (
        <RecordPaymentModal
          invoice={invoice}
          onConfirm={handleRecordPayment}
          onClose={() => setShowRecordPayment(false)}
          loading={actionLoading}
        />
      )}
      {showMarkBanked && (
        <MarkAsBankedModal
          onConfirm={handleMarkBanked}
          onClose={() => setShowMarkBanked(false)}
          loading={actionLoading}
        />
      )}

      {/* Page */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => router.push("/invoices")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-2 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Invoices
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {invoice.invoice_number}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {invoice.customer?.name} · {fmtDate(invoice.invoice_date)}
            </p>
          </div>

          {/* Action Buttons */}
          {hasActions && (
            <div className="flex flex-wrap gap-2">
              {showEditBtn && (
                <button
                  onClick={() => router.push(`/invoices/${id}/edit`)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Edit Draft
                </button>
              )}
              {showSubmitBtn && (
                <button
                  onClick={handleSubmit}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  Submit to Finance
                </button>
              )}
              {showApproveBtn && (
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  Approve
                </button>
              )}
              {showRejectBtn && (
                <button
                  onClick={() => setShowReject(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  Reject
                </button>
              )}
              {showRecordPaymentBtn && (
                <button
                  onClick={() => setShowRecordPayment(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  Record Payment
                </button>
              )}
              {showMarkBankedBtn && (
                <button
                  onClick={() => setShowMarkBanked(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                >
                  Mark as Banked
                </button>
              )}
            </div>
          )}
        </div>

        {/* Workflow Lifecycle Visualization */}
        <WorkflowRoadmap currentStatus={invoice.status} />

        {/* Workflow panel always visible */}
        <WorkflowPanel invoice={invoice} />

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1">
            {[
              "details",
              "tax",
              "documents",
              ...(showAuditTab ? ["audit"] : []),
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition capitalize
                    ${
                      activeTab === tab
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
              >
                {tab === "tax"
                  ? "Tax Invoice"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Panels */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoice Details */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Invoice Details
              </h3>
              {[
                ["Invoice Number", invoice.invoice_number],
                ["Invoice Date", fmtDate(invoice.invoice_date)],
                ["Invoice Amount", fmt(invoice.invoice_amount)],
                ["Status", <StatusBadge key="s" status={invoice.status} />],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Customer + PO */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Customer
                </h3>
                <p className="text-sm font-medium text-gray-800">
                  {invoice.customer?.name ?? "—"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {invoice.billing_address || invoice.customer?.billing_address || ""}
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Purchase Order
                </h3>
                <p className="text-sm font-medium text-gray-800">
                  {invoice.customer_po_number || invoice.purchase_order?.po_number || "—"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">
                  Amount: {fmt(invoice.purchase_order?.po_amount)}
                </p>
                {invoice.customer_po_description && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2 border border-gray-100">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Demand / Description</p>
                    <p className="text-xs text-gray-700">{invoice.customer_po_description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details */}
            {(invoice.status === "Payment Received" ||
              invoice.status === "Banked" ||
              invoice.status === "Paid") && (
              <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest">
                    Cheque & Payment Information
                  </h3>
                  {invoice.receipt_number && (
                    <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-200">
                      {invoice.receipt_number}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    [
                      "Cheque/Ref",
                      invoice.cheque_number || invoice.payment_reference,
                    ],
                    ["Bank", invoice.bank_name || invoice.payment_method],
                    ["Amount Received", fmt(invoice.payment_amount)],
                    ["Received Date", fmtDate(invoice.payment_received_date)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                        {label}
                      </p>
                      <p className="text-sm font-bold text-indigo-900 dark:text-gray-200">
                        {value ?? "—"}
                      </p>
                    </div>
                  ))}
                  {invoice.status === "Banked" && (
                    <>
                      <div>
                        <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-1">
                          Banked Date
                        </p>
                        <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
                          {fmtDate(invoice.banked_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-1">
                          Bank Ref
                        </p>
                        <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
                          {invoice.bank_reference || "—"}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {invoice.recordedBy && (
                  <p className="text-[10px] text-indigo-400/60 font-medium mt-4 pt-4 border-t border-indigo-100">
                    Recorded by {invoice.recordedBy.name}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "tax" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            {invoice.tax_invoice ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Tax Invoice
                </h3>
                {[
                  [
                    "Tax Invoice Number",
                    invoice.tax_invoice.tax_invoice_number,
                  ],
                  ["Tax Percentage", `${invoice.tax_invoice.tax_percentage}%`],
                  ["Tax Amount", fmt(invoice.tax_invoice.tax_amount)],
                  ["Invoice Amount", fmt(invoice.invoice_amount)],
                  ["Total Amount", fmt(invoice.tax_invoice.total_amount)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm text-gray-500">{label}</span>
                    <span
                      className={`text-sm font-medium ${label === "Total Amount" ? "text-gray-900 text-base font-bold" : "text-gray-800"}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
                <div className="pt-3">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    </svg>
                    Download PDF
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg
                  className="w-10 h-10 mb-3 opacity-40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm">Tax invoice not generated yet.</p>
                <p className="text-xs mt-1">
                  Generate a tax invoice before submitting to Finance.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Attached Documents
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Upload signed submission forms, customer POs, or other
                  supporting documents.
                </p>
              </div>
              {["Draft", "Tax Generated", "Submitted", "Rejected"].includes(
                invoice.status,
              ) && (
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition border border-blue-100">
                  <input
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("document_type", "Signed Document");

                      setActionLoading(true);
                      try {
                        await api.post(
                          `/invoices/${id}/upload-document`,
                          formData,
                        );
                        showToast("Document uploaded successfully.");
                        loadInvoice();
                      } catch (err) {
                        showToast("Upload failed.", "error");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                  />
                  <Plus className="w-3.5 h-3.5" />
                  Upload Document
                </label>
              )}
            </div>

            <div className="space-y-3">
              {(invoice.documents || []).length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs uppercase font-bold tracking-widest">
                    No documents attached
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {invoice.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl group transition-all hover:border-blue-200 hover:bg-white"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate uppercase tracking-tighter">
                            {doc.file_name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {doc.document_type} · by {doc.uploader?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${doc.file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 transition"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        {["Draft", "Tax Generated", "Rejected"].includes(
                          invoice.status,
                        ) && (
                          <button
                            onClick={async () => {
                              if (confirm("Delete this document?")) {
                                try {
                                  await api.delete(
                                    `/invoices/${id}/documents/${doc.id}`,
                                  );
                                  showToast("Document deleted.");
                                  loadInvoice();
                                } catch (err) {
                                  showToast("Delete failed.", "error");
                                }
                              }
                            }}
                            className="p-2 text-gray-300 hover:text-red-600 transition"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "audit" && showAuditTab && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-5">
              Audit Trail
            </h3>
            <AuditTrail invoiceId={id} />
          </div>
        )}
      </div>
    </>
  );
}
