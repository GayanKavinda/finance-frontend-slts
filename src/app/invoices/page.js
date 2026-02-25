// app/invoices/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchInvoices, downloadInvoicePdf } from "@/lib/invoice";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  canEditInvoice,
  canSubmitInvoice,
  canApproveInvoice,
  canRejectInvoice,
} from "@/lib/permissions";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Download,
  Edit2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Receipt,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
} from "lucide-react";

const INV_STATUS = {
  Draft: {
    pill: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
    dot: "bg-gray-400",
  },
  "Tax Generated": {
    pill: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  Submitted: {
    pill: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  Approved: {
    pill: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  Rejected: {
    pill: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    dot: "bg-red-400",
  },
  "Payment Received": {
    pill: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400",
    dot: "bg-teal-500",
  },
  Banked: {
    pill: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
};
const getInvStatus = (s) => INV_STATUS[s] || INV_STATUS.Draft;

function InvoiceStatusPill({ status }) {
  const cfg = getInvStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${cfg.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
      </div>
      <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full w-24" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
    </div>
  );
}

const STATUS_FILTERS = [
  "",
  "Draft",
  "Tax Generated",
  "Submitted",
  "Approved",
  "Rejected",
  "Payment Received",
  "Banked",
];

export default function InvoicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchInvoices({ page, status, search });
      setInvoices(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    let mounted = true;
    loadInvoices().then(() => {
      if (!mounted) return;
    });
    return () => {
      mounted = false;
    };
  }, [loadInvoices]);

  const total = meta.total ?? invoices.length;
  const banked = invoices.filter((i) => i.status === "Banked").length;
  const pending = invoices.filter(
    (i) => !["Banked", "Payment Received"].includes(i.status),
  ).length;
  const totalValue = invoices.reduce(
    (s, i) => s + Number(i.invoice_amount || 0),
    0,
  );

  return (
    <div className="min-h-full p-6 space-y-6">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-cyan-900 via-sky-900 to-slate-900 rounded-3xl p-8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-cyan-300 text-xs font-bold uppercase tracking-widest mb-1">
              Revenue Tracking
            </p>
            <h1
              className="text-3xl font-black text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Invoices
            </h1>
            <p className="text-cyan-200/60 text-sm mt-1">
              {total} invoice{total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: Receipt,
            label: "Total",
            value: total,
            color: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600",
          },
          {
            icon: Clock,
            label: "Pending",
            value: pending,
            color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
          },
          {
            icon: CheckCircle,
            label: "Banked",
            value: banked,
            color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
          },
          {
            icon: DollarSign,
            label: "Total Value",
            value:
              totalValue > 0 ? `LKR ${(totalValue / 1e6).toFixed(1)}M` : "—",
            color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div
              className="text-xl font-bold text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {value}
            </div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoice number…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 shadow-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "",
            "Draft",
            "Submitted",
            "Approved",
            "Payment Received",
            "Banked",
          ].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${status === s ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Receipt className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No invoices found</p>
          </div>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.id}
              onClick={() => router.push(`/invoices/${inv.id}`)}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="flex items-center gap-4 p-5">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-black text-gray-900 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {inv.invoice_number}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                      {new Date(inv.invoice_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {inv.customer?.name}
                    {inv.receipt_number && (
                      <span className="ml-2 text-indigo-500 font-bold">
                        {inv.receipt_number}
                      </span>
                    )}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right hidden sm:block">
                  <div
                    className="font-black text-gray-900 dark:text-white text-sm"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    LKR{" "}
                    {Number(inv.invoice_amount || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>

                {/* Status */}
                <InvoiceStatusPill status={inv.status} />

                {/* Actions */}
                <div
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    title="Download PDF"
                    className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors"
                    onClick={() => downloadInvoicePdf(inv.id)}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {inv.status === "Draft" &&
                    canEditInvoice(user?.permissions) && (
                      <button
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 rounded-lg transition-colors"
                        onClick={() => router.push(`/invoices/${inv.id}/edit`)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-gray-600 dark:text-gray-400 px-3">
            Page {meta.current_page || page} of {meta.last_page || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page >= meta.last_page}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
