// src/app/customers/page.js
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
  Phone,
  Mail,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import FormModal from "@/components/ui/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-full p-4 sm:p-6 space-y-4">
      {/* Zen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Customer Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Commercial client relationships, billing information, and tax registrations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => openDrawer()}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search client by name or contact…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-8 text-xs pl-8 bg-card border-border"
          />
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          <span>{total} clients</span>
          <span className="mx-1.5">·</span>
          <span className="text-foreground font-medium">{vatCount} VAT registered</span>
        </div>
      </div>

      {/* Zen Compact Data Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <th className="py-2.5 px-3.5">Customer / Company</th>
                <th className="py-2.5 px-3">Contact Person</th>
                <th className="py-2.5 px-3">Contact Info</th>
                <th className="py-2.5 px-3">Billing Address</th>
                <th className="py-2.5 px-3">Tax status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-2.5 px-3.5"><div className="h-3 w-32 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 w-24 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 w-36 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 w-40 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-4 w-14 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3.5 text-right"><div className="h-4 w-12 bg-muted rounded ml-auto" /></td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No customer records found</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3.5 font-medium text-foreground">
                      {c.name}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {c.contact_person || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      <div className="space-y-0.5 text-[11px]">
                        {c.email && (
                          <div className="flex items-center gap-1 truncate max-w-[180px]">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{c.email}</span>
                          </div>
                        )}
                        {c.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                        {!c.email && !c.phone && <span>—</span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[220px]">
                      {c.billing_address || "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      {c.tax_number ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-foreground border border-border/50">
                          <Receipt className="w-2.5 h-2.5" />
                          VAT {c.tax_number}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDrawer(c)}
                          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(c.id)}
                          className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Page {page} of {meta.last_page} ({total} clients)
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

      {/* Form Modal */}
      <FormModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedCustomer ? "Edit Customer" : "New Customer"}
        description="Enter client company and contact credentials"
        onSubmit={handleSubmit}
        submitText={selectedCustomer ? "Update Client" : "Save Client"}
        isSubmitting={saving}
        size="md"
      >
        <div className="space-y-3">
          <div>
            <Label className="text-[11px] text-muted-foreground uppercase">Company Name *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setF("name", e.target.value)}
              placeholder="e.g. Apex Infrastructures Ltd"
              className="h-8 text-xs mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Contact Person</Label>
              <Input
                value={form.contact_person}
                onChange={(e) => setF("contact_person", e.target.value)}
                placeholder="e.g. Jane Doe"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Tax / VAT Number</Label>
              <Input
                value={form.tax_number}
                onChange={(e) => setF("tax_number", e.target.value)}
                placeholder="e.g. VAT-89472"
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setF("email", e.target.value)}
                placeholder="billing@apex.lk"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setF("phone", e.target.value)}
                placeholder="+94 11 234 5678"
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground uppercase">Billing Address</Label>
            <Textarea
              value={form.billing_address}
              onChange={(e) => setF("billing_address", e.target.value)}
              rows={2}
              placeholder="Enter official registered office address"
              className="text-xs mt-1"
            />
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="w-full max-w-xs bg-card border border-border rounded-lg p-4 shadow-xl space-y-3 text-center">
            <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground">Delete Customer?</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                This record and associated contracts will be affected.
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
                onClick={() => handleDelete(deleteConfirm)}
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
