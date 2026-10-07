"use client";

import { Target, TrendingUp, Clock, HardHat, CheckCircle } from "lucide-react";

export default function JobStatsCards({ total, pending, active, completed }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <TrendingUp className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {total}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Total Jobs
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-500/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {pending}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Pending
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-500/20 dark:to-sky-500/10 flex items-center justify-center">
            <HardHat className="w-5 h-5 text-sky-500" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {active}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Active
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {completed}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Completed
        </p>
      </div>
    </div>
  );
}
