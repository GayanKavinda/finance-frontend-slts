"use client";

import {
  Building2,
  Download,
  Upload,
  Verified,
  Plus,
  CheckCircle2,
  X,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <Card className="rounded-[2.5rem] p-8 hover:shadow-2xl transition-all duration-500 group border-none shadow-xl shadow-gray-100 dark:shadow-none bg-white dark:bg-gray-800 overflow-hidden relative">
      <div className="flex flex-col lg:flex-row justify-between gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  #{bill.bill_number}
                </h3>
                <p className="font-bold text-gray-500 dark:text-gray-400">
                  {bill.contractor.name}
                </p>
              </div>
            </div>
            <StatusBadge status={bill.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Job / Project
              </p>
              <p className="font-bold text-sm truncate text-gray-800 dark:text-gray-200">
                {bill.job.name}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Amount
              </p>
              <p className="font-black text-sm text-gray-800 dark:text-gray-100">
                LKR {Number(bill.amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Date
              </p>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                {new Date(bill.bill_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {bill.documents?.map((doc) => (
                <a
                  key={doc.id}
                  href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${doc.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold"
                  title={doc.document_type}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">DL</span>
                </a>
              ))}
              {bill.status === "Draft" && (
                <button
                  type="button"
                  onClick={() => onOpenUpload(bill)}
                  className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-72 flex flex-col justify-center gap-3">
          {bill.status === "Draft" && canVerify && (
            <button
              type="button"
              onClick={() => onVerify(bill.id)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black transition-all"
            >
              <Verified className="w-4 h-4" /> Verify (Proc.)
            </button>
          )}

          {bill.status === "Verified" && canSubmitToFinance && (
            <button
              type="button"
              onClick={() => onSubmitToFinance(bill.id)}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-2xl font-black transition-all"
            >
              <Plus className="w-4 h-4" /> Submit to Finance
            </button>
          )}

          {bill.status === "Verified" && canVerify && (
            <button
              type="button"
              className="w-full py-2 text-xs text-gray-400 font-bold hover:text-gray-600 underline"
              onClick={() => onOpenUpload(bill)}
            >
              Edit Attachments
            </button>
          )}

          {bill.status === "Submitted" && canApprove && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onApprove(bill.id)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-black transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve (Fin.)
              </button>
              <button
                type="button"
                onClick={() => onOpenReject(bill)}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-2xl font-bold transition-all"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          )}

          {bill.status === "Approved" && canRecordPayment && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onOpenPayment(bill)}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-2xl font-black transition-all"
              >
                <CreditCard className="w-4 h-4" /> Record Payment
              </button>
              <button
                type="button"
                onClick={() => onOpenReject(bill)}
                className="w-full text-xs text-red-400 font-bold hover:text-red-500 underline"
              >
                Reject Approved Bill
              </button>
            </div>
          )}

          {bill.status === "Rejected" && (
            <div className="w-full p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
                Rejection Reason
              </p>
              <p className="text-xs font-bold text-red-700 italic">
                &quot;{bill.rejection_reason}&quot;
              </p>
              <button
                type="button"
                onClick={() => onVerify(bill.id)}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold text-xs transition-all"
              >
                Re-Verify
              </button>
            </div>
          )}

          {bill.status === "Paid" && (
            <div className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Ref
                  </p>
                  <p className="font-bold text-xs truncate text-gray-800 dark:text-gray-200">
                    {bill.payment_reference}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Bank
                  </p>
                  <p className="font-bold text-xs truncate text-gray-800 dark:text-gray-200">
                    {bill.bank_name}
                  </p>
                </div>
              </div>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-2">
                Paid LKR {Number(bill.payment_amount).toLocaleString()} on{" "}
                {new Date(bill.paid_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
