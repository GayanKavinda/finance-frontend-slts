// src/app/invoices/[id]/components/MarkAsBankedModal.js
"use client";

import { useState } from "react";

export default function MarkAsBankedModal({ onConfirm, onClose, loading }) {
  const [form, setForm] = useState({
    banked_at: new Date().toISOString().split("T")[0],
    bank_reference: "",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-sm overflow-hidden">
        <div className="bg-teal-50 dark:bg-teal-900/10 p-8 text-center space-y-2">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 mx-auto">
            <svg
              className="w-8 h-8"
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
          <h3 className="font-black text-teal-900 dark:text-teal-400 uppercase tracking-tighter text-xl">
            Mark as Banked
          </h3>
          <p className="text-xs text-teal-600/70 font-medium">
            Verify that the funds are cleared in the corporate account
          </p>
        </div>
        <div className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Banking Date
            </label>
            <input
              type="date"
              value={form.banked_at}
              onChange={(e) => setForm({ ...form, banked_at: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-teal-100 font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Bank Reference (Optional)
            </label>
            <input
              value={form.bank_reference}
              onChange={(e) =>
                setForm({ ...form, bank_reference: e.target.value })
              }
              placeholder="DEPOSIT-REF-..."
              className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-teal-100 font-bold"
            />
          </div>
        </div>
        <div className="p-8 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 rounded-2xl font-bold"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(form)}
            disabled={loading}
            className="flex-[2] py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-200 transition-all disabled:opacity-50"
          >
            Confirm Banking
          </button>
        </div>
      </div>
    </div>
  );
}
