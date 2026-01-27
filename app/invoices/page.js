//src/app/invoices/page.js

"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { downloadInvoicePdf } from "@/lib/invoice";

export default function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(`/api/invoices?page=${page}`);
        setInvoices(res.data.data);
        setMeta(res.data.meta);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    fetchInvoices();
  }, [page]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Invoices</h1>

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
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="p-3">{inv.invoice_number}</td>
                <td className="p-3">{inv.customer?.name}</td>
                <td className="p-3">
                  LKR {Number(inv.invoice_amount).toFixed(2)}
                </td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                    {inv.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    className="text-primary text-xs font-bold"
                    onClick={() => downloadInvoicePdf(inv.id)}
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => page < meta.last_page && setPage(page + 1)}
          disabled={page >= meta.last_page}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
