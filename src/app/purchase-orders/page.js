// src/app/purchase-orders/page.js
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchPurchaseOrders,
  fetchPurchaseOrderStats,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  downloadPurchaseOrderPdf,
  fetchJobs,
  fetchCustomers,
  fetchTenders,
} from "@/lib/procurement";
import { exportToCSV } from "@/lib/exportUtils";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  History,
  CircleDollarSign,
  BadgeCheck,
  FileEdit,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";
import AuditTrail from "./components/AuditTrail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STATUS_FILTERS = [
  "",
  "Draft",
  "Approved",
  "Sent",
  "Received",
  "Cancelled",
];

const STATUS_OPTIONS = [
  "Draft",
  "Approved",
  "Sent",
  "Received",
  "Cancelled",
];

// Mirrors the backend lifecycle in App\Models\PurchaseOrder
const TRANSITIONS = {
  Draft: ["Approved", "Cancelled"],
  Approved: ["Sent", "Cancelled"],
  Sent: ["Received", "Cancelled"],
  Received: [],
  Cancelled: [],
};

const fmtMoney = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

export default function POPage() {
  const canManagePOs = usePermission("manage-pos");
  const canViewAudit = usePermission("view-audit-trail");

  const [pos, setPos] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [stats, setStats] = useState({ total: 0, committed_value: 0, by_status: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
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
    reason: "",
  });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const searchTimerRef = useRef(null);

  const loadPOs = useCallback(async ({ page, status, search }) => {
    try {
      const data = await fetchPurchaseOrders({ page, status, search });
      setPos(data.data || []);
      setMeta(data.meta || {});
    } catch {
      toast.error("Failed to load POs");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchPurchaseOrderStats();
      setStats({
        total: data.total ?? 0,
        committed_value: data.committed_value ?? 0,
        by_status: data.by_status ?? {},
      });
    } catch {
      // stats are non-critical
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await loadPOs({ page, status, search });
    };
    run();
  }, [loadPOs, page, status, search]);

  useEffect(() => {
    const run = async () => {
      await loadStats();
    };
    run();
  }, [loadStats]);

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
            reason: "",
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
            reason: "",
          },
    );
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (selectedPO && payload.status === selectedPO.status) {
        delete payload.reason;
      }
      if (selectedPO) {
        await updatePurchaseOrder(selectedPO.id, payload);
        toast.success("Purchase order updated");
      } else {
        const { reason, ...createPayload } = payload;
        await createPurchaseOrder(createPayload);
        toast.success("Purchase order created");
      }
      setDrawerOpen(false);
      loadPOs({ page, status, search });
      loadStats();
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
      loadPOs({ page, status, search });
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const downloadPO = async (po) => {
    try {
      const blob = await downloadPurchaseOrderPdf(po.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      const safe = String(po.po_number || po.id).replace(/[^\w-]+/g, "-");
      link.setAttribute("download", `PO-${safe}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  };

  const exportCSV = () => {
    exportToCSV(pos, "purchase_orders_export", [
      { key: "po_number", label: "PO #" },
      { key: "job.name", label: "Job / Project" },
      { key: "customer.name", label: "Vendor" },
      { key: "tender.tender_number", label: "Tender Ref" },
      { key: "po_date", label: "Order Date" },
      { key: "po_amount", label: "Amount (LKR)" },
      { key: "status", label: "Status" },
    ]);
  };

  // Statuses the current PO may legally move to (incl. staying put)
  const allowedStatuses = selectedPO
    ? [selectedPO.status, ...(TRANSITIONS[selectedPO.status] || [])]
    : STATUS_OPTIONS;

  const statusChanged = selectedPO && form.status !== selectedPO.status;

  const total = meta.total ?? pos.length;
  const approvedAmt = stats.by_status?.Approved?.amount ?? 0;
  const draftCount = stats.by_status?.Draft?.count ?? 0;

  const statCards = [
    {
      label: "Total Orders",
      value: stats.total.toLocaleString(),
      sub: `${total} on this filter`,
      icon: ShoppingCart,
    },
    {
      label: "Committed Value",
      value: `LKR ${fmtMoney(stats.committed_value)}`,
      sub: "Across all statuses",
      icon: CircleDollarSign,
    },
    {
      label: "Approved Value",
      value: `LKR ${fmtMoney(approvedAmt)}`,
      sub: "Authorized to spend",
      icon: BadgeCheck,
    },
    {
      label: "Draft Orders",
      value: draftCount.toLocaleString(),
      sub: "Awaiting approval",
      icon: FileEdit,
    },
  ];

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
            onClick={exportCSV}
            variant="outline"
            className="h-8 text-xs gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            Export CSV
          </Button>
          {canManagePOs && (
            <Button
              size="sm"
              onClick={() => openDrawer()}
              className="h-8 text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Issue PO
            </Button>
          )}
        </div>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-lg px-3.5 py-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <s.icon className="w-3.5 h-3.5 text-muted-foreground/60" />
            </div>
            <div className="text-[15px] font-semibold tracking-tight text-foreground mt-1 truncate">
              {s.value}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-auto flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search PO #…"
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchInput(val);
              if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
              searchTimerRef.current = setTimeout(() => {
                setSearch(val);
                setPage(1);
              }, 300);
            }}
            className="h-8 text-xs pl-8 bg-card border-border"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
                status === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {s || "All"}
            </button>
          ))}
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
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">Order Date</th>
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
                    <td className="py-2.5 px-3"><div className="h-3 w-20 bg-muted rounded" /></td>
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
                    <td className="py-2.5 px-3">
                      <div className="text-foreground font-medium truncate max-w-[220px]">
                        {p.job?.name || "—"}
                      </div>
                      {p.tender?.tender_number && (
                        <div className="text-[10px] text-muted-foreground truncate max-w-[220px]">
                          Tender {p.tender.tender_number}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[160px]">
                      {p.customer?.name || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {fmtDate(p.po_date)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-foreground">
                      {fmtMoney(p.po_amount)}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => downloadPO(p)}
                          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {canViewAudit && (
                          <button
                            onClick={() => setAuditPOId(p.id)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                            title="View History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canManagePOs && (
                          <>
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
                          </>
                        )}
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
        description={
          selectedPO
            ? "Update order specifics, amount, or advance the order lifecycle"
            : "Configure order specifics, amount, and project allocation"
        }
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
                disabled={!!selectedPO}
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Amount (LKR)</Label>
              <Input
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
              <Label className="text-[11px] text-muted-foreground uppercase">Job *</Label>
              <select
                required
                value={form.job_id}
                onChange={(e) => setF("job_id", e.target.value)}
                className="h-8 w-full px-2 mt-1 text-xs bg-background border border-border rounded-md outline-none"
                disabled={!!selectedPO}
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
              <Label className="text-[11px] text-muted-foreground uppercase">Tender *</Label>
              <select
                required
                value={form.tender_id}
                onChange={(e) => setF("tender_id", e.target.value)}
                className="h-8 w-full px-2 mt-1 text-xs bg-background border border-border rounded-md outline-none"
                disabled={!!selectedPO}
              >
                <option value="">Select Tender</option>
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tender_number} — {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Vendor *</Label>
              <select
                required
                value={form.customer_id}
                onChange={(e) => setF("customer_id", e.target.value)}
                className="h-8 w-full px-2 mt-1 text-xs bg-background border border-border rounded-md outline-none"
                disabled={!!selectedPO}
              >
                <option value="">Select Vendor</option>
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
              <Label className="text-[11px] text-muted-foreground uppercase">Order Date *</Label>
              <Input
                required
                type="date"
                value={form.po_date}
                onChange={(e) => setF("po_date", e.target.value)}
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">
                Status{selectedPO ? " (lifecycle)" : ""}
              </Label>
              <select
                value={form.status}
                onChange={(e) => setF("status", e.target.value)}
                className="h-8 w-full px-2 mt-1 text-xs bg-background border border-border rounded-md outline-none"
              >
                {allowedStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {selectedPO && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Current: {selectedPO.status} — only valid lifecycle transitions are offered.
                </p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-[11px] text-muted-foreground uppercase">Scope / Description</Label>
            <Textarea
              value={form.po_description}
              onChange={(e) => setF("po_description", e.target.value)}
              rows={2}
              placeholder="Requisition specifications or items list (one item per line)"
              className="text-xs mt-1"
            />
          </div>

          <div>
            <Label className="text-[11px] text-muted-foreground uppercase">Billing / Delivery Address *</Label>
            <Textarea
              required
              value={form.billing_address}
              onChange={(e) => setF("billing_address", e.target.value)}
              rows={2}
              placeholder="Site or billing address for this order"
              className="text-xs mt-1"
            />
          </div>

          {statusChanged && (
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">
                Change Note
              </Label>
              <Textarea
                value={form.reason}
                onChange={(e) => setF("reason", e.target.value)}
                rows={2}
                placeholder={`Reason for moving to ${form.status} (recorded in the audit trail)`}
                className="text-xs mt-1"
              />
            </div>
          )}
        </div>
      </FormModal>

      {/* Audit Trail Modal */}
      {auditPOId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-card border border-border rounded-lg p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                Order Lifecycle History
              </h3>
              <button
                onClick={() => setAuditPOId(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <AuditTrail poId={auditPOId} onClose={() => setAuditPOId(null)} />
          </div>
        </div>
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
                This record will be permanently deleted from the procurement ledger.
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
