"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/lib/procurement";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  User as UserIcon,
  Building2,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  FileText,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────
const avatarColor = (name = "") => {
  const colors = [
    ["from-violet-500 to-purple-600", "text-white"],
    ["from-blue-500 to-cyan-600", "text-white"],
    ["from-emerald-500 to-teal-600", "text-white"],
    ["from-rose-500 to-pink-600", "text-white"],
    ["from-amber-500 to-orange-600", "text-white"],
    ["from-indigo-500 to-blue-600", "text-white"],
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

// ─── StatCard ────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div
        className="text-2xl font-bold text-gray-900 dark:text-white"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </div>
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

// ─── CustomerCard ───────────────────────────────────────────────
function CustomerCard({ customer, onEdit, onDelete }) {
  const [grad, textCls] = avatarColor(customer.name);
  const initial = customer.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${grad}`} />
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-lg font-black ${textCls} shadow-lg flex-shrink-0`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <h3
                className="font-bold text-gray-900 dark:text-white truncate text-sm leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {customer.name}
              </h3>
              {customer.contact_person && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {customer.contact_person}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(customer)}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(customer.id)}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2">
          {customer.email && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.billing_address && (
            <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{customer.billing_address}</span>
            </div>
          )}
        </div>

        {/* Footer chips */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50 dark:border-gray-700">
          {customer.tax_number ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
              <Receipt className="w-2.5 h-2.5" />
              VAT Registered
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-500 text-[10px] font-bold uppercase tracking-wide">
              No VAT
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-200 dark:bg-gray-700" />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2 flex-1">
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-full" />
          <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

// ─── Field ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400";

// ─── Main Page ───────────────────────────────────────────────────
export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    billing_address: "",
    tax_number: "",
    contact_person: "",
  });

  const setF = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers({ page, search });
      setCustomers(data.data || []);
      setMeta(data.meta || {});
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const openDrawer = (customer = null) => {
    setSelectedCustomer(customer);
    setForm(
      customer
        ? {
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
            billing_address: customer.billing_address || "",
            tax_number: customer.tax_number || "",
            contact_person: customer.contact_person || "",
          }
        : {
            name: "",
            email: "",
            phone: "",
            billing_address: "",
            tax_number: "",
            contact_person: "",
          },
    );
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, form);
        toast.success("Customer updated");
      } else {
        await createCustomer(form);
        toast.success("Customer created");
      }
      setDrawerOpen(false);
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      toast.success("Customer deleted");
      setDeleteConfirm(null);
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const total = meta.total ?? customers.length;
  const vatCount = customers.filter((c) => c.tax_number).length;

  return (
    <>
      <div className="min-h-full p-6 space-y-6">
        {/* ── Hero Header ── */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 overflow-hidden">
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
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">
                Client Registry
              </p>
              <h1
                className="text-3xl font-black text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Customers
              </h1>
              <p className="text-blue-200/60 text-sm mt-1">
                {total} client{total !== 1 ? "s" : ""} registered
              </p>
            </div>
            <button
              onClick={() => openDrawer()}
              className="flex items-center gap-2 bg-white hover:bg-blue-50 text-slate-900 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl hover:shadow-blue-500/20 hover:scale-105"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
          </div>
        </div>

        {/* ── KPI Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            label="Total Clients"
            value={total}
            color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={Receipt}
            label="VAT Registered"
            value={vatCount}
            color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={TrendingUp}
            label="This Page"
            value={customers.length}
            color="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
          />
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm"
          />
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : customers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <Users className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No customers found</p>
              <button
                onClick={() => openDrawer()}
                className="mt-3 text-blue-600 text-sm font-medium hover:underline"
              >
                Add your first customer
              </button>
            </div>
          ) : (
            customers.map((c) => (
              <CustomerCard
                key={c.id}
                customer={c}
                onEdit={openDrawer}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === p ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Right Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">
                    {selectedCustomer ? "Edit" : "Create New"}
                  </p>
                  <h2
                    className="text-xl font-black text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {selectedCustomer ? "Update Customer" : "Add Customer"}
                  </h2>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                <Field label="Customer Name *">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setF("name", e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setF("email", e.target.value)}
                      placeholder="email@company.com"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      value={form.phone}
                      onChange={(e) => setF("phone", e.target.value)}
                      placeholder="+94 77 …"
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field label="Contact Person">
                  <input
                    value={form.contact_person}
                    onChange={(e) => setF("contact_person", e.target.value)}
                    placeholder="Full name"
                    className={inputCls}
                  />
                </Field>
                <Field label="Billing Address *">
                  <textarea
                    required
                    rows={3}
                    value={form.billing_address}
                    onChange={(e) => setF("billing_address", e.target.value)}
                    placeholder="Full postal address"
                    className={`${inputCls} resize-none`}
                  />
                </Field>
                <Field label="Tax / VAT Number">
                  <input
                    value={form.tax_number}
                    onChange={(e) => setF("tax_number", e.target.value)}
                    placeholder="e.g. VAT-123456789"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Drawer footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-3 flex-shrink-0">
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
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-black shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {saving
                    ? "Saving…"
                    : selectedCustomer
                      ? "Update Customer"
                      : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3
                className="font-black text-gray-900 dark:text-white text-lg"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Delete Customer?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone. All associated data will be
                removed.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
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
