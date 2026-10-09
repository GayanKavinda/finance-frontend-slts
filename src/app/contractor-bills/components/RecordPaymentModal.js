"use client";

import { X, Calendar, DollarSign, ShieldAlert, Layers } from "lucide-react";
import FormModal from "@/components/ui/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmtMoney = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Field = ({ label, children, required }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
      {label}{required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);

export default function RecordPaymentModal({
  isOpen,
  onClose,
  selectedBill,
  paymentForm,
  setPaymentForm,
  handlePayment,
}) {
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
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Milestone Payment"
      description="Disburse installment or release retention money"
      onSubmit={handlePayment}
      submitText="Record Payment"
      size="lg"
    >
      <div className="space-y-3">
        {/* Financial Summary Card */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-1.5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">
                Bill #{selectedBill?.bill_number}
              </p>
              <p className="text-base font-medium text-foreground">
                Total: LKR {fmtMoney(totalAmount)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-medium text-amber-600 uppercase tracking-wider block">
                Outstanding Balance
              </span>
              <span className="text-sm font-medium text-amber-600">
                LKR {fmtMoney(balanceDue)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/10 text-xs font-medium text-muted-foreground">
            <div>
              <span>Disbursed: </span>
              <span className="font-medium text-emerald-600">
                LKR {fmtMoney(totalPaid)}
              </span>
            </div>
            <div className="text-right">
              <span>Retention: </span>
              <span className="font-medium text-primary">
                LKR {fmtMoney(totalRetention)}
              </span>
            </div>
          </div>
        </div>

        {/* Existing Installments History */}
        {selectedBill?.payments && selectedBill.payments.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Previous Installments ({selectedBill.payments.length})
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
              {selectedBill.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-2 bg-muted/50 rounded-lg text-xs"
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
                      LKR {fmtMoney(p.amount)}
                    </span>
                    {Number(p.retention_amount) > 0 && (
                      <span className="text-[10px] text-primary block">
                        +LKR {fmtMoney(p.retention_amount)} ret.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Field label="Milestone / Installment Description" required>
            <Input
              required
              value={paymentForm.milestone_name || ""}
              onChange={(e) => setPaymentForm({...paymentForm, milestone_name: e.target.value})}
              placeholder="e.g. 30% Advance, 2nd Milestone, Final Retention Release"
              className="h-8 text-xs"
            />
          </Field>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Disbursement Amount (LKR)" required>
              <Input
                type="number"
                step="0.01"
                required
                value={paymentForm.payment_amount}
                onChange={(e) => setPaymentForm({...paymentForm, payment_amount: e.target.value})}
                placeholder="0.00"
                className="h-8 text-xs"
              />
            </Field>
            <Field label="Retention Deducted (LKR)">
              <Input
                type="number"
                step="0.01"
                value={paymentForm.retention_amount || ""}
                onChange={(e) => setPaymentForm({...paymentForm, retention_amount: e.target.value})}
                placeholder="0.00 (optional)"
                className="h-8 text-xs"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Reference / Chq No." required>
              <Input
                required
                value={paymentForm.payment_reference}
                onChange={(e) => setPaymentForm({...paymentForm, payment_reference: e.target.value})}
                placeholder="e.g. TXN-9281, CHQ-4029"
                className="h-8 text-xs"
              />
            </Field>
            <Field label="Bank Name" required>
              <Input
                required
                value={paymentForm.bank_name}
                onChange={(e) => setPaymentForm({...paymentForm, bank_name: e.target.value})}
                placeholder="e.g. Commercial Bank, BOC"
                className="h-8 text-xs"
              />
            </Field>
          </div>

          <Field label="Payment Date" required>
            <Input
              type="date"
              required
              value={paymentForm.paid_at}
              onChange={(e) => setPaymentForm({...paymentForm, paid_at: e.target.value})}
              className="h-8 text-xs"
            />
          </Field>
        </div>
      </div>
    </FormModal>
  );
}