// src/components/ui/SubmitToFinanceButton.jsx
import React, { useState } from "react";
import { fetchInvoiceSubmit } from "@/lib/invoice";
import { toast } from "react-hot-toast";

export default function SubmitToFinanceButton({ invoiceId, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetchInvoiceSubmit(invoiceId);
      toast.success("Invoice submitted to finance successfully!");
      onSuccess();
    } catch (err) {
      toast.error("Failed to submit invoice.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={loading}
      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Submitting..." : "Submit to Finance"}
    </button>
  );
}
