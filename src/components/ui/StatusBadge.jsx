// src/components/ui/StatusBadge.jsx
import React from "react";

const STATUS_COLORS = {
  Draft: "bg-gray-200 text-gray-800",
  "Tax Generated": "bg-blue-100 text-blue-600",
  Submitted: "bg-amber-100 text-amber-600",
  Approved: "bg-emerald-100 text-emerald-600",
  Rejected: "bg-red-100 text-red-600",
  "Payment Received": "bg-indigo-100 text-indigo-600",
  Banked: "bg-teal-100 text-teal-600",
  Paid: "bg-teal-100 text-teal-600", // Legacy support
  Open: "bg-green-100 text-green-600",
  Closed: "bg-gray-100 text-gray-600",
  Pending: "bg-orange-100 text-orange-600",
  Active: "bg-emerald-100 text-emerald-600",
  Completed: "bg-blue-100 text-blue-600",
};

export default function StatusBadge({ status }) {
  const colorClass =
    STATUS_COLORS[status] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${colorClass}`}
    >
      {status}
    </span>
  );
}