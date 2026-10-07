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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black">Upload Document</h2>
          <button type="button" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900/50">
          <Upload className="w-12 h-12 text-primary/40" />
          <input
            type="file"
            onChange={(e) =>
              setUploadForm({ ...uploadForm, file: e.target.files[0] })
            }
            className="text-sm font-medium"
          />
        </div>
        <select
          value={uploadForm.document_type}
          onChange={(e) =>
            setUploadForm({ ...uploadForm, document_type: e.target.value })
          }
          className="w-full px-5 py-3.5 bg-gray-100 dark:bg-gray-900 rounded-2xl border-none font-bold"
        >
          <option>Contractor Bill</option>
          <option>Completion Certificate</option>
          <option>Site Photo</option>
          <option>Other Attachment</option>
        </select>
        <button
          type="button"
          onClick={handleUpload}
          className="w-full py-4.5 bg-primary text-white rounded-2xl font-black"
        >
          Confirm Upload
        </button>
      </div>
    </div>
  );
}
