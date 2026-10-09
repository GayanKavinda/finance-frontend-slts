"use client";

import FormModal from "@/components/ui/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
        selectedJob
          ? "Update job details, value, or status"
          : "Configure job specifics, value, and project allocation"
      }
      onSubmit={onSubmit}
      submitText={selectedJob ? "Update Job" : "Create Job"}
      isSubmitting={isSubmitting}
      size="lg"
    >
      <div className="space-y-3">
        <Field label="Job / Project Name" required>
          <Input
            required
            value={form.name}
            onChange={(e) => setF("name", e.target.value)}
            placeholder="e.g. Fiber Backbone Phase 1"
            className="h-8 text-xs"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Customer" required>
            <Select value={form.customer_id} onValueChange={(value) => setF("customer_id", value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(value) => setF("status", value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Linked Tender" required>
          <Select value={form.tender_id} onValueChange={(value) => setF("tender_id", value)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select tender..." />
            </SelectTrigger>
            <SelectContent>
              {tenders.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.tender_number} — {t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Project Value (LKR)">
          <Input
            type="number"
            value={form.project_value}
            onChange={(e) => setF("project_value", e.target.value)}
            placeholder="0"
            className="h-8 text-xs"
          />
        </Field>

        <Field label="Scope / Description">
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => setF("description", e.target.value)}
            placeholder="Requisition specifications or items list (one item per line)"
            className="text-xs"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Work Start Date">
            <Input
              type="date"
              value={form.work_start_date}
              onChange={(e) => setF("work_start_date", e.target.value)}
              className="h-8 text-xs"
            />
          </Field>
          <Field label="Completion Date">
            <Input
              type="date"
              value={form.work_completion_date}
              onChange={(e) => setF("work_completion_date", e.target.value)}
              className="h-8 text-xs"
            />
          </Field>
        </div>
      </div>
    </FormModal>
  );
}