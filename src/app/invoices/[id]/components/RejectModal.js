// src/app/invoices/[id]/components/RejectModal.js
"use client";

import { useState } from "react";

export default function RejectModal({ invoiceNumber, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState("");
  const tooShort = reason.trim().length < 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
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
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                Reject Invoice
              </h3>
              <p className="text-xs text-red-600/60 font-bold">
                {invoiceNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4 text-left">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
            Rejection Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Describe the issue clearly..."
            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-100 outline-none resize-none"
          />
          <p className="text-[10px] text-gray-400 font-bold text-right uppercase tracking-widest">
            {reason.length}/1000
          </p>
        </div>
        <div className="px-6 py-5 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={tooShort || loading}
            className="flex-[2] py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all disabled:opacity-50"
          >
            Reject Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
