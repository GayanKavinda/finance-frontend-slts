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

export default function JobListCard({ job, onEdit, onDelete, onClick }) {
  const canDelete = usePermission("delete-job");
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.Pending;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="flex items-stretch">
        {/* Status Bar */}
        <div className={`w-1.5 bg-gradient-to-b ${config.gradient}`} />

        <div className="flex-1 p-4">
          <div className="flex items-center gap-4">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {job.name}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${config.light} ${config.text}`}
                >
                  {job.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="text-slate-300 dark:text-slate-600">
                    #{job.id}
                  </span>
                </span>
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

            {/* Value */}
            <div className="text-right hidden sm:block min-w-[140px]">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Value
              </p>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                LKR {Number(job.project_value || 0).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
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
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
