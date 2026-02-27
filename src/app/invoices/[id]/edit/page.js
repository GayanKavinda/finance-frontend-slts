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
      setModalOpen(false);
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
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            <ArrowLeft size={16} /> Back to Invoice
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <Save size={18} />
            Edit Invoice
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">
                Invoice Number
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {invoice.invoice_number}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">
                  Amount
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  LKR {Number(invoice.invoice_amount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">
                  Date
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {invoice.invoice_date ? invoice.invoice_date.split("T")[0] : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Invoice Draft"
        description={`Update details for ${invoice.invoice_number}`}
        onSubmit={handleSubmit}
        submitText="Update"
        isSubmitting={saving}
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice_amount">Invoice Amount (LKR) *</Label>
            <Input
              id="invoice_amount"
              name="invoice_amount"
              type="number"
              step="0.01"
              value={invoice.invoice_amount}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_date">Invoice Date *</Label>
            <Input
              id="invoice_date"
              type="date"
              name="invoice_date"
              value={
                invoice.invoice_date ? invoice.invoice_date.split("T")[0] : ""
              }
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </FormModal>
    </>
  );
}
