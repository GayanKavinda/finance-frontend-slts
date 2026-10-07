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
  Download,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  History,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";
import AuditTrail from "./components/AuditTrail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "@/lib/axios";

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
  const [auditPOId, setAuditPOId] = useState(null);
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

  const loadPOs = useCallback(async ({ page, search }) => {
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
  }, []);

  useEffect(() => {
    loadPOs({ page, search });
  }, [loadPOs, page, search]);

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
      if (selectedPO) {
        await updatePurchaseOrder(selectedPO.id, form);
        toast.success("Purchase order updated");
      } else {
        await createPurchaseOrder(form);
        toast.success("Purchase order created");
      }
      setDrawerOpen(false);
      loadPOs({ page, search });
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
      loadPOs({ page, search });
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
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `PO-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Download failed");
    }
  };

  const total = meta.total ?? pos.length;

  return (
    <div className="min-h-full p-4 sm:p-6 space-y-4">
      {/* Zen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Purchase Orders
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Procurement requisitions, authorizations, and committed order values.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => openDrawer()}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Issue PO
          </Button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search PO # or job title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-8 text-xs pl-8 bg-card border-border"
          />
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          <span>{total} purchase orders issued</span>
        </div>
      </div>

      {/* Zen Compact Data Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <th className="py-2.5 px-3.5">PO #</th>
                <th className="py-2.5 px-3">Job / Project</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Amount (LKR)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-2.5 px-3.5"><div className="h-3 w-20 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 w-32 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 w-28 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 w-16 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3 text-right"><div className="h-3 w-20 bg-muted rounded ml-auto" /></td>
                    <td className="py-2.5 px-3"><div className="h-4 w-14 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3.5 text-right"><div className="h-4 w-12 bg-muted rounded ml-auto" /></td>
                  </tr>
                ))
              ) : pos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No purchase orders found</p>
                  </td>
                </tr>
              ) : (
                pos.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3.5 font-medium text-foreground">
                      {p.po_number}
                    </td>
                    <td className="py-2.5 px-3 text-foreground font-medium truncate max-w-[200px]">
                      {p.job?.name || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[160px]">
                      {p.customer?.name || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {p.po_date || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-foreground">
                      {Number(p.po_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => downloadPO(p.id)}
                          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAuditPOId(p.id)}
                          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                          title="View History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDrawer(p)}
                          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            Page {page} of {meta.last_page} ({total} POs)
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
        title={selectedPO ? "Edit Purchase Order" : "Issue Purchase Order"}
        description="Configure order specifics, amount, and project allocation"
        onSubmit={handleSubmit}
        submitText={selectedPO ? "Update PO" : "Issue PO"}
        isSubmitting={saving}
        size="lg"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">PO Number *</Label>
              <Input
                required
                value={form.po_number}
                onChange={(e) => setF("po_number", e.target.value)}
                placeholder="e.g. PO-2026-0042"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Amount (LKR) *</Label>
              <Input
                required
                type="number"
                value={form.po_amount}
                onChange={(e) => setF("po_amount", e.target.value)}
                placeholder="e.g. 1500000"
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Job</Label>
              <select
                value={form.job_id}
                onChange={(e) => setF("job_id", e.target.value)}
                className="h-8 w-full px-2 mt-1 text-xs bg-background border border-border rounded-md outline-none"
              >
                <option value="">Select Job</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Tender</Label>
              <select
                value={form.tender_id}
                onChange={(e) => setF("tender_id", e.target.value)}
                className="h-8 w-full px-2 mt-1 text-xs bg-background border border-border rounded-md outline-none"
              >
                <option value="">Select Tender</option>
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Customer</Label>
              <select
                value={form.customer_id}
                onChange={(e) => setF("customer_id", e.target.value)}
                className="h-8 w-full px-2 mt-1 text-xs bg-background border border-border rounded-md outline-none"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Order Date</Label>
              <Input
                type="date"
                value={form.po_date}
                onChange={(e) => setF("po_date", e.target.value)}
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Status</Label>
              <select
                value={form.status}
                onChange={(e) => setF("status", e.target.value)}
                className="h-8 w-full px-2 mt-1 text-xs bg-background border border-border rounded-md outline-none"
              >
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Sent">Sent</option>
                <option value="Received">Received</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-[11px] text-muted-foreground uppercase">Scope / Description</Label>
            <Textarea
              value={form.po_description}
              onChange={(e) => setF("po_description", e.target.value)}
              rows={2}
              placeholder="Requisition specifications or items list"
              className="text-xs mt-1"
            />
          </div>
        </div>
      </FormModal>

      {/* Audit Trail Modal */}
      {auditPOId && (
        <AuditTrail poId={auditPOId} onClose={() => setAuditPOId(null)} />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="w-full max-w-xs bg-card border border-border rounded-lg p-4 shadow-xl space-y-3 text-center">
            <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground">Delete Purchase Order?</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                This record will be permanently deleted from procurement ledger.
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
