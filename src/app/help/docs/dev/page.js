"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Database,
  ListChecks,
  Workflow,
  Server,
  FlaskConical,
  Terminal,
  Lock,
  Info,
  ArrowRight,
  Code2,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";
import { usePermission } from "@/hooks/usePermission";

const devDocuments = [
  {
    title: "Database Map",
    description: "The complete MySQL schema — entity-relationship diagram, every table with all columns and keys, delete-cascade rules and soft-delete behaviour across all 25 tables.",
    icon: Database,
    href: "/help/docs/dev/database-map",
    highlight: true,
  },
  {
    title: "Use Cases",
    description: "Every actor (Viewer, Procurement, Finance, Admin, Super Admin, System) with their use cases as trigger → main flow → outcome, plus a coverage cross-check.",
    icon: ListChecks,
    href: "/help/docs/dev/use-cases",
  },
  {
    title: "Flowcharts",
    description: "Eight diagrams: tender-to-cash master flow, bidding & award, PO state machine, contractor bill workflow, invoice lifecycle, notification chain, support tickets and authentication with the 2FA challenge.",
    icon: Workflow,
    href: "/help/docs/dev/flowcharts",
  },
];

const relatedDocuments = [
  { title: "API Reference", description: "Every endpoint, permission gate and status code — authentication internals are in the internal section.", icon: Server, href: "/help/docs/api" },
  { title: "Testing Guide", description: "Backend and browser suites, coverage maps and conventions — security specs in the internal section.", icon: FlaskConical, href: "/help/docs/testing" },
  { title: "Setup & Deployment", description: "Prerequisites, first-time setup, configuration and production deployment.", icon: Terminal, href: "/help/docs/setup" },
  { title: "Operations Runbook", description: "Backups, resets, maintenance windows and incident response — the procedures developers need at 2am.", icon: Lock, href: "/help/docs/runbook" },
];

export default function DevDocsHubPage() {
  // Developer docs are for the admin tier (Super Admin, Admin) and
  // development-team accounts holding an admin permission.
  const isAdminTier = usePermission(["manage-users", "manage-roles", "manage-system"]);

  if (!isAdminTier) {
    return (
      <ProtectedRoute>
        <div className="min-h-full bg-background p-4 sm:p-6">
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
            <h1 className="text-base font-semibold text-foreground">Developer documentation is restricted</h1>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              The database map, use cases and flowcharts are available to Super Admins, Admins and the development team only.
              If you need them for integration work, ask an administrator.
            </p>
            <Link
              href="/help/docs"
              className="inline-flex items-center gap-1.5 h-8 px-3 mt-4 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Documentation Library
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-widest mb-2">
              Documentation
            </div>
            <h1 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              Developer Documentation
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              The database map, use cases and flowcharts behind ProcureX
            </p>
          </div>
          <Link
            href="/help/docs"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Documents
          </Link>
        </div>

        {/* Access note */}
        <div className="rounded-lg border border-dashed border-border p-3.5 flex gap-3">
          <Lock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Developer documentation is restricted to Super Admins, Admins and the development team. You
            {isAdminTier ? " have access" : " are seeing this because your account holds an admin-tier permission"}.
          </p>
        </div>

        {/* Primary docs */}
        {devDocuments
          .filter((doc) => doc.highlight)
          .map((doc) => (
            <Link key={doc.href} href={doc.href} className="block group">
              <Card className="border-primary/30 bg-primary/[0.04] hover:bg-primary/[0.08] transition-colors">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary text-primary-foreground shrink-0">
                    <doc.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {doc.title}
                      </h2>
                      <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[9px] font-semibold uppercase tracking-wide">
                        Start here
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{doc.description}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary mt-2">
                      Open the map
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

        {/* Dev docs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {devDocuments
            .filter((doc) => !doc.highlight)
            .map((doc) => (
              <Link key={doc.href} href={doc.href} className="block group">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                        <doc.icon className="w-4 h-4" />
                      </span>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {doc.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{doc.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>

        {/* Related */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-primary" />
              Related documentation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {relatedDocuments.map((doc) => (
                <Link
                  key={doc.href}
                  href={doc.href}
                  className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors group"
                >
                  <span className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                    <doc.icon className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{doc.title}</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{doc.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schema note */}
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted shrink-0">
              <Info className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Migrations are the schema</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                One <code className="text-[10px] font-mono">create_*</code> migration per table, no alter migrations —{" "}
                <code className="text-[10px] font-mono">php artisan migrate:fresh --seed</code> is the full rebuild. Model
                fillable lists and the valid-transition tables are the behavioural source of truth.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
