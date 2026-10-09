"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-foreground">Filter Jobs</h3>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Select value={filters.status} onValueChange={(value) => setFilters((f) => ({ ...f, status: value }))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.customer_id} onValueChange={(value) => setFilters((f) => ({ ...f, customer_id: value }))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.tender_id} onValueChange={(value) => setFilters((f) => ({ ...f, tender_id: value }))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Tenders" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenders.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.tender_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}