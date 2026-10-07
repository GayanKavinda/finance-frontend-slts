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
    <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Workflow Progress
      </h3>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-5">
        {STEPS.map((step, i) => {
          const done = currentIdx > i;
          const active = currentIdx === i && current !== "Rejected";
          const rejected = current === "Rejected" && step === "Submitted";

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold border transition-all
                    ${done ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                    ${active ? "bg-primary border-primary text-primary-foreground" : ""}
                    ${rejected ? "bg-destructive border-destructive text-destructive-foreground" : ""}
                    ${!done && !active && !rejected ? "bg-muted border-border text-muted-foreground" : ""}
                  `}
                >
                  {done ? "✓" : rejected ? "✕" : i + 1}
                </div>
                <span
                  className={`text-[10.5px] mt-1 text-center leading-tight hidden sm:block
                    ${done ? "text-emerald-600 dark:text-emerald-400 font-medium" : active ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                  style={{ maxWidth: 64 }}
                >
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1.5 rounded ${done ? "bg-emerald-500" : "bg-border"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Rejection banner */}
      {current === "Rejected" && invoice.rejection_reason && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 mb-4">
          <p className="text-[11px] font-semibold text-destructive uppercase tracking-wide mb-1">
            Rejected by Procurement
          </p>
          <p className="text-xs text-destructive">{invoice.rejection_reason}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Rejected by {invoice.rejecter?.name} on{" "}
            {fmtDateTime(invoice.rejected_at)}
          </p>
        </div>
      )}

      {/* Who did what */}
      <div className="space-y-2 pt-2 border-t border-border">
        {invoice.submitter && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Submitted by</span>
            <span className="font-medium text-foreground">
              {invoice.submitter.name} · {fmtDateTime(invoice.submitted_at)}
            </span>
          </div>
        )}
        {invoice.approver && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Approved by</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {invoice.approver.name} · {fmtDateTime(invoice.approved_at)}
            </span>
          </div>
        )}
        {invoice.rejecter && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Rejected by</span>
            <span className="font-medium text-destructive">
              {invoice.rejecter.name} · {fmtDateTime(invoice.rejected_at)}
            </span>
          </div>
        )}
        {invoice.recordedBy && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Payment recorded by</span>
            <span className="font-medium text-foreground">
              {invoice.recordedBy.name} ·{" "}
              {fmtDateTime(invoice.payment_received_date)}
            </span>
          </div>
        )}
        {invoice.status === "Banked" && (
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Banked at</span>
            <span className="font-medium text-foreground">
              {fmtDateTime(invoice.banked_at)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
