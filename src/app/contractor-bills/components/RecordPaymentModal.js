"use client";

import { X } from "lucide-react";

export default function RecordPaymentModal({
  isOpen,
  onClose,
  selectedBill,
  paymentForm,
  setPaymentForm,
  handlePayment,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black">Record Payment</h2>
          <button type="button" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-sm font-bold text-primary">
            Paying #{selectedBill?.bill_number}
          </p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            LKR {Number(selectedBill?.amount).toLocaleString()}
          </p>
        </div>
        <form onSubmit={handlePayment} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                Reference
              </label>
              <input
                required
                value={paymentForm.payment_reference}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    payment_reference: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-black"
                placeholder="Chq No..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                Bank Name
              </label>
              <input
                required
                value={paymentForm.bank_name}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    bank_name: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-black"
                placeholder="e.g. BOC, Sampath"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                Amount Paid
              </label>
              <input
                type="number"
                required
                value={paymentForm.payment_amount}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    payment_amount: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-black"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                Date
              </label>
              <input
                type="date"
                required
                value={paymentForm.paid_at}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    paid_at: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-bold"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-4.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20"
          >
            Mark as Paid
          </button>
        </form>
      </div>
    </div>
  );
}
