// app/invoices/[id]/edit/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { canEditInvoice } from "@/lib/permissions";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
    if (user) loadInvoice();
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
      <div className="p-8 text-center text-gray-500">
        <p>{error || "Invoice not found."}</p>
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mt-2"
        >
          Go Back
        </button>
      </div>
    );
  }

  const permissions = user?.permissions ?? [];
  if (!canEditInvoice(permissions) || invoice.status !== "Draft") {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Editing is only allowed for Draft invoices with proper permissions.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft size={16} /> Back to Invoice
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Edit Invoice Draft
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
            {invoice.invoice_number}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Invoice Amount (LKR)
            </label>
            <input
              name="invoice_amount"
              type="number"
              step="0.01"
              value={invoice.invoice_amount}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 font-black text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Invoice Date
            </label>
            <input
              type="date"
              name="invoice_date"
              value={
                invoice.invoice_date ? invoice.invoice_date.split("T")[0] : ""
              }
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 font-bold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Update Draft
          </button>
        </form>
      </div>
    </div>
  );
}
