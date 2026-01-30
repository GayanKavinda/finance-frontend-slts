"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function EditInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    axios.get(`/api/invoices/${id}`).then((res) => {
      setInvoice(res.data);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/invoice/${id}`, invoice);
      toast.success("Invoice updated successfully");
      router.push("/invoices");
    } catch {
      toast.error("Edit not allowed");
    }
  };

  if (!invoice) return null;

  return (
    <div className="max-w-xl p-6">
      <h1 className="text-xl font-bold mb-4">Edit Invoice</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="invoice_amount"
          value={invoice.invoice_amount}
          onChange={handleChange}
          className="input"
        />
        <input
          type="date"
          name="invoice_date"
          value={invoice.invoice_date}
          onChange={handleChange}
          className="input"
        />

        <button className="btn-primary w-full">Update Draft</button>
      </form>
    </div>
  );
}