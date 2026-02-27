// src/app/invoices/create/page.js
"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Loader2, Info, Plus } from "lucide-react";
// Removed duplicate Layout wrapper
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

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Cascading data
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
  });

  // Load all tenders on mount
  useEffect(() => {
    const loadTenders = async () => {
      try {
        const res = await fetchTenders();
        setTenders(res.data || []);
      } catch (error) {
        toast.error("Failed to load tenders");
      }
    };
    loadTenders();
  }, []);

  // Cascading Effect: When Tender changes, load Jobs and set Customer
  useEffect(() => {
    if (form.tender_id) {
      const selectedTender = tenders.find((t) => t.id == form.tender_id);
      if (selectedTender) {
        setForm((prev) => ({
          ...prev,
          customer_id: selectedTender.customer_id,
        }));

        const loadJobsForTender = async () => {
          try {
            // In a real app, you might want a specific endpoint or filter
            // Our fetchJobs takes search or you can filter.
            // Let's assume the API returns enough or we filter.
            const res = await fetchJobs({ tender_id: form.tender_id });
            // If API doesn't support tender_id filter yet, we'd need to fix it or filter client-side
            // Our Job model has tender_id, so let's assume it works.
            setJobs(res.data || []);
          } catch (error) {
            console.error("Failed to load jobs");
          }
        };
        loadJobsForTender();
      }
    } else {
      setJobs([]);
      setForm((prev) => ({ ...prev, job_id: "", customer_id: "" }));
    }
  }, [form.tender_id, tenders]);

  // Cascading Effect: When Job changes, load POs
  useEffect(() => {
    if (form.job_id) {
      const loadPOsForJob = async () => {
        try {
          const res = await fetchPurchaseOrders({ job_id: form.job_id });
          setPos(res.data || []);
        } catch (error) {
          console.error("Failed to load POs");
        }
      };
      loadPOsForJob();
    } else {
      setPos([]);
      setForm((prev) => ({ ...prev, po_id: "" }));
    }
  }, [form.job_id]);

  // Auto-set amount when PO is selected
  useEffect(() => {
    if (form.po_id) {
      const selectedPO = pos.find((p) => p.id == form.po_id);
      if (selectedPO) {
        setForm((prev) => ({ ...prev, invoice_amount: selectedPO.po_amount }));
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/invoices"
              className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                Invoices
              </h1>
              <p className="text-gray-500 font-medium">
                Manage revenue invoices for clients
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create Invoice
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 text-center py-12">
            Click "Create Invoice" to draft a new revenue invoice
          </p>
        </div>
      </div>

      {/* Create Invoice Modal */}
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
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <Label htmlFor="po_id">Linked PO *</Label>
              <select
                id="po_id"
                required
                name="po_id"
                value={form.po_id}
                onChange={handleChange}
                disabled={!form.job_id}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number *</Label>
              <Input
                id="invoice_number"
                required
                name="invoice_number"
                value={form.invoice_number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    invoice_number: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g. SLT-INV-001"
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
            <Label htmlFor="invoice_amount">Invoice Amount (LKR) *</Label>
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

          {form.customer_id && (
            <div className="rounded-lg border bg-card text-card-foreground p-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Selected Customer</p>
                  <p className="text-sm text-muted-foreground">
                    {tenders.find((t) => t.id == form.tender_id)?.customer
                      ?.name || "Customer Identified"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </FormModal>
    </>
  );
}
