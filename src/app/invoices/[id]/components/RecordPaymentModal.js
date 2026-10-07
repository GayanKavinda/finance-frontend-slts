// src/app/invoices/[id]/components/RecordPaymentModal.js
"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

export default function RecordPaymentModal({ invoice, onConfirm, onClose, loading }) {
  const totalAmount = Number(invoice.total_amount || invoice.invoice_amount || 0);
  const totalReceived = Number(invoice.payment_amount || 0);
  const balanceDue = Math.max(0, totalAmount - totalReceived);

  const [form, setForm] = useState({
    cheque_number: "",
    bank_name: "",
    payment_method: "Cheque",
    milestone_name: "Installment Milestone",
    payment_amount: balanceDue > 0 ? balanceDue : totalAmount,
    retention_amount: "",
    payment_received_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const valid =
    (form.cheque_number.trim() || form.payment_method !== "Cheque") &&
    form.payment_amount > 0 &&
    form.payment_received_date;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-strong overflow-hidden border border-border my-4">
        <div className="bg-primary/5 border-b border-border px-6 py-5 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Record Milestone Payment
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Installment & Retention Tracking
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Balance Overview */}
        <div className="px-6 pt-5 pb-2">
          <div className="p-4 bg-muted/50 rounded-xl border border-border flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase block">Total Invoice</span>
              <span className="text-base font-medium text-foreground">
                LKR {totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-medium text-muted-foreground uppercase block">Received</span>
              <span className="text-base font-medium text-emerald-600">
                LKR {totalReceived.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-medium text-muted-foreground uppercase block">Balance Due</span>
              <span className="text-base font-medium text-amber-600">
                LKR {balanceDue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Previous Payments History */}
        {invoice?.payments && invoice.payments.length > 0 && (
          <div className="px-6 pt-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Previous Installments ({invoice.payments.length})
            </p>
            <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
              {invoice.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-2 bg-muted/50 rounded-lg text-xs font-medium"
                >
                  <span className="text-foreground">
                    {p.milestone_name || "Payment"} ({p.payment_date})
                  </span>
                  <span className="font-medium text-emerald-600">
                    LKR {Number(p.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Milestone / Installment Name
            </label>
            <input
              required
              value={form.milestone_name}
              onChange={(e) => setForm({ ...form, milestone_name: e.target.value })}
              className="w-full bg-background border border-input p-3 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. 30% Advance, 2nd Milestone, Final Settlement"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Payment Amount (LKR) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={form.payment_amount}
                onChange={(e) => setForm({ ...form, payment_amount: e.target.value })}
                className="w-full bg-background border border-input p-3 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Retention Money (LKR)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.retention_amount}
                onChange={(e) => setForm({ ...form, retention_amount: e.target.value })}
                className="w-full bg-background border border-input p-3 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Cheque No. / Transaction Ref
              </label>
              <input
                required
                value={form.cheque_number}
                onChange={(e) => setForm({ ...form, cheque_number: e.target.value })}
                className="w-full bg-background border border-input p-3 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. CHQ-9281, TRF-019"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Bank Name
              </label>
              <input
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                className="w-full bg-background border border-input p-3 rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. BOC, Sampath"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Received Date *
            </label>
            <input
              type="date"
              required
              value={form.payment_received_date}
              onChange={(e) => setForm({ ...form, payment_received_date: e.target.value })}
              className="w-full bg-background border border-input p-3 rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-muted/50 border-t border-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-background border border-input rounded-xl font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(form)}
            disabled={!valid || loading}
            className="flex-[2] py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Record Installment
          </button>
        </div>
      </div>
    </div>
  );
}
