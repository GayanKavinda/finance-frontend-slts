// src/app/invoices/[id]/components/MarkAsBankedModal.js
"use client";

import { useState } from "react";

export default function MarkAsBankedModal({ onConfirm, onClose, loading }) {
  const [form, setForm] = useState({
    banked_at: new Date().toISOString().split("T")[0],
    bank_reference: "",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-strong overflow-hidden border border-border">
        <div className="bg-primary/5 p-6 text-center space-y-2">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground">
            Mark as Banked
          </h3>
          <p className="text-xs text-muted-foreground">
            Verify that the funds are cleared in the corporate account
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Banking Date
            </label>
            <input
              type="date"
              value={form.banked_at}
              onChange={(e) => setForm({ ...form, banked_at: e.target.value })}
              className="w-full bg-background border border-input p-3 rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Bank Reference (Optional)
            </label>
            <input
              value={form.bank_reference}
              onChange={(e) =>
                setForm({ ...form, bank_reference: e.target.value })
              }
              placeholder="DEPOSIT-REF-..."
              className="w-full bg-background border border-input p-3 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-muted rounded-xl font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(form)}
            disabled={loading}
            className="flex-[2] py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors disabled:opacity-50 text-sm"
          >
            Confirm Banking
          </button>
        </div>
      </div>
    </div>
  );
}
