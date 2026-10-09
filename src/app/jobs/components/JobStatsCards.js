"use client";

import { Target, TrendingUp, Clock, HardHat, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function JobStatsCards({ total, pending, active, completed }) {
  const statCards = [
    {
      label: "Total Jobs",
      value: total.toLocaleString(),
      icon: Target,
    },
    {
      label: "Pending",
      value: pending.toLocaleString(),
      icon: Clock,
    },
    {
      label: "Active",
      value: active.toLocaleString(),
      icon: HardHat,
    },
    {
      label: "Completed",
      value: completed.toLocaleString(),
      icon: CheckCircle,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {statCards.map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-lg px-3.5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </span>
            <s.icon className="w-3.5 h-3.5 text-muted-foreground/60" />
          </div>
          <div className="text-[15px] font-semibold tracking-tight text-foreground mt-1 truncate">
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}