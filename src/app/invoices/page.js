// app/invoices/page.js

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchInvoices, downloadInvoicePdf } from "@/lib/invoice";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  canEditInvoice,
  canSubmitInvoice,
  canApproveInvoice,
  canRejectInvoice, // Added canRejectInvoice
} from "@/lib/permissions";

import { useAuth } from "@/contexts/AuthContext";

export default function InvoicePage() {
  const { user } = useAuth();
  const router = useRouter();
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
          className="border px-3 py-2 rounded text-sm min-w-[150px] font-medium"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Tax Generated">Tax Generated</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Payment Received">Payment Received</option>
          <option value="Banked">Banked</option>
        </select>

        <button
          onClick={() => {
            setPage(1);
            loadInvoices();
          }}
          className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all font-bold"
        >
          Apply Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 dark:bg-gray-900 uppercase text-[10px] font-black text-gray-400 tracking-widest">
            <tr>
              <th className="px-8 py-5">Invoice</th>
              <th className="px-6 py-5">Customer / Reference</th>
              <th className="px-6 py-5">Value (LKR)</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-900/50 cursor-pointer transition-all group"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {inv.invoice_number}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {new Date(inv.invoice_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {inv.customer?.name}
                      </span>
                      {inv.receipt_number && (
                        <span className="text-[10px] text-indigo-500 font-black flex items-center gap-1 mt-0.5">
                          <i className="w-1.5 h-1.5 rounded-full bg-indigo-500"></i>
                          {inv.receipt_number}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="font-black text-gray-900 dark:text-white text-base">
                      {Number(inv.invoice_amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td
                    className="px-8 py-6 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-3 justify-end items-center">
                      <button
                        title="Download Invoice PDF"
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        onClick={() => downloadInvoicePdf(inv.id)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                          />
                        </svg>
                      </button>

                      {inv.status === "Draft" &&
                        canEditInvoice(user?.permissions) && (
                          <button
                            onClick={() =>
                              router.push(`/invoices/${inv.id}/edit`)
                            }
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        )}
                    </div>
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
