// app/invoices/page.js

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchInvoices,
  downloadInvoicePdf,
  approveInvoice,
} from "@/lib/invoice";
import StatusBadge from "@/components/ui/StatusBadge";
import SubmitToFinanceButton from "@/components/ui/SubmitToFinanceButton";
import { hasPermission } from "@/lib/permissions";
import { useAuth } from "@/contexts/AuthContext";

export default function InvoicePage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const loadInvoices = useCallback(async () => {
    try {
      const res = await fetchInvoices({ page, status, search });
      setInvoices(res.data || []);
      setMeta(res.meta || {});
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  }, [page, status, search]);

  const handleApprove = async (id) => {
    if (!confirm("Are you sure you want to approve this invoice for payment?"))
      return;
    try {
      await approveInvoice(id);
      loadInvoices();
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Failed to approve invoice.");
    }
  };

  useEffect(() => {
    let isMounted = true;
    const triggerLoad = async () => {
      if (isMounted) await loadInvoices();
    };
    triggerLoad();
    return () => {
      isMounted = false;
    };
  }, [loadInvoices]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Invoices</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search invoice number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        />

        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Tax Generated">Tax Generated</option>
          <option value="Submitted">Submitted</option>
          <option value="Paid">Paid</option>
        </select>

        <button
          onClick={() => {
            setPage(1);
            loadInvoices();
          }}
          className="px-4 py-2 bg-primary text-white rounded text-sm"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-muted/20">
                  <td className="p-3 font-medium">{inv.invoice_number}</td>
                  <td className="p-3">{inv.customer?.name}</td>
                  <td className="p-3 font-bold">
                    LKR {Number(inv.invoice_amount).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="p-3 flex gap-2 items-center">
                    {/* Download PDF - always allowed */}
                    <button
                      className="text-primary text-xs font-bold"
                      onClick={() => downloadInvoicePdf(inv.id)}
                    >
                      PDF
                    </button>

                    {/* Edit - Procurement only, Draft only */}
                    {inv.status === "Draft" &&
                      hasPermission(user, "edit-invoice") && (
                        <a
                          href={`/invoices/${inv.id}/edit`}
                          className="text-xs font-bold text-blue-600"
                        >
                          Edit
                        </a>
                      )}

                    {/* Submit to Finance - only after tax generation */}
                    {inv.status === "Tax Generated" &&
                      hasPermission(user, "submit-to-finance") && (
                        <SubmitToFinanceButton
                          invoiceId={inv.id}
                          onSuccess={() => loadInvoices()}
                        />
                      )}

                    {/* Approve - Finance only, Submitted only */}
                    {inv.status === "Submitted" &&
                      hasPermission(user, "approve-payment") && (
                        <button
                          className="text-green-600 text-xs font-bold"
                          onClick={async () => {
                            await approveInvoice(inv.id);
                            loadInvoices();
                          }}
                        >
                          Approve
                        </button>
                      )}

                    {/* Locked state */}
                    {inv.status === "Paid" && (
                      <span className="text-xs text-gray-400 font-semibold">
                        Locked
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>

        <span className="text-sm">
          Page {meta.current_page || page} of {meta.last_page || 1}
        </span>

        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => page < meta.last_page && setPage(page + 1)}
          disabled={page >= meta.last_page}
        >
          Next
        </button>
      </div>
    </div>
  );
}
