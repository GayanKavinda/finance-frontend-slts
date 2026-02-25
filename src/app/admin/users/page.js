// src/app/admin/users/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

const ROLE_PILL = {
  Admin:
    "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
  Procurement:
    "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
  Finance:
    "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
  Viewer: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
};
const getRolePill = (r) =>
  ROLE_PILL[r] ??
  "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";

function UserCard({
  user,
  currentUser,
  allRoles,
  onAssignRole,
  onToggleStatus,
  onDeletePermanently,
}) {
  const [editingRole, setEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.roles?.[0]?.name ?? "");
  const [busy, setBusy] = useState(false);

  const isSelf = user.id === currentUser?.id;
  const isDeactivated = !!user.deleted_at;
  const roleName = user.roles?.[0]?.name;

  const handleRoleSave = async () => {
    if (selectedRole === roleName) {
      setEditingRole(false);
      return;
    }
    setBusy(true);
    await onAssignRole(user.id, selectedRole);
    setBusy(false);
    setEditingRole(false);
  };

  const handleStatusToggle = async () => {
    const msg = isDeactivated
      ? `Reactivate ${user.name}? They will be able to log in again.`
      : `Deactivate ${user.name}? They will be logged out immediately.`;
    if (!confirm(msg)) return;
    setBusy(true);
    await onToggleStatus(user.id, isDeactivated);
    setBusy(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `PERMANENTLY DELETE ${user.name}? This action CANNOT be undone. All user data, sessions, and activity will be removed.`,
      )
    )
      return;
    setBusy(true);
    await onDeletePermanently(user.id);
    setBusy(false);
  };

  const initials = user.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ${isDeactivated ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-4 p-5">
        {/* Avatar */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${isDeactivated ? "bg-gray-200 dark:bg-gray-700 text-gray-400" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"}`}
        >
          {user.avatar_path ? (
            <span className="relative w-full h-full block">
              <img
                src={`/storage/${user.avatar_path}`}
                className="w-full h-full rounded-xl object-cover"
                alt=""
              />
            </span>
          ) : (
            initials
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="font-black text-gray-900 dark:text-white text-sm truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {user.name}
            </span>
            {isSelf && (
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-md">
                You
              </span>
            )}
            {isDeactivated ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Inactive
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>

        {/* Role */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {editingRole ? (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={busy}
                className="px-2 py-1.5 text-xs font-bold border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {allRoles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRoleSave}
                disabled={busy}
                className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <button
                onClick={() => setEditingRole(false)}
                disabled={busy}
                className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group/role">
              {roleName && (
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${getRolePill(roleName)}`}
                >
                  {roleName}
                </span>
              )}
              {!isSelf && !isDeactivated && (
                <button
                  onClick={() => setEditingRole(true)}
                  className="opacity-0 group-hover/role:opacity-100 p-1 text-gray-400 hover:text-indigo-500 transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="text-right hidden sm:block flex-shrink-0">
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {user.login_activities_count > 0
              ? `${user.login_activities_count} logins`
              : "Never"}
          </div>
          <div className="text-[10px] text-gray-400">activity</div>
        </div>

        {/* Actions */}
        {!isSelf && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={handleStatusToggle}
              disabled={busy}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                isDeactivated
                  ? "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  : "border-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              }`}
            >
              {busy ? "…" : isDeactivated ? "Reactivate" : "Deactivate"}
            </button>
            <button
              onClick={handleDelete}
              disabled={busy}
              title="Permanently Delete"
              className="p-1.5 text-gray-300 hover:text-red-500 transition-colors ml-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/3" />
      </div>
      <div className="h-6 w-20 bg-gray-100 dark:bg-gray-700 rounded-full" />
    </div>
  );
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    api
      .get("/admin/roles")
      .then((r) => setAllRoles(r.data))
      .catch((e) => {
        if (e.response?.status === 403) router.push("/dashboard");
      });
  }, [router]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.data ?? []);
      setMeta({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (e) {
      console.error(e);
      if (e.response?.status === 403) router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAssignRole = async (userId, newRole) => {
    try {
      await api.post(`/admin/users/${userId}/assign-role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, roles: [{ name: newRole }] } : u,
        ),
      );
    } catch (e) {
      alert(e.response?.data?.message ?? "Failed to assign role");
    }
  };

  const handleToggleStatus = async (userId, isDeactivated) => {
    try {
      if (isDeactivated) {
        await api.post(`/admin/users/${userId}/reactivate`);
      } else {
        await api.delete(`/admin/users/${userId}/deactivate`);
      }
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message ?? "Action failed");
    }
  };

  const handleDeletePermanently = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}/permanent`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message ?? "Deletion failed");
    }
  };

  const activeCount = users.filter((u) => !u.deleted_at).length;
  const inactiveCount = users.filter((u) => !!u.deleted_at).length;

  return (
    <div className="min-h-full p-6 space-y-6">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">
            Admin Panel
          </p>
          <h1
            className="text-3xl font-black text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            User Management
          </h1>
          <p className="text-indigo-200/60 text-sm mt-1">
            {meta.total ?? users.length} team member
            {(meta.total ?? users.length) !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: Users,
            label: "Total",
            value: meta.total ?? users.length,
            color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600",
          },
          {
            icon: UserCheck,
            label: "Active",
            value: activeCount,
            color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
          },
          {
            icon: UserX,
            label: "Inactive",
            value: inactiveCount,
            color: "bg-red-50 dark:bg-red-900/20 text-red-500",
          },
          {
            icon: ShieldCheck,
            label: "Roles",
            value: allRoles.length,
            color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600",
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

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <option value="">All Roles</option>
          {allRoles.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Card List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No users found</p>
          </div>
        ) : (
          users.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              currentUser={currentUser}
              allRoles={allRoles}
              onAssignRole={handleAssignRole}
              onToggleStatus={handleToggleStatus}
              onDeletePermanently={handleDeletePermanently}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-gray-600 dark:text-gray-400 px-3">
            Page {page} of {meta.last_page}
          </span>
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
  );
}
