"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchContractors,
  createContractor,
  updateContractor,
  deleteContractor,
} from "@/lib/contractor";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Phone,
  Mail,
  Building2,
  Star,
  Banknote,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Shield,
  Award,
} from "lucide-react";

// ── helpers ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Active: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Blacklisted: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
};

const avatarGrads = [
  "from-orange-500 to-rose-500",
  "from-violet-500 to-purple-700",
  "from-teal-500 to-cyan-600",
  "from-amber-500 to-orange-500",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-green-600",
];
const getGrad = (name = "") =>
  avatarGrads[name.charCodeAt(0) % avatarGrads.length];

function StarRating({ rating, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange && onChange(s)}
          className={`p-1.5 rounded-lg transition-all ${rating >= s ? "bg-amber-100 dark:bg-amber-900/30 text-amber-500" : "bg-gray-100 dark:bg-gray-700 text-gray-300"}`}
        >
          <Star className={`w-4 h-4 ${rating >= s ? "fill-current" : ""}`} />
        </button>
      ))}
    </div>
  );
}

function ContractorCard({ contractor, onEdit, onDelete }) {
  const grad = getGrad(contractor.name);
  const status = STATUS_CONFIG[contractor.status] || STATUS_CONFIG.Active;
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className={`h-1 w-full bg-gradient-to-r ${grad}`} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-lg font-black flex-shrink-0 shadow-lg`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {contractor.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3
                className="font-bold text-gray-900 dark:text-white text-sm truncate"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {contractor.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {contractor.contact_person || "No contact"}
              </p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(contractor)}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(contractor.id)}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i <= (contractor.rating || 0) ? "text-amber-400 fill-current" : "text-gray-200 dark:text-gray-700"}`}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">
            ({contractor.rating || 0}/5)
          </span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
          {contractor.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span className="truncate">{contractor.email}</span>
            </div>
          )}
          {contractor.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span>{contractor.phone}</span>
            </div>
          )}
          {contractor.bank_name && (
            <div className="flex items-center gap-2">
              <Banknote className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span className="truncate">{contractor.bank_name}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${status.bg} ${status.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {contractor.status || "Active"}
          </span>
          {contractor.notes && (
            <span className="text-[10px] text-gray-400 italic truncate ml-2 max-w-[100px]">
              {contractor.notes}
            </span>
          )}
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
          </div>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded" />
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-4/5" />
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400";

function Field({ label, children, col2 }) {
  return (
    <div className={`space-y-1.5 ${col2 ? "col-span-2" : ""}`}>
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    bank_name: "",
    bank_account_number: "",
    tax_id: "",
    status: "Active",
    rating: 0,
    notes: "",
  });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const loadContractors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchContractors();
      setContractors(data || []);
    } catch {
      toast.error("Failed to load contractors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContractors();
  }, [loadContractors]);

  const openDrawer = (c = null) => {
    setSelectedContractor(c);
    setForm(
      c
        ? {
            name: c.name || "",
            contact_person: c.contact_person || "",
            email: c.email || "",
            phone: c.phone || "",
            address: c.address || "",
            bank_name: c.bank_name || "",
            bank_account_number: c.bank_account_number || "",
            tax_id: c.tax_id || "",
            status: c.status || "Active",
            rating: c.rating || 0,
            notes: c.notes || "",
          }
        : {
            name: "",
            contact_person: "",
            email: "",
            phone: "",
            address: "",
            bank_name: "",
            bank_account_number: "",
            tax_id: "",
            status: "Active",
            rating: 0,
            notes: "",
          },
    );
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedContractor) {
        await updateContractor(selectedContractor.id, form);
        toast.success("Contractor updated");
      } else {
        await createContractor(form);
        toast.success("Contractor created");
      }
      setDrawerOpen(false);
      loadContractors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save contractor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContractor(id);
      toast.success("Contractor deleted");
      setDeleteConfirm(null);
      loadContractors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const filtered = contractors.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.name?.toLowerCase().includes(q) ||
      c.contact_person?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = contractors.filter(
    (c) => c.status !== "Blacklisted",
  ).length;
  const avgRating = contractors.length
    ? (
        contractors.reduce((s, c) => s + (c.rating || 0), 0) /
        contractors.length
      ).toFixed(1)
    : "0.0";

  return (
    <>
      <div className="min-h-full p-6 space-y-6">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-orange-900 via-rose-900 to-slate-900 rounded-3xl p-8 overflow-hidden">
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
              <p className="text-orange-300 text-xs font-bold uppercase tracking-widest mb-1">
                Contractor Registry
              </p>
              <h1
                className="text-3xl font-black text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Contractors
              </h1>
              <p className="text-orange-200/60 text-sm mt-1">
                {contractors.length} service provider
                {contractors.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => openDrawer()}
              className="flex items-center gap-2 bg-white hover:bg-orange-50 text-slate-900 px-5 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Plus className="w-4 h-4" />
              Add Contractor
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: HardHat,
              label: "Total",
              value: contractors.length,
              color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600",
            },
            {
              icon: Shield,
              label: "Active",
              value: activeCount,
              color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
            },
            {
              icon: Award,
              label: "Avg Rating",
              value: `${avgRating}★`,
              color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
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
                className="text-2xl font-bold text-gray-900 dark:text-white"
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

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contractors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            {["", "Active", "Blacklisted"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${statusFilter === s ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
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
          ) : filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <HardHat className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No contractors found</p>
            </div>
          ) : (
            filtered.map((c) => (
              <ContractorCard
                key={c.id}
                contractor={c}
                onEdit={openDrawer}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="bg-gradient-to-r from-orange-600 to-rose-600 px-6 py-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-[10px] font-black uppercase tracking-widest mb-1">
                    {selectedContractor ? "Edit" : "Create New"}
                  </p>
                  <h2
                    className="text-xl font-black text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {selectedContractor
                      ? "Update Contractor"
                      : "Add Contractor"}
                  </h2>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <Field label="Company Name *" col2={false}>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setF("name", e.target.value)}
                    placeholder="e.g. ABC Construction"
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Contact Person">
                    <input
                      value={form.contact_person}
                      onChange={(e) => setF("contact_person", e.target.value)}
                      placeholder="Full name"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={(e) => setF("status", e.target.value)}
                      className={inputCls}
                    >
                      <option value="Active">Active</option>
                      <option value="Blacklisted">Blacklisted</option>
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setF("email", e.target.value)}
                      placeholder="email@co.com"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      value={form.phone}
                      onChange={(e) => setF("phone", e.target.value)}
                      placeholder="+94 77…"
                      className={inputCls}
                    />
                  </Field>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    Banking Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Bank Name">
                      <input
                        value={form.bank_name}
                        onChange={(e) => setF("bank_name", e.target.value)}
                        placeholder="e.g. BOC"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Account No.">
                      <input
                        value={form.bank_account_number}
                        onChange={(e) =>
                          setF("bank_account_number", e.target.value)
                        }
                        placeholder="0000000000"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>
                <Field label="Tax ID">
                  <input
                    value={form.tax_id}
                    onChange={(e) => setF("tax_id", e.target.value)}
                    placeholder="VAT-…"
                    className={inputCls}
                  />
                </Field>
                <Field label="Address">
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setF("address", e.target.value)}
                    className={`${inputCls} resize-none`}
                  />
                </Field>
                <Field label="Performance Rating">
                  <StarRating
                    rating={form.rating}
                    onChange={(v) => setF("rating", v)}
                  />
                </Field>
                <Field label="Internal Notes">
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setF("notes", e.target.value)}
                    placeholder="Any internal notes…"
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 text-white text-sm font-black shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {saving
                    ? "Saving…"
                    : selectedContractor
                      ? "Update Contractor"
                      : "Add Contractor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                Delete Contractor?
              </h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
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
