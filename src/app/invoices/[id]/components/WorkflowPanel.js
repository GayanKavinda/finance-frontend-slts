// src/app/invoices/[id]/components/WorkflowPanel.js
"use client";

import { fmtDateTime } from "@/lib/utils";
import StatusBadge from "@/components/invoices/StatusBadge";

export default function WorkflowPanel({ invoice }) {
  const STEPS = [
    "Draft",
    "Tax Generated",
    "Submitted",
    "Approved",
    "Payment Received",
    "Banked",
  ];
  const current = invoice.status === "Rejected" ? "Submitted" : invoice.status;
  const currentIdx = STEPS.indexOf(current);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Workflow Progress
      </h3>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-6">
        {STEPS.map((step, i) => {
          const done = currentIdx > i;
          const active = currentIdx === i && current !== "Rejected";
          const rejected = current === "Rejected" && step === "Submitted";

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                    ${done ? "bg-green-500  border-green-500  text-white" : ""}
                    ${active ? "bg-blue-500   border-blue-500   text-white scale-110" : ""}
                    ${rejected ? "bg-red-400    border-red-400    text-white" : ""}
                    ${!done && !active && !rejected ? "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400" : ""}
                  `}
                >
                  {done ? "✓" : rejected ? "✗" : i + 1}
                </div>
                <span
                  className={`text-xs mt-1 text-center leading-tight hidden sm:block
                    ${done ? "text-green-600 font-medium" : active ? "text-blue-600 font-semibold" : "text-gray-400"}`}
                  style={{ maxWidth: 56 }}
                >
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 rounded ${done ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Rejection banner */}
      {current === "Rejected" && invoice.rejection_reason && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
            Rejected by Procurement
          </p>
          <p className="text-sm text-red-800 dark:text-red-400">{invoice.rejection_reason}</p>
          <p className="text-xs text-red-500 mt-1">
            Rejected by {invoice.rejecter?.name} on{" "}
            {fmtDateTime(invoice.rejected_at)}
          </p>
        </div>
      )}

      {/* Who did what */}
      <div className="space-y-2">
        {invoice.submitter && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Submitted by</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {invoice.submitter.name} · {fmtDateTime(invoice.submitted_at)}
            </span>
          </div>
        )}
        {invoice.approver && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Approved by</span>
            <span className="font-medium text-green-700 dark:text-green-400">
              {invoice.approver.name} · {fmtDateTime(invoice.approved_at)}
            </span>
          </div>
        )}
        {invoice.rejecter && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Rejected by</span>
            <span className="font-medium text-red-700 dark:text-red-400">
              {invoice.rejecter.name} · {fmtDateTime(invoice.rejected_at)}
            </span>
          </div>
        )}
        {invoice.recordedBy && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Payment recorded by</span>
            <span className="font-medium text-indigo-700 dark:text-indigo-400">
              {invoice.recordedBy.name} ·{" "}
              {fmtDateTime(invoice.payment_received_date)}
            </span>
          </div>
        )}
        {invoice.status === "Banked" && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Banked at</span>
            <span className="font-medium text-teal-700 dark:text-teal-400">
              {fmtDateTime(invoice.banked_at)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
