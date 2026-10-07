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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-red-600">Reject Bill</h2>
          <button type="button" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleReject} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
              Reason for Rejection
            </label>
            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-bold resize-none"
              placeholder="Explain why this bill is being rejected..."
            />
          </div>
          <button
            type="submit"
            className="w-full py-4.5 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200"
          >
            Confirm Rejection
          </button>
        </form>
      </div>
    </div>
  );
}
