"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Workflow,
  Server,
  FlaskConical,
  Rocket,
  LifeBuoy,
  Megaphone,
  Lock,
  FileText,
  ArrowRight,
  Users,
  Database,
  ListChecks,
  BookMarked,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { usePermission } from "@/hooks/usePermission";

const documents = [
  {
    title: "System Walkthrough Guide",
    description: "The complete step-by-step guide to using the system — every module, workflow, form field, status and download, from tender to banked payment.",
    icon: Workflow,
    href: "/help/guides",
    audience: "All users",
    featured: true,
  },
  {
    title: "API Reference",
    description: "Every backend endpoint grouped by module — master data, tenders, jobs, quotations, purchase orders, bills, invoices, payments, notifications and admin.",
    icon: Server,
    href: "/help/docs/api",
    audience: "Integrators & developers",
    internal: true,
    internalNote: "Authentication and security internals are restricted to admins and developers",
  },
  {
    title: "Testing Guide",
    description: "How the system is verified — backend PHPUnit suites, Playwright browser suites, coverage maps and conventions for adding tests.",
    icon: FlaskConical,
    href: "/help/docs/testing",
    audience: "QA & developers",
    internal: true,
    internalNote: "Security testing details are restricted to admins and developers",
  },
  {
    title: "Setup & Deployment Guide",
    description: "Run the system from a clean machine — prerequisites, installation, configuration, database seeding, and taking the stack to production.",
    icon: Rocket,
    href: "/help/docs/setup",
    audience: "Administrators & developers",
  },
  {
    title: "Operations Runbook",
    description: "Backups and restores, reset and reseed procedures, maintenance windows, incident response and routine governance reviews.",
    icon: LifeBuoy,
    href: "/help/docs/runbook",
    audience: "Platform team",
  },
  {
    title: "Data Dictionary",
    description: "Every entity, field and status value in the system, plus the relationship map from tender to banked payment.",
    icon: Database,
    href: "/help/docs/data-dictionary",
    audience: "Integrators & developers",
  },
  {
    title: "Role Onboarding Checklists",
    description: "First-week task lists for every role — everyone, Procurement, Finance, Admin, Viewer. Tick items off; progress saves in your browser.",
    icon: ListChecks,
    href: "/help/docs/onboarding",
    audience: "All new users",
  },
  {
    title: "Glossary",
    description: "The language of the tender-to-cash system — every term defined in plain English, with a status quick-reference.",
    icon: BookMarked,
    href: "/help/docs/glossary",
    audience: "All users",
  },
  {
    title: "Demo Data Reference",
    description: "Exactly what the seed produces — customers, contractors, tenders, jobs, bids, bills and invoices, with ready-made training scenarios.",
    icon: Database,
    href: "/help/docs/demo-data",
    audience: "Trainers & QA",
  },
  {
    title: "Release Notes",
    description: "What shipped in each version of ProcureX, and how updates are rolled out through maintenance windows.",
    icon: Megaphone,
    href: "/help/docs/releases",
    audience: "All users",
  },
  {
    title: "Help Center & FAQs",
    description: "Searchable answers to common questions, support contacts, release notes and the support ticket form.",
    icon: LifeBuoy,
    href: "/help",
    audience: "All users",
  },
];

export default function DocsHubPage() {
  // Security internals inside the API and Testing docs are visible to
  // Super Admin / Admin (and development-team accounts) only.
  const isAdminTier = usePermission(["manage-users", "manage-roles", "manage-system"]);

  return (
    <ProtectedRoute>
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-widest mb-2">
              Documentation Library
            </div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Documentation
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Everything you need to use, integrate and operate the system
            </p>
          </div>
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Help Center
          </Link>
        </div>

        {/* Featured: full walkthrough */}
        {documents
          .filter((doc) => doc.featured)
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
                      Open the guide
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

        {/* All documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {documents
            .filter((doc) => !doc.featured)
            .map((doc) => (
              <Link key={doc.href} href={doc.href} className="block group">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <span className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                        <doc.icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="group-hover:text-primary transition-colors">{doc.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{doc.description}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[9px] font-medium uppercase tracking-wide">
                        <Users className="w-2.5 h-2.5" />
                        {doc.audience}
                      </span>
                      {doc.internal && !isAdminTier && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 text-[9px] font-medium uppercase tracking-wide">
                          <Lock className="w-2.5 h-2.5" />
                          Contains internal sections
                        </span>
                      )}
                      {doc.internal && isAdminTier && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 text-[9px] font-medium uppercase tracking-wide">
                          <Lock className="w-2.5 h-2.5" />
                          Internal sections unlocked
                        </span>
                      )}
                    </div>
                    {doc.internal && !isAdminTier && doc.internalNote && (
                      <p className="text-[10px] text-muted-foreground/80 leading-relaxed">{doc.internalNote}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>

        {/* Also available */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Also available
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href="/help"
                className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors group"
              >
                <span className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Megaphone className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h4 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">Release Notes</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">What shipped in each version of ProcureX — opened from the Help Center.</p>
                </div>
              </Link>
              <Link
                href="/help/guides#overview"
                className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors group"
              >
                <span className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Workflow className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h4 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">Roles &amp; Permissions</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">The permission matrix and what each role can do — in the Walkthrough overview.</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Access note */}
        <div className="rounded-lg border border-dashed border-border p-3.5 flex gap-3">
          <Lock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Some documents contain internal sections — authentication and security details for the API, and security testing specifics. Those sections are visible to Super Admins, Admins and development-team accounts only; the rest of each document is available to everyone.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
