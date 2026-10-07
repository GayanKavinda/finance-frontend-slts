"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export default function JobFilterPanel({
  showFilters,
  filters,
  setFilters,
  customers = [],
  tenders = [],
  hasActiveFilters,
  clearFilters,
}) {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">
                  Filter Jobs
                </h3>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, status: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">
                    Customer
                  </label>
                  <select
                    value={filters.customer_id}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        customer_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">All Customers</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">
                    Tender
                  </label>
                  <select
                    value={filters.tender_id}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        tender_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">All Tenders</option>
                    {tenders.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tender_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
