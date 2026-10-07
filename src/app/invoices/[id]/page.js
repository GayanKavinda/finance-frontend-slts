// src/app/invoices/[id]/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Download,
  FileText,
  Loader2,
  Plus,
  ArrowLeft,
  Calendar,
  Building,
  CreditCard,
  FileCheck,
  CheckCircle2,
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
import { downloadInvoicePdf } from "@/lib/invoice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Components
import StatusBadge from "@/components/invoices/StatusBadge";
import RejectModal from "./components/RejectModal";
import RecordPaymentModal from "./components/RecordPaymentModal";
import MarkAsBankedModal from "./components/MarkAsBankedModal";
import AuditTrail from "./components/AuditTrail";
import WorkflowPanel from "./components/WorkflowPanel";
import WorkflowRoadmap from "@/components/ui/WorkflowRoadmap";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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

  // Actions
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await downloadInvoicePdf(id);
      toast.success("Invoice PDF downloaded successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to download PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

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
      await api.post(`/invoices/${id}/reject`, { reason });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-3">
        <p className="text-sm">{error ?? "Invoice not found."}</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/invoices")}>
          ← Back to Invoices
        </Button>
      </div>
    );
  }

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

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
          <div>
            <button
              onClick={() => router.push("/invoices")}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Invoices
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold tracking-tight text-foreground font-mono">
                {invoice.invoice_number}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Customer: <span className="font-medium text-foreground">{invoice.customer?.name}</span> · Issued: {fmtDate(invoice.invoice_date)}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="h-8 gap-1.5 text-xs shadow-xs"
            >
              {downloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Download PDF
            </Button>

            {showEditBtn && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/invoices/${id}/edit`)}
                className="h-8 text-xs shadow-xs"
              >
                Edit Draft
              </Button>
            )}

            {showSubmitBtn && (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={actionLoading}
                className="h-8 text-xs shadow-xs gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit to Finance
              </Button>
            )}

            {showApproveBtn && (
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={actionLoading}
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Approve Invoice
              </Button>
            )}

            {showRecordPaymentBtn && (
              <Button
                size="sm"
                onClick={() => setShowRecordPayment(true)}
                disabled={actionLoading}
                className="h-8 text-xs shadow-xs gap-1.5"
              >
                Record Payment
              </Button>
            )}

            {showMarkBankedBtn && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowMarkBanked(true)}
                disabled={actionLoading}
                className="h-8 text-xs shadow-xs gap-1.5"
              >
                Mark as Banked
              </Button>
            )}

            {showRejectBtn && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowReject(true)}
                disabled={actionLoading}
                className="h-8 text-xs shadow-xs"
              >
                Reject
              </Button>
            )}
          </div>
        </div>

        {/* Workflow Roadmap */}
        <WorkflowRoadmap currentStatus={invoice.status} />

        {/* Workflow Progress Panel */}
        <WorkflowPanel invoice={invoice} />

        {/* Tabs Bar */}
        <div className="border-b border-border">
          <nav className="flex gap-2">
            {[
              { id: "details", label: "Invoice Details" },
              { id: "tax", label: "Tax Invoice" },
              { id: "documents", label: "Documents" },
              ...(showAuditTab ? [{ id: "audit", label: "Audit Trail" }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab 1: Details */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Invoice Financial Summary */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Financial Breakdown
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-1.5 border-b border-border/50 text-xs">
                  <span className="text-muted-foreground">Invoice Reference</span>
                  <span className="font-mono font-medium text-foreground">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/50 text-xs">
                  <span className="text-muted-foreground">Issue Date</span>
                  <span className="font-medium text-foreground">{fmtDate(invoice.invoice_date)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/50 text-xs">
                  <span className="text-muted-foreground">Subtotal (Net)</span>
                  <span className="font-mono font-medium text-foreground">{fmt(invoice.invoice_amount)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/50 text-xs">
                  <span className="text-muted-foreground">VAT Rate</span>
                  <span className="font-medium text-foreground">
                    {invoice.tax_invoice ? `${invoice.tax_invoice.tax_percentage}%` : "18% (Standard)"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/50 text-xs">
                  <span className="text-muted-foreground">VAT Amount</span>
                  <span className="font-mono font-medium text-foreground">
                    {fmt(invoice.tax_invoice?.tax_amount || (Number(invoice.invoice_amount || 0) * 0.18))}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 text-sm">
                  <span className="font-semibold text-foreground">Grand Total</span>
                  <span className="font-mono font-semibold text-foreground">
                    {fmt(invoice.tax_invoice?.total_amount || (Number(invoice.invoice_amount || 0) * 1.18))}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer & Scope Info */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Customer & Billing Address
                </h3>
                <p className="text-sm font-semibold text-foreground">
                  {invoice.customer?.name ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line leading-relaxed">
                  {invoice.billing_address || invoice.customer?.billing_address || "No billing address provided."}
                </p>
                {invoice.customer?.tax_number && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium text-foreground">VAT Reg:</span> {invoice.customer.tax_number}
                  </p>
                )}
              </div>

              <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Procurement Reference
                </h3>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-muted-foreground">Customer PO:</span>
                  <span className="font-mono font-medium text-foreground">
                    {invoice.customer_po_number || invoice.purchase_order?.po_number || "—"}
                  </span>
                </div>
                {invoice.purchase_order?.po_amount && (
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-muted-foreground">PO Allocated Budget:</span>
                    <span className="font-mono font-medium text-foreground">
                      {fmt(invoice.purchase_order.po_amount)}
                    </span>
                  </div>
                )}
                {invoice.customer_po_description && (
                  <div className="bg-muted/50 rounded-lg p-3 mt-2 border border-border">
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
                      Scope / Description
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">
                      {invoice.customer_po_description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details (Clean Zen Design) */}
            {(invoice.status === "Payment Received" ||
              invoice.status === "Banked" ||
              invoice.status === "Paid") && (
              <div className="md:col-span-2 bg-card border border-border rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cheque & Settlement Information
                  </h3>
                  {invoice.receipt_number && (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      Receipt: {invoice.receipt_number}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px] mb-1">Cheque / Reference</span>
                    <span className="font-mono font-medium text-foreground">
                      {invoice.cheque_number || invoice.payment_reference || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px] mb-1">Bank Name</span>
                    <span className="font-medium text-foreground">
                      {invoice.bank_name || invoice.payment_method || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px] mb-1">Amount Received</span>
                    <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {fmt(invoice.payment_amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px] mb-1">Payment Date</span>
                    <span className="font-medium text-foreground">
                      {fmtDate(invoice.payment_received_date)}
                    </span>
                  </div>

                  {invoice.status === "Banked" && (
                    <>
                      <div>
                        <span className="text-muted-foreground block text-[11px] mb-1">Bank Cleared Date</span>
                        <span className="font-medium text-foreground">
                          {fmtDate(invoice.banked_at)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px] mb-1">Bank Deposit Ref</span>
                        <span className="font-mono font-medium text-foreground">
                          {invoice.bank_reference || "—"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {invoice.recordedBy && (
                  <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border">
                    Recorded by <span className="text-foreground font-medium">{invoice.recordedBy.name}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Tax Invoice */}
        {activeTab === "tax" && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tax Invoice Schedule
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Statutory tax invoice generated for Sri Lanka Inland Revenue compliance.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="h-8 gap-1.5 text-xs shadow-xs"
              >
                {downloadingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Download PDF
              </Button>
            </div>

            <div className="space-y-2.5 max-w-lg">
              <div className="flex justify-between items-center py-1.5 border-b border-border/50 text-xs">
                <span className="text-muted-foreground">Tax Invoice No</span>
                <span className="font-mono font-medium text-foreground">
                  {invoice.tax_invoice?.tax_invoice_number || `TAX-${invoice.invoice_number}`}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/50 text-xs">
                <span className="text-muted-foreground">Tax Percentage</span>
                <span className="font-medium text-foreground">
                  {invoice.tax_invoice ? `${invoice.tax_invoice.tax_percentage}%` : "18%"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/50 text-xs">
                <span className="text-muted-foreground">Tax Amount</span>
                <span className="font-mono font-medium text-foreground">
                  {fmt(invoice.tax_invoice?.tax_amount || (Number(invoice.invoice_amount || 0) * 0.18))}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/50 text-xs">
                <span className="text-muted-foreground">Base Invoice Amount</span>
                <span className="font-mono font-medium text-foreground">
                  {fmt(invoice.invoice_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 text-sm font-semibold">
                <span className="text-foreground">Total Payable Amount</span>
                <span className="font-mono text-foreground">
                  {fmt(invoice.tax_invoice?.total_amount || (Number(invoice.invoice_amount || 0) * 1.18))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Documents */}
        {activeTab === "documents" && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Supporting Documents
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Signed delivery receipts, customer purchase orders, and specifications.
                </p>
              </div>
              {["Draft", "Tax Generated", "Submitted", "Rejected"].includes(
                invoice.status,
              ) && (
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-xs">
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
                        await api.post(`/invoices/${id}/upload-document`, formData);
                        toast.success("Document uploaded successfully.");
                        loadInvoice();
                      } catch (err) {
                        toast.error("Upload failed.");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                  />
                  <Plus className="w-3.5 h-3.5" />
                  Upload File
                </label>
              )}
            </div>

            <div className="space-y-3">
              {(invoice.documents || []).length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No documents attached yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {invoice.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3.5 bg-muted/40 border border-border rounded-lg group transition-colors hover:bg-muted/70"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {doc.file_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {doc.document_type} · by {doc.uploader?.name ?? "System"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${doc.file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        {["Draft", "Tax Generated", "Rejected"].includes(
                          invoice.status,
                        ) && (
                          <button
                            onClick={async () => {
                              if (confirm("Delete this document?")) {
                                try {
                                  await api.delete(`/invoices/${id}/documents/${doc.id}`);
                                  toast.success("Document deleted.");
                                  loadInvoice();
                                } catch (err) {
                                  toast.error("Delete failed.");
                                }
                              }
                            }}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
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

        {/* Tab 4: Audit Trail */}
        {activeTab === "audit" && showAuditTab && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Audit Trail & Status History
            </h3>
            <AuditTrail invoiceId={id} />
          </div>
        )}
      </div>
    </>
  );
}
