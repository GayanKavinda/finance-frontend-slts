"use client";

import { Target, TrendingUp, Clock, HardHat, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export default function JobStatsCards({ total, pending, active, completed }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Target className="h-4 w-4 text-foreground" />
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">{total}</p>
          <p className="text-[11px] text-muted-foreground">Total Jobs</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Clock className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <p className="text-lg font-medium text-foreground">{pending}</p>
          <p className="text-[11px] text-muted-foreground">Pending</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <HardHat className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <p className="text-lg font-medium text-foreground">{active}</p>
          <p className="text-[11px] text-muted-foreground">Active</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <CheckCircle className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <p className="text-lg font-medium text-foreground">{completed}</p>
          <p className="text-[11px] text-muted-foreground">Completed</p>
        </CardContent>
      </Card>
    </div>
  );
}
