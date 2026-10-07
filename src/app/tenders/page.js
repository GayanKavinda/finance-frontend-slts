// src/app/tenders/page.js
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  fetchTenders,
  createTender,
  updateTender,
  deleteTender,
  fetchCustomers,
  downloadTenderAwardLetter,
} from "@/lib/procurement";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import FormModal from "@/components/ui/FormModal";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TendersPage() {
  const router = useRouter();
  const searchTimerRef = useRef(null);

  const [tenders, setTenders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    tender_number: "",
    customer_id: "",
    name: "",
    description: "",
    awarded_amount: "",
    budget: "",
    start_date: "",
    end_date: "",
    status: "Open",
  });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        fetchTenders({ page, status: statusFilter, search }),
        fetchCustomers({ per_page: 100 }),
      ]);
      setTenders(tRes.data || []);
      setMeta(tRes.meta || {});
      setCustomers(cRes.data || []);
    } catch {
      toast.error("Failed to load tenders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openDrawer = (tender = null) => {
    setSelectedTender(tender);
    setForm(
      tender
        ? {
            tender_number: tender.tender_number || "",
            customer_id: tender.customer_id || "",
            name: tender.name || "",
            description: tender.description || "",
            awarded_amount: tender.awarded_amount || "",
            budget: tender.budget || "",
            start_date: tender.start_date || "",
            end_date: tender.end_date || "",
            status: tender.status || "Open",
          }
        : {
            tender_number: "",
            customer_id: "",
            name: "",
            description: "",
            awarded_amount: "",
            budget: "",
            start_date: "",
            end_date: "",
            status: "Open",
          },
    );
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedTender) {
        await updateTender(selectedTender.id, form);
        toast.success("Tender updated");
      } else {
        await createTender(form);
        toast.success("Tender created");
      }
      setDrawerOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save tender");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTender(id);
      toast.success("Tender deleted");
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleDownloadAward = async (tender) => {
    try {
      const blob = await downloadTenderAwardLetter(tender.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Award-Letter-${tender.tender_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Award letter downloaded");
    } catch (err) {
      toast.error("Failed to download award letter");
    }
  };

  const total = meta.total ?? tenders.length;
  const openCount = tenders.filter((t) => t.status === "Open").length;

  return (
    <>
      <LoadingOverlay isLoading={saving} message={selectedTender ? "Updating Tender..." : "Creating Tender..."} />
      <div className="min-h-full p-4 sm:p-6 space-y-4">
        {/* Zen Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Tenders & Bids
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Public and commercial procurement bidding pipeline and contracts register.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => openDrawer()}
              className="h-8 text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Tender
            </Button>
          </div>
        </div>

        {/* Control Strip & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tender # or title…"
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
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 px-2.5 bg-card border border-border rounded-md text-xs font-medium text-foreground outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="text-xs text-muted-foreground hidden sm:block">
            <span>{total} tenders</span>
            <span className="mx-1.5">·</span>
            <span className="text-foreground font-medium">{openCount} active bids</span>
          </div>
        </div>

        {/* Zen Compact Data Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Tender #</th>
                  <th className="py-2.5 px-3">Title / Scope</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-right">Budget (LKR)</th>
                  <th className="py-2.5 px-3 text-right">Awarded (LKR)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-2.5 px-3.5"><div className="h-3 w-20 bg-muted rounded" /></td>
                      <td className="py-2.5 px-3"><div className="h-3 w-36 bg-muted rounded" /></td>
                      <td className="py-2.5 px-3"><div className="h-3 w-28 bg-muted rounded" /></td>
                      <td className="py-2.5 px-3 text-right"><div className="h-3 w-20 bg-muted rounded ml-auto" /></td>
                      <td className="py-2.5 px-3 text-right"><div className="h-3 w-20 bg-muted rounded ml-auto" /></td>
                      <td className="py-2.5 px-3"><div className="h-4 w-14 bg-muted rounded" /></td>
                      <td className="py-2.5 px-3.5 text-right"><div className="h-4 w-12 bg-muted rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : tenders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No tenders found matching query</p>
                    </td>
                  </tr>
                ) : (
                  tenders.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-3.5 font-medium text-foreground">
                        {t.tender_number}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground truncate max-w-[220px]">
                        {t.name}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[180px]">
                        {t.customer?.name || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground font-medium">
                        {t.budget ? Number(t.budget).toLocaleString() : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-foreground">
                        {t.awarded_amount ? Number(t.awarded_amount).toLocaleString() : "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {t.awarded_amount > 0 && (
                            <button
                              onClick={() => handleDownloadAward(t)}
                              className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                              title="Award Letter"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openDrawer(t)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(t.id)}
                            className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
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
              Page {page} of {meta.last_page} ({total} tenders)
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

      {/* Tender Form Modal */}
      <FormModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedTender ? "Edit Tender" : "New Tender"}
        description="Configure bid specifications and financial allocations"
        onSubmit={handleSubmit}
        submitText={selectedTender ? "Update Tender" : "Save Tender"}
        isSubmitting={saving}
        size="lg"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Tender Number *</Label>
              <Input
                required
                value={form.tender_number}
                onChange={(e) => setF("tender_number", e.target.value)}
                placeholder="e.g. TND-2026-001"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Customer / Client</Label>
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

          <div>
            <Label className="text-[11px] text-muted-foreground uppercase">Title / Name *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setF("name", e.target.value)}
              placeholder="e.g. Highway Expansion Phase II"
              className="h-8 text-xs mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Budget (LKR)</Label>
              <Input
                type="number"
                value={form.budget}
                onChange={(e) => setF("budget", e.target.value)}
                placeholder="e.g. 5000000"
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Awarded Amount (LKR)</Label>
              <Input
                type="number"
                value={form.awarded_amount}
                onChange={(e) => setF("awarded_amount", e.target.value)}
                placeholder="e.g. 4800000"
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Status</Label>
              <select
                value={form.status}
                onChange={(e) => setF("status", e.target.value)}
                className="h-8 w-full px-2 mt-1 text-xs bg-background border border-border rounded-md outline-none"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Awarded">Awarded</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">Start Date</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setF("start_date", e.target.value)}
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase">End Date</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setF("end_date", e.target.value)}
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-[11px] text-muted-foreground uppercase">Scope Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setF("description", e.target.value)}
              rows={2}
              placeholder="Outline project terms and conditions"
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
              <h3 className="text-xs font-semibold text-foreground">Delete Tender?</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                All associated records and progress will be detached.
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
    </>
  );
}
