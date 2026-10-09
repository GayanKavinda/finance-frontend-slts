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
import { Button } from "@/components/ui/button";

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
  const fmtMoney = (n) =>
    Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      <div className="p-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Details */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-xs text-foreground tracking-tight">
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
                Date: <span className="text-foreground">{fmtDate(bill.bill_date)}</span>
              </span>
              <span>·</span>
              <span>
                Amount:{" "}
                <strong className="text-xs font-semibold text-foreground">
                  LKR {fmtMoney(bill.amount)}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenUpload(bill)}
                className="h-7 px-2.5 text-xs gap-1"
                title="Upload attachment"
              >
                <Upload className="w-3 h-3" />
                <span>Attach</span>
              </Button>
            )}

            {/* Workflow Stage Buttons */}
            {bill.status === "Draft" && canVerify && (
              <Button
                size="sm"
                onClick={() => onVerify(bill.id)}
                className="h-7 px-2.5 text-xs gap-1"
              >
                <FileCheck className="w-3 h-3" />
                Verify
              </Button>
            )}

            {bill.status === "Verified" && canSubmitToFinance && (
              <Button
                size="sm"
                onClick={() => onSubmitToFinance(bill.id)}
                className="h-7 px-2.5 text-xs gap-1"
              >
                <Send className="w-3 h-3" />
                Submit
              </Button>
            )}

            {bill.status === "Submitted" && canApprove && (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  onClick={() => onApprove(bill.id)}
                  className="h-7 px-2.5 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="w-3 h-3" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenReject(bill)}
                  className="h-7 px-2 text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <X className="w-3 h-3" />
                  Reject
                </Button>
              </div>
            )}

            {bill.status === "Approved" && canRecordPayment && (
              <Button
                size="sm"
                onClick={() => onOpenPayment(bill)}
                className="h-7 px-2.5 text-xs gap-1"
              >
                <CreditCard className="w-3 h-3" />
                Pay
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}