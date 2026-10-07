"use client";

import { motion } from "framer-motion";
import {
  Edit2,
  Trash2,
  DollarSign,
  Briefcase,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { STATUS_CONFIG } from "./jobStatusConfig";
import { Card, CardContent } from "@/components/ui/Card";

export default function JobGridCard({ job, onEdit, onDelete, onClick }) {
  const canDelete = usePermission("delete-job");
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.Pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${config.light} ${config.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                  {job.status}
                </span>
              </div>
              <h3 className="text-sm font-medium text-foreground line-clamp-1 leading-snug mb-1">
                {job.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                #{job.id} • {job.customer?.name || "No customer"}
              </p>
            </div>

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
          </div>

          <div className="bg-muted/30 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Project Value
                </p>
                <p className="text-base font-medium text-foreground">
                  LKR {Number(job.project_value || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {job.tender?.tender_number && (
              <div className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg">
                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Tender
                  </p>
                  <p className="text-xs font-medium text-foreground truncate">
                    {job.tender.tender_number}
                  </p>
                </div>
              </div>
            )}
            {(job.work_start_date || job.work_completion_date) && (
              <div className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg">
                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Duration
                  </p>
                  <p className="text-xs font-medium text-foreground truncate">
                    {job.work_start_date?.split("-")[0] || "—"} →{" "}
                    {job.work_completion_date?.split("-")[0] || "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              View details
            </span>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
