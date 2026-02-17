// src/app/admin/users/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// ─── RoleBadge ──────────────────────────────────────────────────

const ROLE_COLORS = {
  Admin: "bg-purple-100 text-purple-700 border-purple-200",
  Procurement: "bg-blue-100 text-blue-700 border-blue-200",
  Finance: "bg-amber-100 text-amber-700 border-amber-200",
  Viewer: "bg-gray-100 text-gray-700 border-gray-200",
};

function RoleBadge({ role }) {
  const cls = ROLE_COLORS[role] ?? "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold ${cls}`}
    >
      {role}
    </span>
  );
}

// ─── UserRow ────────────────────────────────────────────────────

function UserRow({
  user,
  currentUser,
  onAssignRole,
  onToggleStatus,
  allRoles,
}) {
  const [editingRole, setEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.roles?.[0]?.name || "");
  const [loading, setLoading] = useState(false);

  const isSelf = user.id === currentUser?.id;
  const isDeactivated = !!user.deleted_at;

  const handleRoleSave = async () => {
    if (selectedRole === user.roles?.[0]?.name) {
      setEditingRole(false);
      return;
    }
    setLoading(true);
    await onAssignRole(user.id, selectedRole);
    setLoading(false);
    setEditingRole(false);
  };

  const handleStatusToggle = async () => {
    if (
      !confirm(
        isDeactivated
          ? `Reactivate ${user.name}? They will be able to log in again.`
          : `Deactivate ${user.name}? They will be logged out immediately.`,
      )
    )
      return;

    setLoading(true);
    await onToggleStatus(user.id, isDeactivated);
    setLoading(false);
  };

  return (
    <tr
      className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition ${isDeactivated ? "bg-gray-50/50 opacity-70" : ""}`}
    >
      {/* User Info */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
            ${isDeactivated ? "bg-gray-200 text-gray-400" : "bg-blue-50 text-blue-600"}`}
          >
            {user.avatar_path ? (
              <img
                src={`/storage/${user.avatar_path}`}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900">
              {user.name}{" "}
              {isSelf && (
                <span className="text-xs text-gray-400 font-normal">(You)</span>
              )}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="p-4">
        {editingRole ? (
          <div className="flex items-center gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={loading}
              className="px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
            >
              {allRoles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleRoleSave}
              disabled={loading}
              className="text-green-600 hover:text-green-700"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button
              onClick={() => setEditingRole(false)}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <RoleBadge role={user.roles?.[0]?.name} />
            {!isSelf && !isDeactivated && (
              <button
                onClick={() => setEditingRole(true)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition"
                title="Change Role"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </td>

      {/* Status */}
      <td className="p-4">
        {isDeactivated ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            Inactive
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
          </span>
        )}
      </td>

      {/* Last Login */}
      <td className="p-4 text-xs text-gray-500">
        {user.login_activities_count > 0 ? (
          // Placeholder since we don't have the last login date on the list API yet
          // We could add it, but for now just showing activity count or 'Recently'
          <span title="Login Count">{user.login_activities_count} logins</span>
        ) : (
          "Never"
        )}
      </td>

      {/* Actions */}
      <td className="p-4 text-right">
        {!isSelf && (
          <button
            onClick={handleStatusToggle}
            disabled={loading}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition
              ${
                isDeactivated
                  ? "border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300"
                  : "border-transparent text-red-600 hover:bg-red-50"
              }`}
          >
            {loading ? "..." : isDeactivated ? "Reactivate" : "Deactivate"}
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Main Page ───────────────────────────────────────────────────

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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page });
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);

      const [usersRes, rolesRes] = await Promise.all([
        api.get(`/admin/users?${params}`),
        allRoles.length === 0
          ? api.get("/admin/roles")
          : Promise.resolve({ data: allRoles }),
      ]);

      setUsers(usersRes.data.data);
      setMeta(usersRes.data); // Pagination meta is likely at root or meta key depending on Laravel
      if (allRoles.length === 0) setAllRoles(rolesRes.data);
    } catch (e) {
      console.error(e);
      // If forbidden, redirect
      if (e.response?.status === 403) router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, allRoles, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handler: Assign Role
  const handleAssignRole = async (userId, newRole) => {
    try {
      await api.post(`/admin/users/${userId}/assign-role`, { role: newRole });
      // Update local state to reflect change immediately
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, roles: [{ name: newRole }] } : u,
        ),
      );
    } catch (e) {
      alert(e.response?.data?.message || "Failed to assign role");
    }
  };

  // Handler: Deactivate/Reactivate
  const handleToggleStatus = async (userId, isDeactivated) => {
    try {
      const endpoint = isDeactivated ? "reactivate" : "deactivate";
      await api[isDeactivated ? "post" : "delete"](
        `/admin/users/${userId}/${endpoint}`,
      );
      fetchUsers(); // Refresh to get exact state
    } catch (e) {
      alert(e.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage system access and roles.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition w-full md:w-64"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="">All Roles</option>
            {allRoles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Activity</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    currentUser={currentUser}
                    allRoles={allRoles}
                    onAssignRole={handleAssignRole}
                    onToggleStatus={handleToggleStatus}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {meta.last_page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
