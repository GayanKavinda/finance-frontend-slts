// src/app/invoices/[id]/components/RecordPaymentModal.js
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function RecordPaymentModal({ invoice, onConfirm, onClose, loading }) {
  const [form, setForm] = useState({
    cheque_number: "",
    bank_name: "",
    payment_amount: invoice.invoice_amount || "",
    payment_received_date: new Date().toISOString().split("T")[0],
  });

  const valid =
    form.cheque_number.trim() && form.bank_name.trim() && form.payment_amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/20 px-8 py-6">
          <h3 className="font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-tighter text-xl">
            Record Received Cheque
          </h3>
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1 opacity-60">
            Prepare Internal Receipt
          </p>
        </div>
        <div className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Cheque Number / Reference
            </label>
            <input
              required
              value={form.cheque_number}
              onChange={(e) =>
                setForm({ ...form, cheque_number: e.target.value })
              }
              className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Bank Name
            </label>
            <input
              required
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Received Date
              </label>
              <input
                type="date"
                value={form.payment_received_date}
                onChange={(e) =>
                  setForm({ ...form, payment_received_date: e.target.value })
                }
                className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Amount
              </label>
              <input
                type="number"
                value={form.payment_amount}
                onChange={(e) =>
                  setForm({ ...form, payment_amount: e.target.value })
                }
                className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-100 font-black"
              />
            </div>
          </div>
        </div>
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-white dark:bg-gray-800 rounded-2xl font-bold transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(form)}
            disabled={!valid || loading}
            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Generate Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
