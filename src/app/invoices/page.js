// app/invoices/page.js
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchInvoices, downloadInvoicePdf } from "@/lib/invoice";
import { exportToCSV } from "@/lib/exportUtils";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Download,
  Edit2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_FILTERS = [
  "",
  "Draft",
  "Submitted",
  "Approved",
  "Payment Received",
  "Banked",
];

export default function InvoicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchTimerRef = useRef(null);
  const canEdit = usePermission("edit-invoice");

  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return Number(params.get("page")) || 1;
    }
    return 1;
  });
  const [status, setStatus] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("status") || "";
    }
    return "";
  });
  const [search, setSearch] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("search") || "";
    }
    return "";
  });
  const [searchInput, setSearchInput] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("search") || "";
    }
    return "";
  });
  const [loading, setLoading] = useState(true);

  const loadInvoices = useCallback(async ({ page, status, search }) => {
    try {
      const res = await fetchInvoices({ page, status, search });
      setInvoices(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await loadInvoices({ page, status, search });
      setLoading(false);
    };
    run();
  }, [loadInvoices, page, status, search]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const p = Number(params.get("page")) || 1;
      const s = params.get("status") || "";
      const q = params.get("search") || "";
      setPage(p);
      setStatus(s);
      setSearch(q);
      setSearchInput(q);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    const qs = params.toString();
    const targetUrl = qs ? `/invoices?${qs}` : "/invoices";
    if (window.location.pathname + window.location.search !== targetUrl) {
      router.replace(targetUrl, { scroll: false });
    }
  }, [page, status, search, router]);

  const total = meta.total || invoices.length;
  const totalValue = invoices.reduce(
    (sum, inv) => sum + Number(inv.invoice_amount || 0),
    0,
  );

  return (
    <div className="min-h-full p-4 sm:p-6 space-y-4">
      {/* Zen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Invoices
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Commercial invoicing ledger, billing life cycle, and clearance tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              exportToCSV(invoices, "invoices_export", [
                { key: "invoice_number", label: "Invoice #" },
                { key: "customer.name", label: "Customer" },
                { key: "invoice_amount", label: "Amount" },
                { key: "invoice_date", label: "Invoice Date" },
                { key: "status", label: "Status" },
              ])
            }
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Compact Filters & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search invoice number or customer…"
              value={searchInput}
              onChange={(e) => {
                const val = e.target.value;
                setSearchInput(val);
                if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                searchTimerRef.current = setTimeout(() => {
                  setSearch(val);
                  setPage(1);
                }, 300);
              }}
              className="h-8 text-xs pl-8 bg-card border-border"
            />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                status === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Zen Compact Data Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <th className="py-2.5 px-3.5">Invoice #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Amount (LKR)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-2.5 px-3.5"><div className="h-3 w-20 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 w-32 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 w-16 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3 text-right"><div className="h-3 w-20 bg-muted rounded ml-auto" /></td>
                    <td className="py-2.5 px-3"><div className="h-4 w-16 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3.5 text-right"><div className="h-4 w-12 bg-muted rounded ml-auto" /></td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No invoices found matching criteria</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3.5 font-medium text-foreground">
                      {inv.invoice_number}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[200px]">
                      {inv.customer?.name || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-foreground">
                      {Number(inv.invoice_amount || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-muted text-foreground rounded border border-border/50">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          title="View Details"
                          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                          onClick={() => router.push(`/invoices/${inv.id}`)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Download PDF"
                          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                          onClick={() => downloadInvoicePdf(inv.id)}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {inv.status === "Draft" && canEdit && (
                          <button
                            title="Edit"
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                            onClick={() => router.push(`/invoices/${inv.id}/edit`)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zen Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Page {page} of {meta.last_page} ({total} items)
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7 w-7"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="h-7 w-7"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
