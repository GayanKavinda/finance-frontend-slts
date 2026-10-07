"use client";

import FormModal from "@/components/ui/FormModal";

const inputCls =
  "w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400";

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
      {label}
    </label>
    {children}
  </div>
);

export default function JobFormModal({
  isOpen,
  onClose,
  selectedJob,
  form,
  setF,
  customers = [],
  tenders = [],
  onSubmit,
  isSubmitting,
}) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedJob ? "Update Job" : "Create Job"}
      description={
        selectedJob ? "Edit job details" : "Create a new project job"
      }
      onSubmit={onSubmit}
      submitText={selectedJob ? "Update" : "Create"}
      isSubmitting={isSubmitting}
      size="lg"
    >
      <div className="space-y-4">
        <Field label="Job / Project Name *">
          <input
            required
            value={form.name}
            onChange={(e) => setF("name", e.target.value)}
            placeholder="e.g. Fiber Backbone Phase 1"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Customer *">
            <select
              required
              value={form.customer_id}
              onChange={(e) => setF("customer_id", e.target.value)}
              className={inputCls}
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setF("status", e.target.value)}
              className={inputCls}
            >
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </Field>
        </div>

        <Field label="Linked Tender *">
          <select
            required
            value={form.tender_id}
            onChange={(e) => setF("tender_id", e.target.value)}
            className={inputCls}
          >
            <option value="">Select tender...</option>
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tender_number} — {t.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Project Value (LKR)">
          <input
            type="number"
            value={form.project_value}
            onChange={(e) => setF("project_value", e.target.value)}
            placeholder="0"
            className={inputCls}
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setF("description", e.target.value)}
            placeholder="Brief scope..."
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Work Start Date">
            <input
              type="date"
              value={form.work_start_date}
              onChange={(e) => setF("work_start_date", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Completion Date">
            <input
              type="date"
              value={form.work_completion_date}
              onChange={(e) => setF("work_completion_date", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </div>
    </FormModal>
  );
}
