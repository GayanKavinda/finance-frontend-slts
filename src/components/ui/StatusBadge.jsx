// src/components/ui/StatusBadge.jsx
import React from "react";

const STATUS_COLORS = {
  Draft: "bg-gray-200 text-gray-800",
  "Tax Generated": "bg-blue-100 text-blue-600",
  Submitted: "bg-amber-100 text-amber-600",
  Approved: "bg-green-100 text-green-600",
  Rejected: "bg-red-100 text-red-600",
  Paid: "bg-teal-100 text-teal-600",
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