// src/app/tenders/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchTenders,
  createTender,
  updateTender,
  deleteTender,
  fetchCustomers,
} from "@/lib/procurement";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Briefcase,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";

// ── Status config ──────────────────────────────────────────────
const STATUS_COLORS = {
  Open: {
    accent: "from-emerald-400 to-teal-500",
    pill: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Closed: {
    accent: "from-gray-400 to-slate-500",
    pill: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
    dot: "bg-gray-400",
  },
  Won: {
    accent: "from-blue-500 to-indigo-600",
    pill: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  Lost: {
    accent: "from-red-400 to-rose-500",
    pill: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    dot: "bg-red-400",
  },
};
const getStatus = (s) => STATUS_COLORS[s] || STATUS_COLORS.Open;

const fmt = (n) => (n ? `LKR ${Number(n).toLocaleString()}` : "—");

function TenderCard({ tender, onEdit, onDelete }) {
  const st = getStatus(tender.status);
  const budget = Number(tender.budget || 0);
  const awarded = Number(tender.awarded_amount || 0);
  const pct =
    budget > 0 ? Math.min(100, Math.round((awarded / budget) * 100)) : 0;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Left accent bar via gradient top strip */}
      <div className={`h-1 w-full bg-gradient-to-r ${st.accent}`} />
      <div className="p-5">
        {/* Head */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-xs text-gray-400 uppercase tracking-widest">
                {tender.tender_number}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${st.pill}`}
              >
                <span className={`w-1 h-1 rounded-full ${st.dot}`} />
                {tender.status}
              </span>
            </div>
            <h3
              className="font-bold text-gray-900 dark:text-white text-sm leading-snug truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {tender.name}
            </h3>
            {tender.customer?.name && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {tender.customer.name}
              </p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
            <button
              onClick={() => onEdit(tender)}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(tender.id)}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Budget bar */}
        {budget > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Budget</span>
              <span>{pct}% awarded</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${st.accent} transition-all duration-500 rounded-full`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer amounts */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5">
            <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wide mb-0.5">
              Budget
            </div>
            <div className="font-bold text-gray-800 dark:text-gray-200">
              {fmt(tender.budget)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5">
            <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wide mb-0.5">
              Awarded
            </div>
            <div className="font-bold text-gray-800 dark:text-gray-200">
              {fmt(tender.awarded_amount)}
            </div>
          </div>
        </div>

        {/* Dates */}
        {(tender.start_date || tender.end_date) && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>{tender.start_date || "—"}</span>
            <span>→</span>
            <span>{tender.end_date || "—"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-200 dark:bg-gray-700" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl" />
          <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none transition-all text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400";
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
      {label}
    </label>
    {children}
  </div>
);

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    tender_number: "",
    customer_id: "",
    name: "",
    description: "",
    awarded_amount: "",
    budget: "",
    start_date: "",
    end_date: "",
    status: "Open",
  });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const loadTenders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTenders({ page, status: statusFilter, search });
      setTenders(data.data || []);
      setMeta(data.meta || {});
    } catch {
      toast.error("Failed to load tenders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadTenders();
  }, [loadTenders]);
  useEffect(() => {
    fetchCustomers({ page: 1 })
      .then((r) => setCustomers(r.data || []))
      .catch(() => {});
  }, []);

  const openDrawer = (t = null) => {
    setSelectedTender(t);
    setForm(
      t
        ? {
            tender_number: t.tender_number || "",
            customer_id: t.customer_id || "",
            name: t.name || "",
            description: t.description || "",
            awarded_amount: t.awarded_amount || "",
            budget: t.budget || "",
            start_date: t.start_date || "",
            end_date: t.end_date || "",
            status: t.status || "Open",
          }
        : {
            tender_number: "",
            customer_id: "",
            name: "",
            description: "",
            awarded_amount: "",
            budget: "",
            start_date: "",
            end_date: "",
            status: "Open",
          },
    );
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        awarded_amount:
          form.awarded_amount === "" ? 0 : Number(form.awarded_amount),
        budget: form.budget === "" ? 0 : Number(form.budget),
      };
      if (selectedTender) {
        await updateTender(selectedTender.id, payload);
        toast.success("Tender updated");
      } else {
        await createTender(payload);
        toast.success("Tender created");
      }
      setDrawerOpen(false);
      loadTenders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save tender");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTender(id);
      toast.success("Tender deleted");
      setDeleteConfirm(null);
      loadTenders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const totalBudget = tenders.reduce((s, t) => s + Number(t.budget || 0), 0);
  const openCount = tenders.filter((t) => t.status === "Open").length;
  const closedCount = tenders.filter((t) => t.status === "Closed").length;

  return (
    <>
      <div className="min-h-full p-6 space-y-6">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-8 overflow-hidden">
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
              <p className="text-teal-300 text-xs font-bold uppercase tracking-widest mb-1">
                Bid & Contract Management
              </p>
              <h1
                className="text-3xl font-black text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Tenders
              </h1>
              <p className="text-teal-200/60 text-sm mt-1">
                {meta.total ?? tenders.length} total tender
                {(meta.total ?? tenders.length) !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => openDrawer()}
              className="flex items-center gap-2 bg-white hover:bg-teal-50 text-slate-900 px-5 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Plus className="w-4 h-4" />
              Add Tender
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: Briefcase,
              label: "Open",
              value: openCount,
              color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
            },
            {
              icon: CheckCircle,
              label: "Closed",
              value: closedCount,
              color: "bg-gray-100 dark:bg-gray-700 text-gray-500",
            },
            {
              icon: DollarSign,
              label: "Total Budget",
              value:
                totalBudget > 0
                  ? `LKR ${(totalBudget / 1e6).toFixed(1)}M`
                  : "—",
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
              placeholder="Search tenders…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            {["", "Open", "Closed"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${statusFilter === s ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              >
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : tenders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <Briefcase className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No tenders found</p>
            </div>
          ) : (
            tenders.map((t) => (
              <TenderCard
                key={t.id}
                tender={t}
                onEdit={openDrawer}
                onDelete={(id) => setDeleteConfirm(id)}
              />
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
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === p ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tender Form Modal */}
      <FormModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedTender ? "Update Tender" : "New Tender"}
        description={selectedTender ? "Edit tender details" : "Create a new tender"}
        onSubmit={handleSubmit}
        submitText={selectedTender ? "Update" : "Create"}
        isSubmitting={saving}
        size="lg"
      >
        <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tender Number *">
                    <input
                      required
                      value={form.tender_number}
                      onChange={(e) =>
                        setF("tender_number", e.target.value.toUpperCase())
                      }
                      placeholder="SLT/2026/001"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={(e) => setF("status", e.target.value)}
                      className={inputCls}
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </Field>
                </div>
                <Field label="Tender Name *">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setF("name", e.target.value)}
                    placeholder="Brief title"
                    className={inputCls}
                  />
                </Field>
                <Field label="Customer *">
                  <select
                    required
                    value={form.customer_id}
                    onChange={(e) => setF("customer_id", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select customer…</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Description">
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setF("description", e.target.value)}
                    placeholder="Brief description…"
                    className={`${inputCls} resize-none`}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Budget (LKR)">
                    <input
                      type="number"
                      value={form.budget}
                      onChange={(e) => setF("budget", e.target.value)}
                      placeholder="0"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Awarded (LKR)">
                    <input
                      type="number"
                      value={form.awarded_amount}
                      onChange={(e) => setF("awarded_amount", e.target.value)}
                      placeholder="0"
                      className={inputCls}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Start Date">
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setF("start_date", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="End Date">
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setF("end_date", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3
                className="font-black text-gray-900 dark:text-white text-lg"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Delete Tender?
              </h3>
              <p className="text-sm text-gray-500">
                Tenders with attached jobs cannot be deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-black transition-colors shadow-lg shadow-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
