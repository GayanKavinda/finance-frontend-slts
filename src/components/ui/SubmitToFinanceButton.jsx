import React, { useState } from "react";
import { fetchInvoiceSubmit } from "@/lib/invoice";
import { toast } from "@/lib/toast";

export default function SubmitToFinanceButton({ invoiceId, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
    toast.promise(fetchInvoiceSubmit(invoiceId), {
      loading: "Submitting to Procurement...",
      success: "Invoice submitted to Procurement successfully!",
      error: "Failed to submit invoice.",
    }).then(() => {
      onSuccess();
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={loading}
      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Submitting..." : "Submit to Procurement"}
    </button>
  );
}
