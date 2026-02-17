// src/app/invoices/[id]/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import {
  canApproveInvoice,
  canRejectInvoice,
  canMarkPaid,
  canSubmitInvoice,
  canViewAuditTrail,
  canEditInvoice,
  getStatusMeta,
} from "@/lib/permissions";

// ─── Helpers ────────────────────────────────────────────────────

function fmt(amount) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── StatusBadge ────────────────────────────────────────────────

const STATUS_COLORS = {
  Draft: "bg-gray-100 text-gray-700 border-gray-200",
  "Tax Generated": "bg-blue-50  text-blue-700  border-blue-200",
  Submitted: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50   text-red-700   border-red-200",
  Paid: "bg-teal-50  text-teal-700  border-teal-200",
};

function StatusBadge({ status }) {
  const cls =
    STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

// ─── RejectModal ────────────────────────────────────────────────

function RejectModal({ invoiceNumber, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState("");
  const tooShort = reason.trim().length < 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Reject Invoice</h3>
              <p className="text-sm text-gray-500">{invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Describe the issue clearly so Procurement can correct it and resubmit…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none transition"
          />
          <div className="flex justify-between mt-1.5">
            {tooShort && reason.length > 0 ? (
              <p className="text-xs text-red-500">
                Minimum 10 characters required
              </p>
            ) : (
              <span />
            )}
            <p className="text-xs text-gray-400 ml-auto">
              {reason.length}/1000
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={tooShort || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition
                       disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Reject Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MarkPaidModal ───────────────────────────────────────────────

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Cheque",
  "Cash",
  "Online Transfer",
  "RTGS",
  "SLIPS",
];

function MarkPaidModal({ invoiceNumber, onConfirm, onClose, loading }) {
  const [form, setForm] = useState({
    payment_reference: "",
    payment_method: "",
    payment_notes: "",
  });

  const valid = form.payment_reference.trim() && form.payment_method;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-teal-50 border-b border-teal-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Record Payment</h3>
              <p className="text-sm text-gray-500">{invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Payment Reference <span className="text-red-500">*</span>
            </label>
            <input
              value={form.payment_reference}
              onChange={(e) => set("payment_reference", e.target.value)}
              placeholder="e.g. TXN-2026-00123"
              maxLength={255}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={form.payment_method}
              onChange={(e) => set("payment_method", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition bg-white"
            >
              <option value="">Select method…</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.payment_notes}
              onChange={(e) => set("payment_notes", e.target.value)}
              rows={3}
              placeholder="Any additional payment details…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(form)}
            disabled={!valid || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition
                       disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Record Payment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AuditTrail ──────────────────────────────────────────────────

const TIMELINE_ICONS = {
  created: { bg: "bg-gray-100", icon: "📄" },
  Submitted: { bg: "bg-amber-100", icon: "📤" },
  Approved: { bg: "bg-green-100", icon: "✅" },
  Rejected: { bg: "bg-red-100", icon: "❌" },
  Paid: { bg: "bg-teal-100", icon: "💳" },
  "Tax Generated": { bg: "bg-blue-100", icon: "🧾" },
};

function AuditTrail({ invoiceId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/invoices/${invoiceId}/audit-trail`)
      .then((r) => setHistory(r.data))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!history.length) {
    return <p className="text-sm text-gray-400">No history yet.</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 ml-3">
      {history.map((entry, i) => {
        const meta = TIMELINE_ICONS[entry.new_status] ?? {
          bg: "bg-gray-100",
          icon: "🔄",
        };
        return (
          <li key={entry.id ?? i} className="mb-6 ml-5">
            <span
              className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white ${meta.bg} text-base`}
            >
              {meta.icon}
            </span>

            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {entry.old_status && (
                    <>
                      <StatusBadge status={entry.old_status} />
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </>
                  )}
                  <StatusBadge status={entry.new_status} />
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {fmtDateTime(entry.created_at)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-1.5">
                By{" "}
                <span className="font-medium text-gray-800">
                  {entry.user?.name ?? "System"}
                </span>
              </p>

              {entry.reason && (
                <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm text-red-700">
                  <span className="font-medium">Reason:</span> {entry.reason}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── WorkflowPanel ───────────────────────────────────────────────

function WorkflowPanel({ invoice }) {
  const STEPS = ["Draft", "Tax Generated", "Submitted", "Approved", "Paid"];
  const current =
    invoice.status === "Rejected" ? invoice.status : invoice.status;
  const currentIdx = STEPS.indexOf(current);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Workflow Progress
      </h3>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-6">
        {STEPS.map((step, i) => {
          const done = currentIdx > i;
          const active = currentIdx === i && current !== "Rejected";
          const rejected = current === "Rejected" && step === "Submitted";

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${done ? "bg-green-500  border-green-500  text-white" : ""}
                  ${active ? "bg-blue-500   border-blue-500   text-white scale-110" : ""}
                  ${rejected ? "bg-red-400    border-red-400    text-white" : ""}
                  ${!done && !active && !rejected ? "bg-gray-100 border-gray-200 text-gray-400" : ""}
                `}
                >
                  {done ? "✓" : rejected ? "✗" : i + 1}
                </div>
                <span
                  className={`text-xs mt-1 text-center leading-tight hidden sm:block
                  ${done ? "text-green-600 font-medium" : active ? "text-blue-600 font-semibold" : "text-gray-400"}`}
                  style={{ maxWidth: 56 }}
                >
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 rounded ${done ? "bg-green-400" : "bg-gray-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Rejection banner */}
      {current === "Rejected" && invoice.rejection_reason && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
            Rejected by Finance
          </p>
          <p className="text-sm text-red-800">{invoice.rejection_reason}</p>
          <p className="text-xs text-red-500 mt-1">
            Rejected by {invoice.rejecter?.name} on{" "}
            {fmtDateTime(invoice.rejected_at)}
          </p>
        </div>
      )}

      {/* Who did what */}
      <div className="space-y-2">
        {invoice.submitter && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Submitted by</span>
            <span className="font-medium text-gray-700">
              {invoice.submitter.name} · {fmtDateTime(invoice.submitted_at)}
            </span>
          </div>
        )}
        {invoice.approver && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Approved by</span>
            <span className="font-medium text-green-700">
              {invoice.approver.name} · {fmtDateTime(invoice.approved_at)}
            </span>
          </div>
        )}
        {invoice.rejecter && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Rejected by</span>
            <span className="font-medium text-red-700">
              {invoice.rejecter.name} · {fmtDateTime(invoice.rejected_at)}
            </span>
          </div>
        )}
        {invoice.recordedBy && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Paid recorded by</span>
            <span className="font-medium text-teal-700">
              {invoice.recordedBy.name} · {fmtDateTime(invoice.paid_at)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  // Modals
  const [showReject, setShowReject] = useState(false);
  const [showMarkPaid, setShowMarkPaid] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

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
      showToast("Invoice submitted to Finance.");
      loadInvoice();
    } catch (e) {
      showToast(e.response?.data?.message ?? "Submit failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.post(`/invoices/${id}/approve`);
      showToast("Invoice approved.");
      loadInvoice();
    } catch (e) {
      showToast(e.response?.data?.message ?? "Approve failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    try {
      await api.post(`/invoices/${id}/reject`, { rejection_reason: reason });
      showToast("Invoice rejected.", "warning");
      setShowReject(false);
      loadInvoice();
    } catch (e) {
      showToast(e.response?.data?.message ?? "Reject failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (data) => {
    setActionLoading(true);
    try {
      await api.post(`/invoices/${id}/mark-paid`, data);
      showToast("Payment recorded. Invoice marked as Paid.");
      setShowMarkPaid(false);
      loadInvoice();
    } catch (e) {
      showToast(e.response?.data?.message ?? "Mark paid failed.", "error");
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
  const showMarkPaidBtn =
    invoice.status === "Approved" && canMarkPaid(permissions);
  const showEditBtn = invoice.status === "Draft" && canEditInvoice(permissions);
  const showAuditTab = canViewAuditTrail(permissions);

  const hasActions =
    showSubmitBtn ||
    showApproveBtn ||
    showRejectBtn ||
    showMarkPaidBtn ||
    showEditBtn;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in
          ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "warning"
                ? "bg-amber-500 text-white"
                : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {showReject && (
        <RejectModal
          invoiceNumber={invoice.invoice_number}
          onConfirm={handleReject}
          onClose={() => setShowReject(false)}
          loading={actionLoading}
        />
      )}
      {showMarkPaid && (
        <MarkPaidModal
          invoiceNumber={invoice.invoice_number}
          onConfirm={handleMarkPaid}
          onClose={() => setShowMarkPaid(false)}
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
              {showMarkPaidBtn && (
                <button
                  onClick={() => setShowMarkPaid(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                >
                  Record Payment
                </button>
              )}
            </div>
          )}
        </div>

        {/* Workflow panel always visible */}
        <WorkflowPanel invoice={invoice} />

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1">
            {["details", "tax", ...(showAuditTab ? ["audit"] : [])].map(
              (tab) => (
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
              ),
            )}
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
                  {invoice.customer?.billing_address ?? ""}
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Purchase Order
                </h3>
                <p className="text-sm font-medium text-gray-800">
                  {invoice.purchase_order?.po_number ?? "—"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {fmt(invoice.purchase_order?.po_amount)}
                </p>
              </div>
            </div>

            {/* Payment Details (only if Paid) */}
            {invoice.status === "Paid" && (
              <div className="md:col-span-2 bg-teal-50 border border-teal-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-teal-800 mb-3">
                  Payment Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    ["Reference", invoice.payment_reference],
                    ["Method", invoice.payment_method],
                    ["Paid At", fmtDateTime(invoice.paid_at)],
                    ["Recorded By", invoice.recordedBy?.name],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-teal-600 mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-teal-900">
                        {value ?? "—"}
                      </p>
                    </div>
                  ))}
                  {invoice.payment_notes && (
                    <div className="col-span-full">
                      <p className="text-xs text-teal-600 mb-0.5">Notes</p>
                      <p className="text-sm text-teal-800">
                        {invoice.payment_notes}
                      </p>
                    </div>
                  )}
                </div>
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
