  // src/app/invoices/[id]/page.js
  "use client";

  import { useEffect, useState, useCallback } from "react";
  import { useParams, useRouter } from "next/navigation";
  import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Download,
    Edit2,
    FileText,
    Info,
    Loader2,
    MoreVertical,
    Plus,
    Printer,
    ShieldCheck,
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
    getStatusMeta,
  } from "@/lib/permissions";
  import api from "@/lib/axios";
  import { useAuth } from "@/contexts/AuthContext";

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
    "Tax Generated": "bg-blue-50 text-blue-700 border-blue-200",
    Submitted: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
    "Payment Received": "bg-indigo-50 text-indigo-700 border-indigo-200",
    Banked: "bg-teal-50 text-teal-700 border-teal-200",
    Paid: "bg-teal-50 text-teal-700 border-teal-200", // Legacy
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                <svg
                  className="w-6 h-6"
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
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                  Reject Invoice
                </h3>
                <p className="text-xs text-red-600/60 font-bold">
                  {invoiceNumber}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4 text-left">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Rejection Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Describe the issue clearly..."
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-100 outline-none resize-none"
            />
            <p className="text-[10px] text-gray-400 font-bold text-right uppercase tracking-widest">
              {reason.length}/1000
            </p>
          </div>
          <div className="px-6 py-5 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(reason)}
              disabled={tooShort || loading}
              className="flex-[2] py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all disabled:opacity-50"
            >
              Reject Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RecordPaymentModal (Cheque) ─────────────────────────────────

  function RecordPaymentModal({ invoice, onConfirm, onClose, loading }) {
    const [form, setForm] = useState({
      cheque_number: "",
      bank_name: "",
      payment_amount: invoice.invoice_amount || "",
      payment_received_date: new Date().toISOString().split("T")[0],
    });

    const valid =
      form.cheque_number.trim() && form.bank_name.trim() && form.payment_amount;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/20 px-8 py-6">
            <h3 className="font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-tighter text-xl">
              Record Received Cheque
            </h3>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1 opacity-60">
              Prepare Internal Receipt
            </p>
          </div>
          <div className="p-8 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Cheque Number / Reference
              </label>
              <input
                required
                value={form.cheque_number}
                onChange={(e) =>
                  setForm({ ...form, cheque_number: e.target.value })
                }
                className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Bank Name
              </label>
              <input
                required
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Received Date
                </label>
                <input
                  type="date"
                  value={form.payment_received_date}
                  onChange={(e) =>
                    setForm({ ...form, payment_received_date: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={form.payment_amount}
                  onChange={(e) =>
                    setForm({ ...form, payment_amount: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-100 font-black"
                />
              </div>
            </div>
          </div>
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-white dark:bg-gray-800 rounded-2xl font-bold transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(form)}
              disabled={!valid || loading}
              className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MarkAsBankedModal ───────────────────────────────────────────

  function MarkAsBankedModal({ onConfirm, onClose, loading }) {
    const [form, setForm] = useState({
      banked_at: new Date().toISOString().split("T")[0],
      bank_reference: "",
    });

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="bg-teal-50 dark:bg-teal-900/10 p-8 text-center space-y-2">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 mx-auto">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="font-black text-teal-900 dark:text-teal-400 uppercase tracking-tighter text-xl">
              Mark as Banked
            </h3>
            <p className="text-xs text-teal-600/70 font-medium">
              Verify that the funds are cleared in the corporate account
            </p>
          </div>
          <div className="p-8 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Banking Date
              </label>
              <input
                type="date"
                value={form.banked_at}
                onChange={(e) => setForm({ ...form, banked_at: e.target.value })}
                className="w-full bg-gray-50 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-teal-100 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Bank Reference (Optional)
              </label>
              <input
                value={form.bank_reference}
                onChange={(e) =>
                  setForm({ ...form, bank_reference: e.target.value })
                }
                placeholder="DEPOSIT-REF-..."
                className="w-full bg-gray-50 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-teal-100 font-bold"
              />
            </div>
          </div>
          <div className="p-8 pt-0 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(form)}
              disabled={loading}
              className="flex-[2] py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-200"
            >
              Confirm Banking
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
    "Payment Received": { bg: "bg-indigo-100", icon: "🧾" },
    Banked: { bg: "bg-teal-100", icon: "🏦" },
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
    const STEPS = [
      "Draft",
      "Tax Generated",
      "Submitted",
      "Approved",
      "Payment Received",
      "Banked",
    ];
    const current = invoice.status === "Rejected" ? "Submitted" : invoice.status;
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
              <span className="text-gray-500">Payment recorded by</span>
              <span className="font-medium text-indigo-700">
                {invoice.recordedBy.name} ·{" "}
                {fmtDateTime(invoice.payment_received_date)}
              </span>
            </div>
          )}
          {invoice.status === "Banked" && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Banked at</span>
              <span className="font-medium text-teal-700">
                {fmtDateTime(invoice.banked_at)}
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
    const [showRecordPayment, setShowRecordPayment] = useState(false);
    const [showMarkBanked, setShowMarkBanked] = useState(false);

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
        await api.post(`/invoices/${id}/reject`, { reason: reason });
        showToast("Invoice rejected.", "warning");
        setShowReject(false);
        loadInvoice();
      } catch (e) {
        showToast(e.response?.data?.message ?? "Reject failed.", "error");
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
        showToast("Payment recorded. Internal receipt generated.");
        setShowRecordPayment(false);
        loadInvoice();
      } catch (e) {
        showToast(
          e.response?.data?.message ?? "Failed to record payment.",
          "error",
        );
      } finally {
        setActionLoading(false);
      }
    };

    const handleMarkBanked = async (data) => {
      setActionLoading(true);
      try {
        await api.post(`/invoices/${id}/mark-banked`, data);
        showToast("Invoice marked as banked.");
        setShowMarkBanked(false);
        loadInvoice();
      } catch (e) {
        showToast(
          e.response?.data?.message ?? "Failed to mark as banked.",
          "error",
        );
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
      invoice.status === "Payment Received" && canMarkBanked(permissions);
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
