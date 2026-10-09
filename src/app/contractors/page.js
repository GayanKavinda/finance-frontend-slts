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
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const STATUS_CONFIG = {
  Active: {
    label: "Active",
  },
  Blacklisted: {
    label: "Blacklisted",
  },
};

const Field = ({ label, children, required }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
      {label}{required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);

function ContractorCard({ contractor, onEdit, onDelete }) {
  const isBlacklisted = contractor.status === "Blacklisted";

  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:shadow-sm transition-shadow">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-foreground truncate">
                {contractor.name}
              </span>
              <Badge
                variant={isBlacklisted ? "destructive" : "success"}
                className="text-[10px]"
              >
                {isBlacklisted ? "Blacklisted" : "Active"}
              </Badge>
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
    <Card className="p-3 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-2.5 bg-muted rounded w-1/4" />
        <div className="space-y-1.5">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-4/5" />
        </div>
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

  const statCards = [
    {
      label: "Total",
      value: contractors.length.toLocaleString(),
      icon: HardHat,
    },
    {
      label: "Active",
      value: activeCount.toLocaleString(),
      icon: Shield,
    },
    {
      label: "Avg Rating",
      value: `${avgRating}★`,
      icon: Award,
    },
  ];

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
      {/* Zen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Contractors
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {contractors.length} service provider{contractors.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => openDrawer()}
          className="h-8 text-xs gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Contractor
        </Button>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg px-3.5 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <s.icon className="w-3.5 h-3.5 text-muted-foreground/60" />
            </div>
            <div className="text-[15px] font-semibold tracking-tight text-foreground mt-1 truncate">
              {s.value}
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
            placeholder="Search contractors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs pl-8 bg-card border-border"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["", "Active", "Blacklisted"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 bg-card border border-border rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
              <HardHat className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium text-foreground">
              No contractors found
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">
              Create your first contractor to get started
            </p>
            <Button
              onClick={() => openDrawer()}
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Contractor
            </Button>
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
        <div className="space-y-3">
          <Field label="Company Name" required>
            <Input
              required
              value={form.name}
              onChange={(e) => setF("name", e.target.value)}
              placeholder="e.g. ABC Construction"
              className="h-8 text-xs"
            />
          </Field>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Contact Person">
              <Input
                value={form.contact_person}
                onChange={(e) => setF("contact_person", e.target.value)}
                placeholder="Full name"
                className="h-8 text-xs"
              />
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(value) => setF("status", value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Blacklisted">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setF("email", e.target.value)}
                placeholder="email@co.com"
                className="h-8 text-xs"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setF("phone", e.target.value)}
                placeholder="+94 77…"
                className="h-8 text-xs"
              />
            </Field>
          </div>

          <div className="rounded-lg border bg-muted p-3 space-y-2.5">
            <p className="text-sm font-medium">Banking Details</p>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Bank Name">
                <Input
                  value={form.bank_name}
                  onChange={(e) => setF("bank_name", e.target.value)}
                  placeholder="e.g. BOC"
                  className="h-8 text-xs"
                />
              </Field>
              <Field label="Account No.">
                <Input
                  value={form.bank_account_number}
                  onChange={(e) => setF("bank_account_number", e.target.value)}
                  placeholder="0000000000"
                  className="h-8 text-xs"
                />
              </Field>
            </div>
          </div>

          <Field label="Tax ID">
            <Input
              value={form.tax_id}
              onChange={(e) => setF("tax_id", e.target.value)}
              placeholder="VAT-…"
              className="h-8 text-xs"
            />
          </Field>

          <Field label="Address">
            <Textarea
              rows={2}
              value={form.address}
              onChange={(e) => setF("address", e.target.value)}
              placeholder="Physical address"
              className="text-xs"
            />
          </Field>

          <Field label="Performance Rating">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setF("rating", s)}
                  className={`p-1.5 rounded-md transition-colors ${
                    form.rating >= s ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Star className={`w-4 h-4 ${form.rating >= s ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>
          </Field>

          <Field label="Internal Notes">
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setF("notes", e.target.value)}
              placeholder="Any internal notes…"
              className="text-xs"
            />
          </Field>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="w-full max-w-xs bg-card border border-border rounded-lg p-4 shadow-xl space-y-3 text-center">
            <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground">Delete Contractor?</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                This record will be permanently deleted.
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