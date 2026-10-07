"use client";

import { X } from "lucide-react";

export default function RegisterBillModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  jobs = [],
  contractors = [],
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-black">Register Contractor Bill</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-gray-400">
                Job
              </label>
              <select
                required
                value={form.job_id}
                onChange={(e) =>
                  setForm({ ...form, job_id: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold"
              >
                <option value="">Select Job</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-gray-400">
                Contractor
              </label>
              <select
                required
                value={form.contractor_id}
                onChange={(e) =>
                  setForm({ ...form, contractor_id: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold"
              >
                <option value="">Select Contractor</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-gray-400">
              Bill Number
            </label>
            <input
              required
              value={form.bill_number}
              onChange={(e) =>
                setForm({ ...form, bill_number: e.target.value })
              }
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-gray-400">
                Amount (LKR)
              </label>
              <input
                type="number"
                required
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-gray-400">
                Date
              </label>
              <input
                type="date"
                required
                value={form.bill_date}
                onChange={(e) =>
                  setForm({ ...form, bill_date: e.target.value })
                }
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-4.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20"
          >
            Create Bill Draft
          </button>
        </form>
      </div>
    </div>
  );
}
