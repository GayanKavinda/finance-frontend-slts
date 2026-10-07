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
    <div className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-2xl shadow-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-medium text-foreground">Register Contractor Bill</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Job
              </label>
              <select
                required
                value={form.job_id}
                onChange={(e) =>
                  setForm({ ...form, job_id: e.target.value })
                }
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
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
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Contractor
              </label>
              <select
                required
                value={form.contractor_id}
                onChange={(e) =>
                  setForm({ ...form, contractor_id: e.target.value })
                }
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
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
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Bill Number
            </label>
            <input
              required
              value={form.bill_number}
              onChange={(e) =>
                setForm({ ...form, bill_number: e.target.value })
              }
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Amount (LKR)
              </label>
              <input
                type="number"
                required
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </label>
              <input
                type="date"
                required
                value={form.bill_date}
                onChange={(e) =>
                  setForm({ ...form, bill_date: e.target.value })
                }
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            Create Bill Draft
          </button>
        </form>
      </div>
    </div>
  );
}
