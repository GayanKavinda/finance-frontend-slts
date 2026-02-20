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
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: "", permissions: [] });

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        api.get("/admin/roles"),
        api.get("/admin/permissions"),
      ]);
      setRoles(r.data);
      setPermissions(p.data);
    } catch (e) {
      toast.error("Failed to load roles/permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/admin/roles/${editingRole.id}`, formData);
        toast.success("Role updated");
      } else {
        await api.post("/admin/roles", formData);
        toast.success("Role created");
      }
      setShowModal(false);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This may affect users with this role.")) return;
    try {
      await api.delete(`/admin/roles/${id}`);
      toast.success("Role deleted");
      loadData();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const togglePermission = (slug) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(slug)
        ? prev.permissions.filter((p) => p !== slug)
        : [...prev.permissions, slug],
    }));
  };

  if (loading)
    return <div className="p-10 text-center">Loading Access Control...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Access Control
          </h1>
          <p className="text-gray-500 mt-2">
            Manage system roles and granular permissions
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRole(null);
            setFormData({ name: "", permissions: [] });
            setShowModal(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            {role.name === "Admin" && (
              <div className="absolute top-4 right-4 text-amber-500">
                <Lock className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-black text-gray-900">{role.name}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                {role.permissions?.length || 0} Permissions Assigned
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 h-24 overflow-y-auto pr-2 pb-2">
              {role.permissions?.map((p) => (
                <span
                  key={p.id}
                  className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-tight"
                >
                  {p.name.replace(/-/g, " ")}
                </span>
              )) || (
                <span className="text-gray-400 text-xs italic">
                  No permissions
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => {
                  setEditingRole(role);
                  setFormData({
                    name: role.name,
                    permissions: role.permissions?.map((p) => p.slug) || [],
                  });
                  setShowModal(true);
                }}
                className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="w-3 h-3" />
                Edit Role
              </button>
              {role.name !== "Admin" && (
                <button
                  onClick={() => handleDelete(role.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <form onSubmit={handleSubmit}>
              <div className="p-8 bg-gray-50 border-b">
                <h2 className="text-2xl font-black text-gray-900">
                  {editingRole ? "Update Role" : "Create Custom Role"}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Define role name and select capabilities
                </p>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Role Name
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Finance Manager"
                    className="w-full bg-gray-100 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-bold text-gray-900"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Select Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 pb-2">
                    {permissions.map((p) => {
                      const active = formData.permissions.includes(p.slug);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePermission(p.slug)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left group
                                 ${active ? "border-primary bg-blue-50/50" : "border-gray-100 hover:border-gray-200"}`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors
                                  ${active ? "bg-primary border-primary text-white" : "border-gray-300 group-hover:border-gray-400"}`}
                          >
                            {active && <Check className="w-3 h-3 stroke-[4]" />}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-black truncate uppercase tracking-tight ${active ? "text-primary" : "text-gray-600"}`}
                            >
                              {p.name.replace(/-/g, " ")}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {editingRole ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </form>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
