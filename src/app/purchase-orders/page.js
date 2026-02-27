// src/app/purchase-orders/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  fetchJobs,
  fetchCustomers,
  fetchTenders,
} from "@/lib/procurement";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  FileText,
  Target,
  User,
  Download,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Clock,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";
import axios from "@/lib/axios";

const PO_STATUS = {
  Draft: {
    pill: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
    dot: "bg-gray-400",
    accent: "from-gray-300 to-slate-300",
  },
  Approved: {
    pill: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    accent: "from-blue-500 to-indigo-500",
  },
  Sent: {
    pill: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
    dot: "bg-violet-500",
    accent: "from-violet-500 to-purple-500",
  },
  Received: {
    pill: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    accent: "from-emerald-400 to-teal-500",
  },
  Cancelled: {
    pill: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    dot: "bg-red-400",
    accent: "from-red-400 to-rose-400",
  },
};
const getPS = (s) => PO_STATUS[s] || PO_STATUS.Draft;

function POCard({ po, onEdit, onDelete, onDownload }) {
  const st = getPS(po.status);
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className={`h-1 w-full bg-gradient-to-r ${st.accent}`} />
      <div className="p-5">
        {/* Head */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-xs text-gray-400 uppercase tracking-widest">
                {po.po_number}
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${st.pill}`}
            >
              <span className={`w-1 h-1 rounded-full ${st.dot}`} />
              {po.status}
            </span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
            <button
              onClick={() => onDownload(po.id)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit(po)}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(po.id)}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
          {po.job?.name && (
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                {po.job.name}
              </span>
            </div>
          )}
          {po.customer?.name && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{po.customer.name}</span>
            </div>
          )}
          {po.po_date && (
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{po.po_date}</span>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="pt-3 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Amount
          </span>
          <span
            className="text-base font-black text-gray-900 dark:text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LKR {Number(po.po_amount || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-200 dark:bg-gray-700" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-4/5" />
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-2/3" />
        <div className="h-px bg-gray-100 dark:bg-gray-700" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 ml-auto" />
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400";
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
      {label}
    </label>
    {children}
  </div>
);

export default function POPage() {
  const [pos, setPos] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    po_number: "",
    job_id: "",
    tender_id: "",
    customer_id: "",
    po_amount: "",
    po_date: "",
    po_description: "",
    billing_address: "",
    status: "Draft",
  });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const loadPOs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPurchaseOrders({ page, search });
      setPos(data.data || []);
      setMeta(data.meta || {});
    } catch {
      toast.error("Failed to load POs");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadPOs();
  }, [loadPOs]);
  useEffect(() => {
    Promise.all([
      fetchJobs({ page: 1 }),
      fetchCustomers({ page: 1 }),
      fetchTenders({ page: 1 }),
    ])
      .then(([j, c, t]) => {
        setJobs(j.data || []);
        setCustomers(c.data || []);
        setTenders(t.data || []);
      })
      .catch(() => {});
  }, []);

  const openDrawer = (po = null) => {
    setSelectedPO(po);
    setForm(
      po
        ? {
            po_number: po.po_number || "",
            job_id: po.job_id || "",
            tender_id: po.tender_id || "",
            customer_id: po.customer_id || "",
            po_amount: po.po_amount || "",
            po_date: po.po_date || "",
            po_description: po.po_description || "",
            billing_address: po.billing_address || "",
            status: po.status || "Draft",
          }
        : {
            po_number: "",
            job_id: "",
            tender_id: "",
            customer_id: "",
            po_amount: "",
            po_date: "",
            po_description: "",
            billing_address: "",
            status: "Draft",
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
        po_amount: form.po_amount === "" ? 0 : Number(form.po_amount),
      };
      if (selectedPO) {
        await updatePurchaseOrder(selectedPO.id, payload);
        toast.success("PO updated");
      } else {
        await createPurchaseOrder(payload);
        toast.success("PO issued");
      }
      setDrawerOpen(false);
      loadPOs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save PO");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePurchaseOrder(id);
      toast.success("PO deleted");
      setDeleteConfirm(null);
      loadPOs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const downloadPO = async (id) => {
    try {
      const res = await axios.get(`/purchase-orders/${id}/download-pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `PO-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error("PDF download failed");
    }
  };

  const total = meta.total ?? pos.length;
  const drafted = pos.filter((p) => p.status === "Draft").length;
  const approved = pos.filter((p) => p.status === "Approved").length;
  const totalAmt = pos.reduce((s, p) => s + Number(p.po_amount || 0), 0);

  return (
    <>
      <div className="min-h-full p-6 space-y-6">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 rounded-3xl p-8 overflow-hidden">
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
              <p className="text-violet-300 text-xs font-bold uppercase tracking-widest mb-1">
                Vendor Commitments
              </p>
              <h1
                className="text-3xl font-black text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Purchase Orders
              </h1>
              <p className="text-violet-200/60 text-sm mt-1">
                {total} order{total !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => openDrawer()}
              className="flex items-center gap-2 bg-white hover:bg-violet-50 text-slate-900 px-5 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Plus className="w-4 h-4" />
              Issue PO
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              icon: ShoppingCart,
              label: "Total POs",
              value: total,
              color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600",
            },
            {
              icon: Clock,
              label: "Drafts",
              value: drafted,
              color: "bg-gray-100 dark:bg-gray-700 text-gray-500",
            },
            {
              icon: CheckCircle,
              label: "Approved",
              value: approved,
              color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
            },
            {
              icon: DollarSign,
              label: "Total Value",
              value: totalAmt > 0 ? `LKR ${(totalAmt / 1e6).toFixed(1)}M` : "—",
              color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
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

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search purchase orders…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 shadow-sm"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : pos.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No purchase orders found</p>
            </div>
          ) : (
            pos.map((p) => (
              <POCard
                key={p.id}
                po={p}
                onEdit={openDrawer}
                onDelete={(id) => setDeleteConfirm(id)}
                onDownload={downloadPO}
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
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === p ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
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

      {/* PO Form Modal */}
      <FormModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedPO ? "Update PO" : "Issue Purchase Order"}
        description={selectedPO ? "Edit purchase order details" : "Issue a new purchase order"}
        onSubmit={handleSubmit}
        submitText={selectedPO ? "Update" : "Issue"}
        isSubmitting={saving}
        size="lg"
      >
        <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="PO Number *">
                    <input
                      required
                      value={form.po_number}
                      onChange={(e) => setF("po_number", e.target.value)}
                      placeholder="PO/001/2026"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="PO Date *">
                    <input
                      required
                      type="date"
                      value={form.po_date}
                      onChange={(e) => setF("po_date", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field label="Project Job *">
                  <select
                    required
                    value={form.job_id}
                    onChange={(e) => {
                      const j = jobs.find(
                        (j) => j.id === Number(e.target.value),
                      );
                      setForm((f) => ({
                        ...f,
                        job_id: e.target.value,
                        tender_id: j?.tender_id || "",
                        customer_id: j?.customer_id || f.customer_id,
                      }));
                    }}
                    className={inputCls}
                  >
                    <option value="">Select job…</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Customer *">
                    <select
                      required
                      value={form.customer_id}
                      onChange={(e) => setF("customer_id", e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select…</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={(e) => setF("status", e.target.value)}
                      className={inputCls}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </Field>
                </div>
                <Field label="Amount (LKR) *">
                  <input
                    required
                    type="number"
                    value={form.po_amount}
                    onChange={(e) => setF("po_amount", e.target.value)}
                    placeholder="0"
                    className={inputCls}
                  />
                </Field>
                <Field label="Billing Address">
                  <textarea
                    rows={2}
                    value={form.billing_address}
                    onChange={(e) => setF("billing_address", e.target.value)}
                    placeholder="Billing address…"
                    className={`${inputCls} resize-none`}
                  />
                </Field>
                <Field label="Description / Terms">
                  <textarea
                    rows={3}
                    value={form.po_description}
                    onChange={(e) => setF("po_description", e.target.value)}
                    placeholder="PO details or terms…"
                    className={`${inputCls} resize-none`}
                  />
                </Field>
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
                Delete PO?
              </h3>
              <p className="text-sm text-gray-500">
                POs with linked invoices cannot be deleted.
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
