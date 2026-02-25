"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ShieldCheck,
  Lock,
  Key,
} from "lucide-react";
import { toast } from "react-hot-toast";

const ROLE_ACCENT = {
  Admin: "from-amber-500 to-orange-500",
  Procurement: "from-blue-500 to-indigo-500",
  Finance: "from-emerald-500 to-teal-500",
  Viewer: "from-gray-400 to-slate-400",
};
const getRoleAccent = (name) =>
  ROLE_ACCENT[name] || "from-violet-500 to-purple-500";

function RoleCard({ role, onEdit, onDelete }) {
  const accent = getRoleAccent(role.name);
  const isProtected = role.name === "Admin";
  const perms = role.permissions || [];

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-sm`}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3
                className="font-black text-gray-900 dark:text-white text-sm"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {role.name}
                {isProtected && (
                  <Lock className="inline w-3 h-3 text-amber-500 ml-1.5 mb-0.5" />
                )}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {perms.length} permission{perms.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(role)}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {!isProtected && (
              <button
                onClick={() => onDelete(role.id)}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Permissions */}
        {perms.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {perms.slice(0, 6).map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-lg uppercase tracking-tight border border-gray-100 dark:border-gray-600"
              >
                {p.name.replace(/-/g, " ")}
              </span>
            ))}
            {perms.length > 6 && (
              <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 text-[10px] font-bold rounded-lg">
                +{perms.length - 6} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">
            No permissions assigned
          </p>
        )}

        {/* Edit button */}
        <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-700">
          <button
            onClick={() => onEdit(role)}
            className="w-full py-2 text-xs font-black text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
          >
            <Edit2 className="w-3 h-3" /> Edit Role & Permissions
          </button>
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
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-2.5 bg-gray-100 dark:bg-gray-600 rounded w-1/4" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-5 w-20 bg-gray-100 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400";

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ name: "", permissions: [] });
  const [permSearch, setPermSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        api.get("/admin/roles"),
        api.get("/admin/permissions"),
      ]);
      setRoles(r.data);
      setPermissions(p.data);
    } catch {
      toast.error("Failed to load roles/permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDrawer = (role = null) => {
    setEditingRole(role);
    setPermSearch("");
    setFormData(
      role
        ? {
            name: role.name,
            permissions: role.permissions?.map((p) => p.slug) || [],
          }
        : { name: "", permissions: [] },
    );
    setDrawerOpen(true);
  };

  const togglePermission = (slug) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(slug)
        ? prev.permissions.filter((p) => p !== slug)
        : [...prev.permissions, slug],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingRole) {
        await api.put(`/admin/roles/${editingRole.id}`, formData);
        toast.success("Role updated");
      } else {
        await api.post("/admin/roles", formData);
        toast.success("Role created");
      }
      setDrawerOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/roles/${id}`);
      toast.success("Role deleted");
      setDeleteConfirm(null);
      loadData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredPerms = permissions.filter((p) =>
    p.name.toLowerCase().includes(permSearch.toLowerCase()),
  );
  const totalPerms = permissions.length;
  const protectedCount = roles.filter((r) => r.name === "Admin").length;

  return (
    <>
      <div className="min-h-full p-6 space-y-6">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 rounded-3xl p-8 overflow-hidden">
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
              <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">
                Admin Panel
              </p>
              <h1
                className="text-3xl font-black text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Access Control
              </h1>
              <p className="text-indigo-200/60 text-sm mt-1">
                Manage roles &amp; granular permissions
              </p>
            </div>
            <button
              onClick={() => openDrawer()}
              className="flex items-center gap-2 bg-white hover:bg-indigo-50 text-slate-900 px-5 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: Shield,
              label: "Total Roles",
              value: roles.length,
              color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600",
            },
            {
              icon: Key,
              label: "Total Permissions",
              value: totalPerms,
              color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600",
            },
            {
              icon: Lock,
              label: "Protected",
              value: protectedCount,
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

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : roles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={openDrawer}
                  onDelete={(id) => setDeleteConfirm(id)}
                />
              ))}
        </div>
      </div>

      {/* Slide-in Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">
                    {editingRole ? "Edit" : "Create New"}
                  </p>
                  <h2
                    className="text-xl font-black text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {editingRole
                      ? `Edit: ${editingRole.name}`
                      : "New Custom Role"}
                  </h2>
                  {editingRole && (
                    <p className="text-indigo-200/70 text-xs mt-1">
                      {formData.permissions.length} permissions selected
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto flex flex-col"
            >
              <div className="p-6 space-y-5 flex-1">
                {/* Role name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
                    Role Name *
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Finance Manager"
                    className={inputCls}
                  />
                </div>

                {/* Permissions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
                      Permissions
                    </label>
                    <span className="text-[10px] font-black text-indigo-500">
                      {formData.permissions.length}/{permissions.length}{" "}
                      selected
                    </span>
                  </div>

                  {/* Permission search */}
                  <input
                    placeholder="Filter permissions…"
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />

                  {/* Permission toggles — simple pill list */}
                  <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                    {filteredPerms.map((p) => {
                      const active = formData.permissions.includes(p.slug);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePermission(p.slug)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                            active
                              ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700"
                              : "bg-gray-50 dark:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                          }`}
                        >
                          <span
                            className={`text-xs font-bold capitalize ${active ? "text-indigo-700 dark:text-indigo-300" : "text-gray-600 dark:text-gray-400"}`}
                          >
                            {p.name.replace(/-/g, " ")}
                          </span>
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                              active
                                ? "bg-indigo-600 text-white"
                                : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500"
                            }`}
                          >
                            {active && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
                    {filteredPerms.length === 0 && (
                      <p className="text-center text-xs text-gray-400 py-4">
                        No permissions match
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
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
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-black shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {saving
                    ? "Saving…"
                    : editingRole
                      ? "Save Changes"
                      : "Create Role"}
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
                Delete Role?
              </h3>
              <p className="text-sm text-gray-500">
                Users assigned this role will lose their access.
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
