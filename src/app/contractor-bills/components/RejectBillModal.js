"use client";

import FormModal from "@/components/ui/FormModal";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Field = ({ label, children, required }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
      {label}{required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);

export default function RejectBillModal({
  isOpen,
  onClose,
  rejectionReason,
  setRejectionReason,
  handleReject,
}) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Bill"
      description="Provide a reason for rejecting this contractor bill"
      onSubmit={handleReject}
      submitText="Confirm Rejection"
      variant="destructive"
      size="md"
    >
      <div className="space-y-3">
        <Field label="Reason for Rejection" required>
          <Textarea
            required
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this bill is being rejected..."
            className="text-xs"
          />
        </Field>
      </div>
    </FormModal>
  );
}