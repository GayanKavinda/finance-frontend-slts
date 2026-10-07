"use client";

import {
  Download,
  Upload,
  Check,
  CreditCard,
  Send,
  X,
  FileCheck,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ContractorBillCard({
  bill,
  canVerify,
  canSubmitToFinance,
  canApprove,
  canRecordPayment,
  onOpenUpload,
  onVerify,
  onSubmitToFinance,
  onApprove,
  onOpenReject,
  onOpenPayment,
}) {
  return (
    <div className="p-3.5 bg-card border border-border rounded-lg hover:border-border/80 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Main Details */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs text-foreground tracking-tight">
              #{bill.bill_number}
            </span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-xs font-medium text-foreground truncate max-w-[220px]">
              {bill.contractor?.name}
            </span>
            <StatusBadge status={bill.status} />
          </div>

          <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
            <span>
              Job: <strong className="font-medium text-foreground">{bill.job?.name}</strong>
            </span>
            <span>·</span>
            <span>
              Date: <span className="text-foreground">{bill.bill_date ? new Date(bill.bill_date).toLocaleDateString() : "—"}</span>
            </span>
            <span>·</span>
            <span>
              Amount:{" "}
              <strong className="text-xs font-semibold text-foreground">
                LKR {Number(bill.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>
        </div>

        {/* Actions & Documents */}
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {/* Document list */}
          {bill.documents?.map((doc) => (
            <a
              key={doc.id}
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${doc.file_path}`}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-1 text-muted-foreground hover:text-foreground rounded border border-border/50 hover:bg-muted text-[10px] flex items-center gap-1"
              title={doc.document_type}
            >
              <Download className="w-3 h-3" />
              <span>Doc</span>
            </a>
          ))}

          {bill.status === "Draft" && (
            <button
              type="button"
              onClick={() => onOpenUpload(bill)}
              className="p-1 text-muted-foreground hover:text-foreground rounded border border-border/50 hover:bg-muted text-[10px] flex items-center gap-1"
              title="Upload attachment"
            >
              <Upload className="w-3 h-3" />
              <span>Attach</span>
            </button>
          )}

          {/* Workflow Stage Buttons */}
          {bill.status === "Draft" && canVerify && (
            <button
              type="button"
              onClick={() => onVerify(bill.id)}
              className="h-7 px-2.5 bg-foreground text-background text-xs font-medium rounded hover:opacity-90 flex items-center gap-1"
            >
              <FileCheck className="w-3 h-3" />
              Verify
            </button>
          )}

          {bill.status === "Verified" && canSubmitToFinance && (
            <button
              type="button"
              onClick={() => onSubmitToFinance(bill.id)}
              className="h-7 px-2.5 bg-foreground text-background text-xs font-medium rounded hover:opacity-90 flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              Submit to Finance
            </button>
          )}

          {bill.status === "Submitted" && canApprove && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onApprove(bill.id)}
                className="h-7 px-2.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => onOpenReject(bill)}
                className="h-7 px-2 border border-destructive/30 text-destructive text-xs rounded hover:bg-destructive/10 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Reject
              </button>
            </div>
          )}

          {bill.status === "Approved" && canRecordPayment && (
            <button
              type="button"
              onClick={() => onOpenPayment(bill)}
              className="h-7 px-2.5 bg-foreground text-background text-xs font-medium rounded hover:opacity-90 flex items-center gap-1"
            >
              <CreditCard className="w-3 h-3" />
              Pay Bill
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
