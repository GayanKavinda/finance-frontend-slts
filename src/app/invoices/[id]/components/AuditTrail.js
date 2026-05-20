// src/app/invoices/[id]/components/AuditTrail.js
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import StatusBadge from "@/components/invoices/StatusBadge";
import { fmtDateTime } from "@/lib/utils";

const TIMELINE_ICONS = {
  created: { bg: "bg-gray-100", icon: "📄" },
  Submitted: { bg: "bg-amber-100", icon: "📤" },
  Approved: { bg: "bg-green-100", icon: "✅" },
  Rejected: { bg: "bg-red-100", icon: "❌" },
  "Payment Received": { bg: "bg-indigo-100", icon: "🧾" },
  Banked: { bg: "bg-teal-100", icon: "🏦" },
  Paid: { bg: "bg-teal-100", icon: "💳" },
  "Tax Generated": { bg: "bg-blue-100", icon: "🧾" },
};

export default function AuditTrail({ invoiceId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/invoices/${invoiceId}/audit-trail`)
      .then((r) => setHistory(r.data))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!history.length) {
    return <p className="text-sm text-gray-400">No history yet.</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 ml-3">
      {history.map((entry, i) => {
        const meta = TIMELINE_ICONS[entry.new_status] ?? {
          bg: "bg-gray-100",
          icon: "🔄",
        };
        return (
          <li key={entry.id ?? i} className="mb-6 ml-5">
            <span
              className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white ${meta.bg} text-base`}
            >
              {meta.icon}
            </span>

            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {entry.old_status && (
                    <>
                      <StatusBadge status={entry.old_status} />
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </>
                  )}
                  <StatusBadge status={entry.new_status} />
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {fmtDateTime(entry.created_at)}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                By{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {entry.user?.name ?? "System"}
                </span>
              </p>

              {entry.reason && (
                <div className="mt-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg px-3 py-2 text-sm text-red-700 dark:text-red-400">
                  <span className="font-medium">Reason:</span> {entry.reason}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
