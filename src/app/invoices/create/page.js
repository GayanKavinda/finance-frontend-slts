// src/app/invoices/create/page.js
"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Loader2, Info, Plus } from "lucide-react";
import Link from "next/link";
import {
  fetchTenders,
  fetchJobs,
  fetchPurchaseOrders,
} from "@/lib/procurement";
import FormModal from "@/components/ui/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [tenders, setTenders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [pos, setPos] = useState([]);

  const [form, setForm] = useState({
    invoice_number: "",
    customer_id: "",
    tender_id: "",
    job_id: "",
    po_id: "",
    invoice_amount: "",
    invoice_date: new Date().toISOString().split("T")[0],
    billing_address: "",
    customer_po_number: "",
    customer_po_description: "",
  });

  useEffect(() => {
    const loadTenders = async () => {
      try {
        const res = await fetchTenders();
        setTenders(res.data || []);
      } catch {
        toast.error("Failed to load tenders");
      }
    };
    loadTenders();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (form.tender_id) {
        const selectedTender = tenders.find((t) => t.id == form.tender_id);
        if (selectedTender) {
          setForm((prev) => ({
            ...prev,
            customer_id: selectedTender.customer_id,
          }));
          try {
            const res = await fetchJobs({ tender_id: form.tender_id });
            setJobs(res.data || []);
          } catch {
            console.error("Failed to load jobs");
          }
        }
      } else {
        setJobs([]);
        setForm((prev) => ({ ...prev, job_id: "", customer_id: "" }));
      }
    };
    run();
  }, [form.tender_id, tenders]);

  useEffect(() => {
    const run = async () => {
      if (form.job_id) {
        try {
          const res = await fetchPurchaseOrders({ job_id: form.job_id });
          setPos(res.data || []);
        } catch {
          console.error("Failed to load POs");
        }
      } else {
        setPos([]);
        setForm((prev) => ({ ...prev, po_id: "" }));
      }
    };
    run();
  }, [form.job_id]);

  useEffect(() => {
    if (form.po_id) {
      const selectedPO = pos.find((p) => p.id == form.po_id);
      if (selectedPO) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm((prev) => ({
          ...prev,
          invoice_amount: selectedPO.po_amount,
          customer_po_number: selectedPO.po_number,
          customer_po_description: selectedPO.description || "",
        }));
      }
    }
  }, [form.po_id, pos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        invoice_amount:
          form.invoice_amount === "" ? 0 : Number(form.invoice_amount),
      };
      await axios.post("/invoices", payload);
      toast.success("Invoice created as draft successfully");
      router.push("/invoices");
    } catch {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/invoices"
              className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-medium tracking-tight text-foreground">
                Create Invoice
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Draft a new revenue invoice
              </p>
            </div>
          </div>

          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Invoice
          </Button>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <p className="text-sm text-muted-foreground text-center py-8">
            Click &quot;Create Invoice&quot; to draft a new revenue invoice
          </p>
        </div>
      </div>

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Invoice"
        description="Draft a new revenue invoice for a client"
        onSubmit={handleSubmit}
        submitText="Create Draft"
        isSubmitting={loading}
        size="xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tender_id">Select Tender *</Label>
            <select
              id="tender_id"
              required
              name="tender_id"
              value={form.tender_id}
              onChange={handleChange}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Choose a Tender...</option>
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tender_number} - {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_id">Select Job *</Label>
              <select
                id="job_id"
                required
                name="job_id"
                value={form.job_id}
                onChange={handleChange}
                disabled={!form.tender_id}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Choose a Job...</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="po_id">Select PO</Label>
              <select
                id="po_id"
                name="po_id"
                value={form.po_id}
                onChange={handleChange}
                disabled={!form.job_id}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Choose a PO...</option>
                {pos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.po_number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_number">Invoice Number *</Label>
            <Input
              id="invoice_number"
              required
              name="invoice_number"
              value={form.invoice_number}
              onChange={handleChange}
              placeholder="INV-001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_amount">Amount (LKR) *</Label>
              <Input
                id="invoice_amount"
                type="number"
                required
                name="invoice_amount"
                value={form.invoice_amount}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_date">Invoice Date *</Label>
              <Input
                id="invoice_date"
                type="date"
                required
                name="invoice_date"
                value={form.invoice_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_address">Billing Address</Label>
            <textarea
              id="billing_address"
              name="billing_address"
              value={form.billing_address}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Customer billing address..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_po_number">Customer PO Number</Label>
            <Input
              id="customer_po_number"
              name="customer_po_number"
              value={form.customer_po_number}
              onChange={handleChange}
              placeholder="Customer PO reference"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_po_description">Description / Notes</Label>
            <textarea
              id="customer_po_description"
              name="customer_po_description"
              value={form.customer_po_description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Invoice details or terms..."
            />
          </div>
        </div>
      </FormModal>
    </>
  );
}
