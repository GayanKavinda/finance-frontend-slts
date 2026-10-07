// src/app/invoices/[id]/components/RejectModal.js
"use client";

import { useState } from "react";

export default function RejectModal({ invoiceNumber, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState("");
  const tooShort = reason.trim().length < 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-strong overflow-hidden border border-border">
        <div className="bg-destructive/5 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                Reject Invoice
              </h3>
              <p className="text-xs text-muted-foreground">
                {invoiceNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4 text-left">
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Rejection Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Describe the issue clearly..."
            className="w-full bg-background border border-input rounded-xl p-3 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <p className="text-[10px] text-muted-foreground text-right uppercase tracking-wider">
            {reason.length}/1000
          </p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-muted rounded-xl font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={tooShort || loading}
            className="flex-[2] py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-medium transition-colors disabled:opacity-50 text-sm"
          >
            Reject Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
