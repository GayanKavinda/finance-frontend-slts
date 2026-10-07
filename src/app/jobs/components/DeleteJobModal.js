"use client";

import { Trash2 } from "lucide-react";

export default function DeleteJobModal({
  isOpen,
  onClose,
  jobId,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 border border-border rounded-2xl shadow-sm w-full max-w-sm p-6">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-destructive" />
          </div>
          <h3 className="text-lg font-medium text-foreground">
            Delete Job?
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            This action cannot be undone. Jobs with purchase orders cannot be
            deleted.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-input bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(jobId)}
            className="flex-1 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
