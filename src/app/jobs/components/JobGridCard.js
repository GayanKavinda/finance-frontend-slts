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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const STATUS_CONFIG = {
  Pending: { dot: "bg-amber-500", light: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-300" },
  Active: { dot: "bg-blue-500", light: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300" },
  "In Progress": { dot: "bg-blue-500", light: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300" },
  Completed: { dot: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300" },
};

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
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${config.light} ${config.text} text-[11px] gap-1.5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                  {job.status}
                </Badge>
              </div>
              <CardTitle className="text-sm leading-snug line-clamp-1">{job.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">#{job.id} • {job.customer?.name || "No customer"}</p>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => onEdit(job)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
              {canDelete && (
                <button type="button" onClick={() => onDelete(job.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <DollarSign className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Project Value</p>
              <p className="text-sm font-medium text-foreground">LKR {Number(job.project_value || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {job.tender?.tender_number && (
              <div className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg">
                <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Briefcase className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase">Tender</p>
                  <p className="text-xs font-medium text-foreground truncate">{job.tender.tender_number}</p>
                </div>
              </div>
            )}
            {(job.work_start_date || job.work_completion_date) && (
              <div className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg">
                <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase">Duration</p>
                  <p className="text-xs font-medium text-foreground truncate">
                    {job.work_start_date?.split("-")[0] || "—"} → {job.work_completion_date?.split("-")[0] || "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">View details</span>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}