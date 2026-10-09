// app/invoices/[id]/edit/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { canEditInvoice } from "@/lib/permissions";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import FormModal from "@/components/ui/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";

const fmtMoney = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

export default function EditInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/invoices/${id}`);
      setInvoice(res.data);
    } catch (err) {
      setError("Failed to load invoice or not authorized.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user) return;
    loadInvoice();
  }, [user, loadInvoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEditInvoice(user?.permissions)) return;

    try {
      setSaving(true);
      await api.put(`/invoices/${id}`, {
        invoice_amount:
          invoice.invoice_amount === "" ? 0 : Number(invoice.invoice_amount),
        invoice_date: invoice.invoice_date,
        billing_address: invoice.billing_address,
        customer_po_number: invoice.customer_po_number,
        customer_po_description: invoice.customer_po_description,
      });
      router.push(`/invoices/${id}`);
    } catch (err) {
      alert(err.response?.data?.message ?? "Failed to update invoice");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-full p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center py-12 bg-card border border-border rounded-lg">
          <p className="text-sm font-medium text-foreground">{error || "Invoice not found."}</p>
          <Button variant="outline" size="sm" onClick={() => router.back()} className="mt-3 flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const permissions = user?.permissions ?? [];
  if (!canEditInvoice(permissions) || invoice.status !== "Draft") {
    return (
      <div className="min-h-full p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center py-12 bg-card border border-border rounded-lg">
          <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <Loader2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-foreground">Editing Not Allowed</p>
          <p className="text-xs text-muted-foreground mt-1 text-center max-w-md">
            Editing is only allowed for Draft invoices with proper permissions.
          </p>
          <Button variant="outline" size="sm" onClick={() => router.back()} className="mt-3 flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const Field = ({ label, children, required }) => (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
    </div>
  );

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
      {/* Zen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-widest mb-1">
              Invoice Edit
            </div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              {invoice.invoice_number}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update draft invoice details
            </p>
          </div>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="h-8 text-xs gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Save Changes
        </Button>
      </div>

      {/* Invoice Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Invoice Number</p>
              <p className="text-base font-semibold text-foreground">{invoice.invoice_number}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Amount</p>
                <p className="text-lg font-semibold text-foreground">LKR {fmtMoney(invoice.invoice_amount)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Date</p>
                <p className="text-base font-medium text-foreground">{fmtDate(invoice.invoice_date)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Status</p>
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          {(invoice.billing_address || invoice.customer_po_number || invoice.customer_po_description) && (
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {invoice.billing_address && (
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Billing Address</p>
                  <p className="text-foreground truncate">{invoice.billing_address}</p>
                </div>
              )}
              {invoice.customer_po_number && (
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Customer PO #</p>
                  <p className="text-foreground font-medium">{invoice.customer_po_number}</p>
                </div>
              )}
              {invoice.customer_po_description && (
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">PO Description</p>
                  <p className="text-foreground truncate max-w-xs">{invoice.customer_po_description}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Invoice Draft"
        description={`Update details for ${invoice.invoice_number}`}
        onSubmit={handleSubmit}
        submitText="Update Invoice"
        isSubmitting={saving}
        size="md"
      >
        <div className="space-y-3">
          <Field label="Invoice Amount (LKR)" required>
            <Input
              type="number"
              step="0.01"
              required
              value={invoice.invoice_amount}
              onChange={handleChange}
              placeholder="0.00"
              className="h-8 text-xs"
            />
          </Field>

          <Field label="Invoice Date" required>
            <Input
              type="date"
              required
              value={invoice.invoice_date ? invoice.invoice_date.split("T")[0] : ""}
              onChange={handleChange}
              className="h-8 text-xs"
            />
          </Field>

          <Field label="Manual Billing Address">
            <Textarea
              rows={2}
              value={invoice.billing_address || ""}
              onChange={handleChange}
              placeholder="Enter manual billing address if different from customer default..."
              className="text-xs"
            />
          </Field>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Customer PO Number">
              <Input
                value={invoice.customer_po_number || ""}
                onChange={handleChange}
                placeholder="e.g. CUST-PO-123"
                className="h-8 text-xs"
              />
            </Field>
            <Field label="Customer PO Description">
              <Input
                value={invoice.customer_po_description || ""}
                onChange={handleChange}
                placeholder="e.g. Advance payment for milestone 1"
                className="h-8 text-xs"
              />
            </Field>
          </div>
        </div>
      </FormModal>
    </div>
  );
}