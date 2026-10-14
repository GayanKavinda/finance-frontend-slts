"use client";

// src/app/profile/SecurityOverview.js
// Read-only security summary. All controls live in Settings → Security.

import Link from "next/link";
import {
  KeyRound,
  Monitor,
  Shield,
  ShieldCheck,
  History,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ROWS = [
  {
    icon: ShieldCheck,
    label: "Two-factor authentication",
    description: "A 6-digit code is emailed at every login when enabled.",
    getValue: (user) => (user?.two_factor_enabled ? "Enabled" : "Disabled"),
    tone: (user) =>
      user?.two_factor_enabled
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
        : "bg-muted text-muted-foreground",
  },
  {
    icon: Monitor,
    label: "Active sessions",
    description: "Devices currently signed in to your account.",
    getValue: () => "Manage in Settings",
    tone: () => "bg-muted text-muted-foreground",
  },
  {
    icon: History,
    label: "Login history",
    description: "Recent IP addresses, browsers and timestamps.",
    getValue: () => "Manage in Settings",
    tone: () => "bg-muted text-muted-foreground",
  },
];

export default function SecurityOverview({ user }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-xs font-medium text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-primary" />
          Security Status
        </h3>
        <div className="divide-y divide-border">
          {ROWS.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{row.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {row.description}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${row.tone(user)}`}
                >
                  {row.getValue(user)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border p-5">
        <h3 className="text-xs font-medium text-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
          <KeyRound className="w-3.5 h-3.5 text-primary" />
          Manage your credentials
        </h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
          Password changes, two-factor setup, session revocation and login activity are handled in Settings. Your profile
          page stays a summary of record.
        </p>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Link href="/settings?tab=security">
            Open security settings
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
