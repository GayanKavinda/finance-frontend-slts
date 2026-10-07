"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchContractors,
  createContractor,
  updateContractor,
  deleteContractor,
} from "@/lib/contractor";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Phone,
  Mail,
  Building2,
  Star,
  Banknote,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Shield,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormModal from "@/components/ui/FormModal";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { Badge } from "@/components/ui/Badge";

const STATUS_CONFIG = {
  Active: {
    label: "Active",
  },
  Blacklisted: {
    label: "Blacklisted",
  },
};

function StarRating({ rating, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange && onChange(s)}
          className={`p-1.5 rounded-md transition-colors ${
            rating >= s ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Star className={`w-4 h-4 ${rating >= s ? "fill-current" : ""}`} />
        </button>
      ))}
    </div>
  );
}

function ContractorCard({ contractor, onEdit, onDelete }) {
  const isBlacklisted = contractor.status === "Blacklisted";

  return (
    <div className="p-3 bg-card border border-border rounded-lg hover:border-border/80 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-foreground truncate">
                {contractor.name}
              </span>
              {isBlacklisted ? (
                <span className="text-[10px] px-1 py-0.2 bg-destructive/10 text-destructive rounded">
                  Blacklisted
                </span>
              ) : (
                <span className="text-[10px] px-1 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {contractor.contact_person || "No contact person specified"}
            </p>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => onEdit(contractor)}
              className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
              title="Edit"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(contractor.id)}
              className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2 text-[10px] text-muted-foreground">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i <= (contractor.rating || 0)
                  ? "text-amber-500 fill-current"
                  : "text-muted"
              }`}
            />
          ))}
          <span className="ml-1 font-medium text-foreground">
            {contractor.rating ? `${contractor.rating}/5` : "Unrated"}
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-muted-foreground">
          {contractor.email && (
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{contractor.email}</span>
            </div>
          )}
          {contractor.phone && (
            <div className="flex items-center gap-1.5 truncate">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span>{contractor.phone}</span>
            </div>
          )}
          {contractor.bank_name && (
            <div className="flex items-center gap-1.5 truncate text-[10px]">
              <Banknote className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{contractor.bank_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card className="p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3.5 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
      </div>
    </Card>
  );
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    bank_name: "",
    bank_account_number: "",
    tax_id: "",
    status: "Active",
    rating: 0,
    notes: "",
  });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchContractors();
        if (!cancelled) setContractors(data || []);
      } catch {
        if (!cancelled) toast.error("Failed to load contractors");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const openDrawer = (c = null) => {
    setSelectedContractor(c);
    setForm(
      c
        ? {
            name: c.name || "",
            contact_person: c.contact_person || "",
            email: c.email || "",
            phone: c.phone || "",
            address: c.address || "",
            bank_name: c.bank_name || "",
            bank_account_number: c.bank_account_number || "",
            tax_id: c.tax_id || "",
            status: c.status || "Active",
            rating: c.rating || 0,
            notes: c.notes || "",
          }
        : {
            name: "",
            contact_person: "",
            email: "",
            phone: "",
            address: "",
            bank_name: "",
            bank_account_number: "",
            tax_id: "",
            status: "Active",
            rating: 0,
            notes: "",
          },
    );
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedContractor) {
        await updateContractor(selectedContractor.id, form);
        toast.success("Contractor updated");
      } else {
        await createContractor(form);
        toast.success("Contractor created");
      }
      setDrawerOpen(false);
      let cancelled = false;
      setLoading(true);
      try {
        const data = await fetchContractors();
        if (!cancelled) setContractors(data || []);
      } catch {
        if (!cancelled) toast.error("Failed to load contractors");
      } finally {
        if (!cancelled) setLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save contractor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContractor(id);
      toast.success("Contractor deleted");
      setDeleteConfirm(null);
      let cancelled = false;
      setLoading(true);
      try {
        const data = await fetchContractors();
        if (!cancelled) setContractors(data || []);
      } catch {
        if (!cancelled) toast.error("Failed to load contractors");
      } finally {
        if (!cancelled) setLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const filtered = contractors.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.name?.toLowerCase().includes(q) ||
      c.contact_person?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = contractors.filter(
    (c) => c.status !== "Blacklisted",
  ).length;
  const avgRating = contractors.length
    ? (
        contractors.reduce((s, c) => s + (c.rating || 0), 0) /
        contractors.length
      ).toFixed(1)
    : "0.0";

  return (
    <>
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              Contractors
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {contractors.length} service provider
              {contractors.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={() => openDrawer()}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Contractor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: HardHat,
              label: "Total",
              value: contractors.length,
            },
            {
              icon: Shield,
              label: "Active",
              value: activeCount,
            },
            {
              icon: Award,
              label: "Avg Rating",
              value: `${avgRating}\u2605`,
            },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium tracking-tight text-foreground">
                      {value}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search contractors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-2">
            {["", "Active", "Blacklisted"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                onClick={() => setStatusFilter(s)}
                className="text-xs"
              >
                {s || "All"}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
              <HardHat className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No contractors found</p>
            </div>
          ) : (
            filtered.map((c) => (
              <ContractorCard
                key={c.id}
                contractor={c}
                onEdit={openDrawer}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Drawer */}
      <FormModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedContractor ? "Update Contractor" : "Add Contractor"}
        description={selectedContractor ? "Edit contractor information" : "Create a new contractor"}
        onSubmit={handleSubmit}
        submitText={selectedContractor ? "Update" : "Create"}
        isSubmitting={saving}
        size="lg"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => setF("name", e.target.value)}
            placeholder="e.g. ABC Construction"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              value={form.contact_person}
              onChange={(e) => setF("contact_person", e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setF("status", e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="Active">Active</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setF("email", e.target.value)}
              placeholder="email@co.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setF("phone", e.target.value)}
              placeholder="+94 77…"
            />
          </div>
        </div>
        <div className="rounded-lg border bg-muted p-4 space-y-3">
          <p className="text-sm font-medium">Banking Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={form.bank_name}
                onChange={(e) => setF("bank_name", e.target.value)}
                placeholder="e.g. BOC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account_number">Account No.</Label>
              <Input
                id="bank_account_number"
                value={form.bank_account_number}
                onChange={(e) =>
                  setF("bank_account_number", e.target.value)
                }
                placeholder="0000000000"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax_id">Tax ID</Label>
          <Input
            id="tax_id"
            value={form.tax_id}
            onChange={(e) => setF("tax_id", e.target.value)}
            placeholder="VAT-…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            rows={2}
            value={form.address}
            onChange={(e) => setF("address", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Performance Rating</Label>
          <StarRating
            rating={form.rating}
            onChange={(v) => setF("rating", v)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Internal Notes</Label>
          <Textarea
            id="notes"
            rows={2}
            value={form.notes}
            onChange={(e) => setF("notes", e.target.value)}
            placeholder="Any internal notes…"
          />
        </div>
      </FormModal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Delete Contractor?
              </h3>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
