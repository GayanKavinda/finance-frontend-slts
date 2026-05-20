// src/components/invoices/StatusBadge.js
"use client";

const STATUS_COLORS = {
  Draft: "bg-gray-100 text-gray-700 border-gray-200",
  "Tax Generated": "bg-blue-50 text-blue-700 border-blue-200",
  Submitted: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  "Payment Received": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Banked: "bg-teal-50 text-teal-700 border-teal-200",
  Paid: "bg-teal-50 text-teal-700 border-teal-200", // Legacy
};

export default function StatusBadge({ status }) {
  const cls =
    STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
