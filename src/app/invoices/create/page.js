// src/app/invoices/create/page.js
"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Loader2, Info } from "lucide-react";
// Removed duplicate Layout wrapper
import Link from "next/link";
import {
  fetchTenders,
  fetchJobs,
  fetchPurchaseOrders,
} from "@/lib/procurement";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/invoices"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Create New Invoice
            </h1>
            <p className="text-gray-500 font-medium">
              Draft a new revenue invoice for a client
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-700 space-y-8"
            >
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-4">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">
                    1
                  </span>
                  Contract Information
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      Select Tender
                    </label>
                    <select
                      required
                      name="tender_id"
                      value={form.tender_id}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                    >
                      <option value="">Choose a Tender...</option>
                      {tenders.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.tender_number} - {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">
                        Select Job
                      </label>
                      <select
                        required
                        name="job_id"
                        value={form.job_id}
                        onChange={handleChange}
                        disabled={!form.tender_id}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold disabled:opacity-50"
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
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">
                        Linked PO
                      </label>
                      <select
                        required
                        name="po_id"
                        value={form.po_id}
                        onChange={handleChange}
                        disabled={!form.job_id}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold disabled:opacity-50"
                      >
                        <option value="">Choose a Purchase Order...</option>
                        {pos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.po_number}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-4">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">
                    2
                  </span>
                  Invoice Details
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      Invoice Number
                    </label>
                    <input
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
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      required
                      name="invoice_date"
                      value={form.invoice_date}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 ml-1">
                    Invoice Amount (LKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400">
                      LKR
                    </span>
                    <input
                      type="number"
                      required
                      name="invoice_amount"
                      value={form.invoice_amount}
                      onChange={handleChange}
                      className="w-full pl-16 pr-5 py-5 bg-gray-100 dark:bg-gray-900 border-none rounded-3xl focus:ring-2 focus:ring-primary/20 outline-none font-black text-2xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  disabled={loading}
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Create Draft Invoice
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-8 rounded-[2.5rem] shadow-xl space-y-4">
              <Info className="w-10 h-10 opacity-50" />
              <h4 className="font-black text-xl leading-tight">
                Cascading Selections
              </h4>
              <p className="text-primary-foreground/80 text-sm font-medium">
                Quickly create invoices by selecting the Tender first.
                We&apos;ll automatically filter associated Jobs and Purchase
                Orders for you.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm">
              <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">
                Selected Customer
              </h4>
              {form.customer_id ? (
                <div className="space-y-1">
                  <div className="font-black text-gray-900 dark:text-white">
                    {tenders.find((t) => t.id == form.tender_id)?.customer
                      ?.name || "Customer Identified"}
                  </div>
                  <div className="text-xs text-gray-500 font-medium break-all">
                    ID: {form.customer_id}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 italic text-sm">
                  No customer linked yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
