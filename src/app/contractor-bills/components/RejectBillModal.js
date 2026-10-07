"use client";

import { X } from "lucide-react";

export default function RejectBillModal({
  isOpen,
  onClose,
  rejectionReason,
  setRejectionReason,
  handleReject,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-strong">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-destructive">Reject Bill</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleReject} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Reason for Rejection
            </label>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Explain why this bill is being rejected..."
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-destructive text-destructive-foreground rounded-xl font-medium shadow-sm hover:bg-destructive/90 transition-colors"
          >
            Confirm Rejection
          </button>
        </form>
      </div>
    </div>
  );
}
