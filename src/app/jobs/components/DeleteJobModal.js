"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeleteJobModal({
  isOpen,
  onClose,
  jobId,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-xs bg-card border border-border rounded-lg p-4 shadow-xl space-y-3 text-center">
        <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <Trash2 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground">Delete Job?</h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            This record will be permanently deleted from the jobs ledger.
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onConfirm(jobId)}
            className="flex-1 h-8 text-xs"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}