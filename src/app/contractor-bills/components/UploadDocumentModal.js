"use client";

import { X, Upload } from "lucide-react";
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

export default function UploadDocumentModal({
  isOpen,
  onClose,
  uploadForm,
  setUploadForm,
  handleUpload,
}) {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document"
      description="Attach supporting documents for contractor bill verification"
      onSubmit={handleUpload}
      submitText="Upload"
      size="md"
    >
      <div className="space-y-3">
        <Field label="File" required>
          <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 bg-muted/50">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <input
              type="file"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
              className="text-sm text-foreground w-full"
            />
            <p className="text-xs text-muted-foreground text-center">Drag & drop or click to select</p>
          </div>
        </Field>

        <Field label="Document Type" required>
          <Select value={uploadForm.document_type} onValueChange={(value) => setUploadForm({...uploadForm, document_type: value})}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select document type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Contractor Bill">Contractor Bill</SelectItem>
              <SelectItem value="Completion Certificate">Completion Certificate</SelectItem>
              <SelectItem value="Site Photo">Site Photo</SelectItem>
              <SelectItem value="Other Attachment">Other Attachment</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Description">
          <Input
            value={uploadForm.description}
            onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
            placeholder="Optional description..."
            className="h-8 text-xs"
          />
        </Field>
      </div>
    </FormModal>
  );
}