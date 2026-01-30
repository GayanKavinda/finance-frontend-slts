"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function CreateInvoicePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    invoice_number: "",
    customer_id: "",
    po_id: "",
    invoice_amount: "",
    invoice_date: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
      e.preventDefault();
      try {
        await axios.post("/api/invoices", form);
        toast.success("Invoice created as draft successfully");
        router.push("/invoices");
      } catch (err) {
        toast.error("Failed to create invoice");
      }
    };
  };

  return (
    <div className="max-w-xl p-6">
      <h1 className="text-xl font-bold mb-4">Create Invoice</h1>

      <form onSubmit={handleChange} className="space-y-4">
        <input
          name="invoice_number"
          placeholder="Invoice Number"
          onChange={handleChange}
          className="input"
        />
        <input
          name="customer_id"
          placeholder="Customer ID"
          onChange={handleChange}
          className="input"
        />
        <input
          name="po_id"
          placeholder="PO ID"
          onChange={handleChange}
          className="input"
        />
        <input
          name="invoice_amount"
          placeholder="Amount"
          onChange={handleChange}
          className="input"
        />
        <input
          type="date"
          name="invoice_date"
          onChange={handleChange}
          className="input"
        />

        <button className="btn-primary w-full">Save Draft</button>
      </form>
    </div>
  );
}
