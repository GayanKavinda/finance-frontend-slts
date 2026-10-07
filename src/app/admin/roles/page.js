"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Lock,
  Key,
  Crown,
  Search,
  Layers,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RoleManagementPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.includes("Super Admin");

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drawer for Role create/edit
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: "", permissions: [] });
  const [saving, setSaving] = useState(false);
  const [permSearch, setPermSearch] = useState("");

  // Modal for new permission creation
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [newPermName, setNewPermName] = useState("");
  const [permCreating, setPermCreating] = useState(false);

  // Deletion confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [r, p] = await Promise.all([
        api.get("/admin/roles"),
        api.get("/admin/permissions"),
      ]);
      setRoles(r.data);
      setPermissions(p.data);
    } catch {
      toast.error("Failed to load roles/permissions");
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    run();
  }, [loadData]);

  const openDrawer = (role = null) => {
    setEditingRole(role);
    setPermSearch("");
    setFormData(
      role
        ? {
            name: role.name,
            permissions: role.permissions?.map((p) => p.name) || [],
          }
        : { name: "", permissions: [] },
    );
    setDrawerOpen(true);
  };

  const togglePermission = (permName) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permName)
        ? prev.permissions.filter((p) => p !== permName)
        : [...prev.permissions, permName],
    }));
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    setSaving(true);
    try {
      if (editingRole) {
        await api.put(`/admin/roles/${editingRole.id}`, formData);
        toast.success("Role updated successfully");
      } else {
        await api.post("/admin/roles", formData);
        toast.success("Role created successfully");
      }
      setDrawerOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      await api.delete(`/admin/roles/${id}`);
      toast.success("Role deleted");
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    if (!newPermName.trim()) {
      toast.error("Permission name is required");
      return;
    }
    setPermCreating(true);
    try {
      await api.post("/admin/permissions", { name: newPermName.trim() });
      toast.success("Permission created");
      setNewPermName("");
      setPermModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create permission");
    } finally {
      setPermCreating(false);
    }
  };

  const filteredPerms = permissions.filter((p) =>
    p.name.toLowerCase().includes(permSearch.toLowerCase()),
  );

  return (
    <div className="min-h-full p-4 sm:p-6 space-y-5">
      {/* Zen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Roles & Permissions
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system roles, access boundaries, and granular operational privileges.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPermModalOpen(true)}
            className="h-8 text-xs gap-1.5"
          >
            <Key className="w-3.5 h-3.5 text-muted-foreground" />
            New Permission
          </Button>
          <Button
            size="sm"
            onClick={() => openDrawer()}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Compact Status Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-card border border-border rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider block">
              Configured Roles
            </span>
            <span className="text-lg font-semibold text-foreground">
              {roles.length}
            </span>
          </div>
          <Shield className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="p-3 bg-card border border-border rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider block">
              Active Permissions
            </span>
            <span className="text-lg font-semibold text-foreground">
              {permissions.length}
            </span>
          </div>
          <Key className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="p-3 bg-card border border-border rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider block">
              Protected Archetypes
            </span>
            <span className="text-lg font-semibold text-foreground">
              {roles.filter((r) => r.is_protected || r.name === "Admin" || r.name === "Super Admin").length}
            </span>
          </div>
          <Lock className="w-4 h-4 text-amber-500" />
        </div>
      </div>

      {/* Roles Grid (Zen Minimalist cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 bg-card border border-border rounded-lg animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="flex gap-1.5 pt-2">
                <div className="h-4 w-12 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>
          ))
        ) : (
          roles.map((role) => {
            const isProtected =
              role.is_protected || role.name === "Admin" || role.name === "Super Admin";
            const perms = role.permissions || [];

            return (
              <div
                key={role.id}
                className="p-3.5 bg-card border border-border rounded-lg hover:border-border/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                        {role.name === "Super Admin" ? (
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground">
                            {role.name}
                          </span>
                          {isProtected && (
                            <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {perms.length} permission{perms.length !== 1 ? "s" : ""}
                          {role.users_count > 0 && ` · ${role.users_count} user${role.users_count !== 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>

                    {/* Super Admin can edit Admin. Only Super Admin itself is strictly immutable */}
                    {role.name !== "Super Admin" && (isSuperAdmin || !isProtected) && (
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => openDrawer(role)}
                          title="Edit Permissions"
                          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        {role.name !== "Admin" && (
                          <button
                            onClick={() => setDeleteConfirm(role.id)}
                            title="Delete"
                            className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Permissions pills */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {perms.length > 0 ? (
                      perms.slice(0, 5).map((p) => (
                        <span
                          key={p.id}
                          className="inline-block px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground rounded border border-border/50"
                        >
                          {p.name.replace(/-/g, " ")}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">
                        No privileges assigned
                      </span>
                    )}
                    {perms.length > 5 && (
                      <span className="inline-block px-1.5 py-0.5 text-[10px] bg-muted/60 text-muted-foreground rounded">
                        +{perms.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                  {role.name === "Super Admin" ? (
                    <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Immutable root archetype
                    </span>
                  ) : role.name === "Admin" && !isSuperAdmin ? (
                    <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Protected by Super Admin
                    </span>
                  ) : (
                    <button
                      onClick={() => openDrawer(role)}
                      className="text-primary hover:underline text-[11px] font-medium flex items-center gap-1"
                    >
                      <Edit2 className="w-2.5 h-2.5" /> Configure permissions
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Drawer: Role Edit/Create */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="w-full max-w-sm bg-card border-l border-border shadow-xl flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {editingRole ? `Edit ${editingRole.name}` : "Create New Role"}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {formData.permissions.length} of {permissions.length} permissions assigned
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoleSubmit} className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-4 space-y-4 flex-1">
                <div>
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                    Role Name *
                  </Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Compliance Officer"
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Privileges
                    </Label>
                    <div className="flex gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            permissions: filteredPerms.map((p) => p.name),
                          }))
                        }
                        className="text-primary hover:underline font-medium"
                      >
                        Select all
                      </button>
                      <span className="text-muted-foreground">·</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, permissions: [] }))
                        }
                        className="text-muted-foreground hover:text-foreground font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Filter privileges…"
                      value={permSearch}
                      onChange={(e) => setPermSearch(e.target.value)}
                      className="h-8 text-xs pl-8"
                    />
                  </div>

                  <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                    {filteredPerms.map((p) => {
                      const active = formData.permissions.includes(p.name);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePermission(p.name)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors border text-xs ${
                            active
                              ? "bg-primary/5 border-primary/20 text-foreground font-medium"
                              : "bg-background border-border/60 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <span className="capitalize text-[11px]">
                            {p.name.replace(/-/g, " ")}
                          </span>
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[10px] ${
                              active
                                ? "bg-primary text-primary-foreground"
                                : "border border-input"
                            }`}
                          >
                            {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-border bg-muted/30 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="flex-1 h-8 text-xs"
                >
                  {saving ? "Saving…" : editingRole ? "Save Changes" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Permission */}
      {permModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-lg shadow-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Create Permission
              </h3>
              <button
                onClick={() => setPermModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Define a new granular permission slug (e.g. export-audit-data).
            </p>
            <form onSubmit={handleCreatePermission} className="space-y-3 pt-1">
              <div>
                <Label className="text-[11px] text-muted-foreground uppercase">
                  Name / Identifier
                </Label>
                <Input
                  required
                  value={newPermName}
                  onChange={(e) => setNewPermName(e.target.value)}
                  placeholder="e.g. view-financial-reports"
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPermModalOpen(false)}
                  className="flex-1 h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={permCreating}
                  className="flex-1 h-8 text-xs"
                >
                  {permCreating ? "Creating…" : "Save Permission"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xs bg-card border border-border rounded-lg p-4 shadow-xl space-y-3 text-center">
            <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground">
                Delete this role?
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Ensure all assigned users have been reassigned prior to removal.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteRole(deleteConfirm)}
                className="flex-1 h-8 text-xs"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
