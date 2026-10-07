"use client";

import { X, Upload } from "lucide-react";

export default function UploadDocumentModal({
  isOpen,
  onClose,
  uploadForm,
  setUploadForm,
  handleUpload,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-strong">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-foreground">Upload Document</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 bg-muted/50">
          <Upload className="w-10 h-10 text-muted-foreground" />
          <input
            type="file"
            onChange={(e) =>
              setUploadForm({ ...uploadForm, file: e.target.files[0] })
            }
            className="text-sm font-medium text-foreground"
          />
        </div>
        <select
          value={uploadForm.document_type}
          onChange={(e) =>
            setUploadForm({ ...uploadForm, document_type: e.target.value })
          }
          className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option>Contractor Bill</option>
          <option>Completion Certificate</option>
          <option>Site Photo</option>
          <option>Other Attachment</option>
        </select>
        <button
          type="button"
          onClick={handleUpload}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-colors"
        >
          Confirm Upload
        </button>
      </div>
    </div>
  );
}
