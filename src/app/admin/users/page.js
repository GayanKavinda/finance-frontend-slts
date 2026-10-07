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
  Shield,
  Clock,
  MoreVertical,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";

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

  // Inline role editing state
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);

  const loadRoles = useCallback(async () => {
    try {
      const r = await api.get("/admin/roles");
      setAllRoles(r.data);
    } catch (e) {
      if (e.response?.status === 403) router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

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
    if (!newRole) return;
    setBusyUserId(userId);
    try {
      await api.post(`/admin/users/${userId}/assign-role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, roles: [{ name: newRole }] } : u,
        ),
      );
      toast.success("Role updated");
      setEditingUserId(null);
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Failed to assign role");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleToggleStatus = async (user) => {
    const isDeactivated = !!user.deleted_at;
    const msg = isDeactivated
      ? `Reactivate ${user.name}?`
      : `Deactivate ${user.name}? They will lose current access.`;
    if (!confirm(msg)) return;

    setBusyUserId(user.id);
    try {
      if (isDeactivated) {
        await api.post(`/admin/users/${user.id}/reactivate`);
      } else {
        await api.delete(`/admin/users/${user.id}/deactivate`);
      }
      fetchUsers();
      toast.success(isDeactivated ? "User reactivated" : "User deactivated");
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Action failed");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeletePermanently = async (user) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete ${user.name}? This cannot be undone.`,
      )
    )
      return;
    setBusyUserId(user.id);
    try {
      await api.delete(`/admin/users/${user.id}/permanent`);
      fetchUsers();
      toast.success("User permanently deleted");
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Deletion failed");
    } finally {
      setBusyUserId(null);
    }
  };

  const activeCount = users.filter((u) => !u.deleted_at).length;
  const inactiveCount = users.filter((u) => !!u.deleted_at).length;

  return (
    <div className="min-h-full p-4 sm:p-6 space-y-4">
      {/* Zen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            User Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Internal organization accounts, assignment status, and identity administration.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{meta.total ?? users.length} members</span>
          <span>·</span>
          <span className="text-foreground font-medium">{activeCount} active</span>
        </div>
      </div>

      {/* Control Strip & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search user name or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-8 text-xs pl-8 bg-card border-border"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-8 px-2.5 bg-card border border-border rounded-md text-xs font-medium text-foreground outline-none focus:border-primary"
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

      {/* Zen Compact Data Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <th className="py-2.5 px-3.5">User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Activity</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded bg-muted" />
                        <div className="space-y-1">
                          <div className="h-3 w-28 bg-muted rounded" />
                          <div className="h-2.5 w-36 bg-muted/60 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3"><div className="h-4 w-16 bg-muted rounded" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-12 bg-muted rounded" /></td>
                    <td className="py-3 px-3"><div className="h-3 w-16 bg-muted rounded" /></td>
                    <td className="py-3 px-3.5 text-right"><div className="h-4 w-12 bg-muted rounded ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No team members match the search query</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isDeactivated = !!u.deleted_at;
                  const roleName = u.roles?.[0]?.name;
                  const isEditingThis = editingUserId === u.id;
                  const isBusy = busyUserId === u.id;

                  const initials = u.name
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        isDeactivated ? "opacity-60" : ""
                      }`}
                    >
                      {/* Name & Identity */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-muted flex items-center justify-center font-medium text-[11px] text-muted-foreground flex-shrink-0">
                            {u.avatar_path ? (
                              <img
                                src={`/storage/${u.avatar_path}`}
                                className="w-full h-full rounded object-cover"
                                alt=""
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground truncate">
                                {u.name}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] px-1 bg-muted text-muted-foreground rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground block truncate">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="py-2.5 px-3">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              disabled={isBusy}
                              className="h-6 px-1.5 text-xs bg-background border border-border rounded outline-none"
                            >
                              {allRoles.map((r) => (
                                <option key={r.id} value={r.name}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignRole(u.id, selectedRole)}
                              disabled={isBusy}
                              className="p-1 text-primary hover:bg-primary/10 rounded"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              disabled={isBusy}
                              className="p-1 text-muted-foreground hover:bg-muted rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-muted text-foreground rounded border border-border/50">
                              {roleName || "Unassigned"}
                            </span>
                            {!isSelf && !isDeactivated && (
                              <button
                                onClick={() => {
                                  setSelectedRole(roleName || (allRoles[0]?.name ?? ""));
                                  setEditingUserId(u.id);
                                }}
                                className="p-0.5 text-muted-foreground hover:text-foreground rounded"
                                title="Change role"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        {isDeactivated ? (
                          <span className="inline-block px-1.5 py-0.2 text-[10px] text-muted-foreground bg-muted/60 rounded">
                            Inactive
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.2 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Logins Count */}
                      <td className="py-2.5 px-3 text-muted-foreground text-[11px]">
                        {u.login_activities_count > 0 ? (
                          <span>{u.login_activities_count} sessions</span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3.5 text-right">
                        {!isSelf && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={isBusy}
                              className="px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground rounded border border-border/60 hover:bg-muted transition-colors"
                            >
                              {isDeactivated ? "Activate" : "Deactivate"}
                            </button>
                            <button
                              onClick={() => handleDeletePermanently(u)}
                              disabled={isBusy}
                              title="Delete permanently"
                              className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Showing page {page} of {meta.last_page}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7 w-7"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="h-7 w-7"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
