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

export default function JobGridCard({ job, onEdit, onDelete, onClick }) {
  const canDelete = usePermission("delete-job");
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.Pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Top Accent Bar */}
      <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${config.light} ${config.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.bg}`} />
                {job.status}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-1 leading-snug mb-1">
              {job.name}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              #{job.id} • {job.customer?.name || "No customer"}
            </p>
          </div>

          {/* Actions */}
          <div
            className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onEdit(job)}
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(job.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Value Highlight */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                  Project Value
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  LKR {Number(job.project_value || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {job.tender?.tender_number && (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-violet-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">
                  Tender
                </p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {job.tender.tender_number}
                </p>
              </div>
            </div>
          )}
          {(job.work_start_date || job.work_completion_date) && (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">
                  Duration
                </p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {job.work_start_date?.split("-")[0] || "—"} →{" "}
                  {job.work_completion_date?.split("-")[0] || "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            View details
          </span>
          <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
