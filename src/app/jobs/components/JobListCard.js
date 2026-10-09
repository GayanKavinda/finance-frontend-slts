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
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const STATUS_CONFIG = {
  Pending: { dot: "bg-amber-500", light: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-300" },
  Active: { dot: "bg-blue-500", light: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300" },
  "In Progress": { dot: "bg-blue-500", light: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300" },
  Completed: { dot: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300" },
};

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
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <div className="w-1 self-stretch rounded-full bg-muted" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-sm font-medium text-foreground">{job.name}</h3>
                <Badge className={`${config.light} ${config.text} text-[11px] gap-1.5`}>{job.status}</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
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

            <div className="text-right hidden sm:block min-w-[120px]">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Value</p>
              <p className="text-sm font-medium text-foreground">LKR {Number(job.project_value || 0).toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-2">
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
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}