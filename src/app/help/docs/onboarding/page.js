"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ListChecks,
  Users,
  Briefcase,
  ShieldCheck,
  Landmark,
  UserRound,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// Onboarding checklists — per role, interactive, persisted.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "onboarding-checklist-v1";

const onboardingSections = [
  {
    id: "everyone",
    label: "Everyone",
    icon: Users,
    title: "Everyone — First Day",
    summary: "Do these once, whatever your role.",
    steps: [
      "Sign in with the account provided by your administrator",
      "Read the System Walkthrough Guide overview — the lifecycle diagram and your place in it",
      "Open Settings → Regional and set your language, timezone, date format and currency",
      "Open Settings → Appearance and pick light or dark theme (and compact density if you prefer tighter tables)",
      "Open Settings → Notifications and check how workflow alerts reach you",
      "Check the notification bell — the unread badge refreshes every 30 seconds",
      "Know where help lives: Help Center FAQs, the Walkthrough Guide, and the Submit Support Ticket form",
    ],
  },
  {
    id: "procurement",
    label: "Procurement",
    icon: Briefcase,
    title: "Procurement — First Week",
    summary: "Everything the procurement desk owns, from master data to contractor bills.",
    steps: [
      "Review the Customers register — confirm names, tax numbers and billing addresses are current",
      "Review the Contractors register — check bank details are present for every contractor you pay",
      "Open a tender and confirm you can read the pipeline (Open → Awarded → Closed)",
      "Open a Pending job and check the Contractor Quotations panel",
      "Enter a test quotation against a job — contractor, amount, date, duration, work scope",
      "Collect at least 3 competitive bids on one job and compare them in the bid table",
      "Select the winning bid and confirm the job moves to In Progress",
      "Download the job award letter PDF from the job header",
      "Create a purchase order for that job and walk it Draft → Approved → Sent → Received",
      "Download the PO PDF and open its audit trail",
      "Create a contractor bill against the job",
      "Upload a supporting document (bill, completion certificate or site photo)",
      "Verify the bill, then submit it to finance",
      "Export the jobs register as CSV and check your filters carried through",
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: Landmark,
    title: "Finance — First Week",
    summary: "The approval, payment and banking half of the workflow.",
    steps: [
      "Open Contractor Bills and confirm you can see the approval pipeline",
      "Approve a submitted bill, then open the approved bill",
      "Record a payment on it — milestone name, amount, retention, bank reference, date",
      "Reject a bill with a reason and confirm it returns to Draft",
      "Open Invoices and review the ledger",
      "Open a Draft invoice and generate the statutory tax invoice",
      "Approve a submitted invoice",
      "Record an invoice payment and confirm the internal receipt is generated",
      "Mark an invoice banked with the deposit reference and cleared date",
      "Open a PO's audit trail and the invoices audit tab — you hold the view-audit-trail permission",
      "Check the cheque register for cheque payments recorded against invoices",
      "Review the dashboard KPIs against the ledger (invoiced, collected, outstanding, efficiency)",
    ],
  },
  {
    id: "admin",
    label: "Admin & Super Admin",
    icon: ShieldCheck,
    title: "Admin & Super Admin — First Week",
    summary: "Platform administration. Super Admins additionally own system-level controls.",
    steps: [
      "Open Admin → Users and review the directory",
      "Assign a role to a user and confirm the UI updates for them",
      "Deactivate a user and confirm they lose access; reactivate to restore",
      "Open Admin → Roles and review the permission catalogue",
      "Open Admin → Audit Logs and trace one record's history",
      "Confirm you can see the internal sections of the API Reference and Testing Guide (admin-tier access)",
      "Super Admin only: open System Logs and read the telemetry panel",
      "Super Admin only: understand maintenance mode before you ever need it — writes block, reads continue, and everyone sees the banner",
      "Read the Setup & Deployment Guide so you can re-seed or rebuild the environment",
      "Read the Operations Runbook for backup, reseed and incident procedures",
    ],
  },
  {
    id: "viewer",
    label: "Viewer",
    icon: UserRound,
    title: "Viewer — First Day",
    summary: "Read-only access to the invoice ledger.",
    steps: [
      "Sign in and confirm the sidebar shows only Invoices for your role",
      "Open the invoices ledger and check the status badges read correctly",
      "Open an invoice detail — roadmap, documents and the amount summary",
      "Use the dashboard read-only view (if enabled for your account)",
      "If you need write access anywhere, ask an administrator to change your role",
    ],
  },
];

export default function OnboardingPage() {
  // Lazy initial read: localStorage only exists in the browser, and the
  // try/catch keeps server rendering safe.
  const [checked, setChecked] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const sectionRefs = useRef({});
  const [activeId, setActiveId] = useState(onboardingSections[0].id);

  // Persist progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      /* storage unavailable — progress stays in memory */
    }
  }, [checked]);

  useEffect(() => {
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const updateActive = () => {
      let current = onboardingSections[0].id;
      for (const section of onboardingSections) {
        const el = sectionRefs.current[section.id];
        if (el && el.getBoundingClientRect().top <= 120) current = section.id;
      }
      setActiveId(current);
    };

    viewport.addEventListener("scroll", updateActive, { passive: true });
    return () => viewport.removeEventListener("scroll", updateActive);
  }, []);

  const scrollToSection = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  };

  const toggle = (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const sectionProgress = (section) => {
    const total = section.steps.length;
    const done = section.steps.filter((_, i) => checked[`${section.id}:${i}`]).length;
    return { done, total, pct: Math.round((done / total) * 100) };
  };

  const overall = onboardingSections.map(sectionProgress).reduce(
    (acc, p) => ({ done: acc.done + p.done, total: acc.total + p.total }),
    { done: 0, total: 0 }
  );

  return (
    <ProtectedRoute>
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-widest mb-2">
              Documentation
            </div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Role Onboarding Checklists
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your first week in the system, step by step — tick items off and progress is saved in this browser
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChecked({})}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset progress
            </button>
            <Link
              href="/help/docs"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Documents
            </Link>
          </div>
        </div>

        {/* Overall progress */}
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-muted" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-primary transition-[stroke-dashoffset] duration-500"
                  strokeWidth="3"
                  strokeDasharray={2 * Math.PI * 15.5}
                  strokeDashoffset={2 * Math.PI * 15.5 * (1 - (overall.done / Math.max(overall.total, 1)))}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground">
                {Math.round((overall.done / Math.max(overall.total, 1)) * 100)}%
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {overall.done} of {overall.total} steps complete
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                Find your role below and work top to bottom. Every step names the exact page and action — the System Walkthrough Guide covers the detail.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
          {/* Rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-2">
                Roles
              </p>
              <nav className="space-y-0.5">
                {onboardingSections.map((section) => {
                  const Icon = section.icon;
                  const active = activeId === section.id;
                  const p = sectionProgress(section);
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors text-left ${
                        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate flex-1">{section.label}</span>
                      {p.done === p.total && p.total > 0 && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Mobile pills */}
          <div className="lg:hidden -mx-4 px-4">
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {onboardingSections.map((section) => {
                const Icon = section.icon;
                const active = activeId === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors whitespace-nowrap ${
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 min-w-0">
            {onboardingSections.map((section) => {
              const Icon = section.icon;
              const p = sectionProgress(section);
              return (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => { sectionRefs.current[section.id] = el; }}
                  className="scroll-mt-20"
                >
                  <Card>
                    <CardContent className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{section.summary}</p>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                          {p.done}/{p.total}
                        </span>
                      </div>

                      {/* Section progress bar */}
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-[width] duration-300"
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>

                      <ul className="space-y-1.5">
                        {section.steps.map((step, i) => {
                          const key = `${section.id}:${i}`;
                          const isChecked = !!checked[key];
                          return (
                            <li key={key}>
                              <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggle(key)}
                                  className="mt-0.5 w-3.5 h-3.5 rounded border-border text-primary accent-[hsl(var(--primary))] cursor-pointer"
                                />
                                <span className={`text-[11px] leading-relaxed flex-1 ${isChecked ? "line-through text-muted-foreground/60" : "text-foreground"}`}>
                                  {step}
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                </section>
              );
            })}

            {/* Footer */}
            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted shrink-0">
                  <ListChecks className="w-4.5 h-4.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Progress is stored locally</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                    Checkmarks are saved in this browser only — they are per-device, not per-user. Use Reset progress to start over.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
