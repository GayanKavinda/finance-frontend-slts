"use client";

import { X, Calendar, DollarSign, ShieldAlert, Layers } from "lucide-react";

export default function RecordPaymentModal({
  isOpen,
  onClose,
  selectedBill,
  paymentForm,
  setPaymentForm,
  handlePayment,
}) {
  if (!isOpen) return null;

  const totalAmount = Number(selectedBill?.amount || 0);
  const totalPaid = Number(
    selectedBill?.payments?.reduce((s, p) => s + Number(p.amount || 0), 0) ||
      selectedBill?.payment_amount ||
      0
  );
  const totalRetention = Number(
    selectedBill?.payments?.reduce(
      (s, p) => s + Number(p.retention_amount || 0),
      0
    ) || 0
  );
  const balanceDue = Math.max(0, totalAmount - (totalPaid + totalRetention));

  return (
    <div className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-2xl p-6 space-y-5 shadow-strong my-4">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              Record Milestone Payment
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Disburse installment or release retention money
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

        {/* Financial Summary Card */}
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">
                Bill #{selectedBill?.bill_number}
              </p>
              <p className="text-lg font-medium text-foreground">
                Total: LKR {totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-medium text-amber-600 uppercase tracking-wider block">
                Outstanding Balance
              </span>
              <span className="text-base font-medium text-amber-600">
                LKR {balanceDue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-primary/10 text-xs font-medium text-muted-foreground">
            <div>
              <span>Disbursed to Date: </span>
              <span className="font-medium text-emerald-600">
                LKR {totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span>Retention Withheld: </span>
              <span className="font-medium text-primary">
                LKR {totalRetention.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Existing Installments History if any */}
        {selectedBill?.payments && selectedBill.payments.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Previous Installments ({selectedBill.payments.length})
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
              {selectedBill.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-2.5 bg-muted/50 rounded-lg text-xs"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {p.milestone_name || "Installment"}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-2">
                      ({p.payment_date})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-emerald-600">
                      LKR {Number(p.amount).toLocaleString()}
                    </span>
                    {Number(p.retention_amount) > 0 && (
                      <span className="text-[10px] text-primary block">
                        +LKR {Number(p.retention_amount).toLocaleString()} ret.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Milestone / Installment Description
            </label>
            <input
              required
              value={paymentForm.milestone_name || ""}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  milestone_name: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. 30% Advance, 2nd Milestone, Final Retention Release"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Disbursement Amount (LKR) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={paymentForm.payment_amount}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    payment_amount: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Retention Deducted (LKR)
              </label>
              <input
                type="number"
                step="0.01"
                value={paymentForm.retention_amount || ""}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    retention_amount: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="0.00 (optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Reference / Chq No. *
              </label>
              <input
                required
                value={paymentForm.payment_reference}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    payment_reference: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. TXN-9281, CHQ-4029"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Bank Name *
              </label>
              <input
                required
                value={paymentForm.bank_name}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    bank_name: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Commercial Bank, BOC"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={paymentForm.paid_at}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  paid_at: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            Record Milestone Disbursement
          </button>
        </form>
      </div>
    </div>
  );
}
