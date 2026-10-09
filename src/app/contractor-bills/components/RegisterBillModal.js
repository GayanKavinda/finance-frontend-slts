"use client";

import FormModal from "@/components/ui/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const Field = ({ label, children, required }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
      {label}{required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);

export default function RegisterBillModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  jobs = [],
  contractors = [],
}) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Contractor Bill"
      description="Create a new contractor bill draft for verification workflow"
      onSubmit={onSubmit}
      submitText="Create Bill Draft"
      size="lg"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Job" required>
            <Select value={form.job_id} onValueChange={(value) => setForm({...form, job_id: value})}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select Job..." />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Contractor" required>
            <Select value={form.contractor_id} onValueChange={(value) => setForm({...form, contractor_id: value})}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select Contractor..." />
              </SelectTrigger>
              <SelectContent>
                {contractors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Bill Number" required>
          <Input
            required
            value={form.bill_number}
            onChange={(e) => setForm({...form, bill_number: e.target.value})}
            placeholder="e.g. CB-2026-001"
            className="h-8 text-xs"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Amount (LKR)">
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({...form, amount: e.target.value})}
              placeholder="0"
              className="h-8 text-xs"
            />
          </Field>
          <Field label="Bill Date" required>
            <Input
              type="date"
              required
              value={form.bill_date}
              onChange={(e) => setForm({...form, bill_date: e.target.value})}
              className="h-8 text-xs"
            />
          </Field>
        </div>

        <Field label="Notes">
          <input
            value={form.notes}
            onChange={(e) => setForm({...form, notes: e.target.value})}
            placeholder="Additional notes..."
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </Field>
      </div>
    </FormModal>
  );
}