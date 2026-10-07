"use client";

import { motion } from "framer-motion";
import {
  Edit2,
  Trash2,
  User,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { STATUS_CONFIG } from "./jobStatusConfig";
import { Card, CardContent } from "@/components/ui/Card";

export default function JobListCard({ job, onEdit, onDelete, onClick }) {
  const canDelete = usePermission("delete-job");
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.Pending;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 self-stretch rounded-full bg-muted" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-foreground">
                  {job.name}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${config.light} ${config.text}`}
                >
                  {job.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>#{job.id}</span>
                {job.customer?.name && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {job.customer.name}
                  </span>
                )}
                {job.tender?.tender_number && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {job.tender.tender_number}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right hidden sm:block min-w-[140px]">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Value
              </p>
              <p className="text-base font-medium text-foreground">
                LKR {Number(job.project_value || 0).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onEdit(job)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(job.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
