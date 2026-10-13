"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Megaphone,
  Sparkles,
  Layers,
  Package,
  CheckCircle2,
  Info,
  RefreshCcw,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// Release notes — what shipped in each version of ProcureX.
// ─────────────────────────────────────────────────────────────

const releases = [
  {
    id: "v2-1-0",
    version: "2.1.0",
    state: "Current release",
    current: true,
    summary:
      "The complete tender-to-cash release: the workflow is now covered end to end, from bidding to banked payment.",
    groups: [
      {
        title: "Tendering & delivery",
        items: [
          "Job creation under tenders with customer auto-linking",
          "Contractor quotations with a bid comparison table (contractor, date, duration, amount)",
          "Winning-bid selection — Selected bid, automatic Rejection of rivals, job flips to In Progress",
          "Job award letter PDF in the job header",
          "Tender award letter PDF for the customer once the awarded amount is set",
        ],
      },
      {
        title: "Money out",
        items: [
          "Purchase order register with the server-enforced Draft → Approved → Sent → Received machine and change notes",
          "Purchase order PDFs and a full status audit trail",
          "Contractor bill workflow: create, upload documents, verify, submit, approve or reject with reason",
          "Milestone payments with retention, partial payments and payment history",
        ],
      },
      {
        title: "Money in",
        items: [
          "Invoice creation wizard with cascading tender → job → PO filters",
          "Statutory tax invoice generation with a locked 18% VAT schedule",
          "Finance approval and rejection with cleared approval data on reject",
          "Milestone installment recording with balance overview and previous payments",
          "Cheque payments registered automatically in the cheque register",
          "Mark Banked with deposit reference and cleared date",
          "Internal receipt generated on payment",
          "Invoice PDFs and per-invoice audit trail",
        ],
      },
      {
        title: "Platform",
        items: [
          "Notifications center with shared bell state across the navbar and page, polled every 30 seconds",
          "Settings redesigned as a per-tab draft model with unsaved-changes warnings",
          "Localized status badges and regional formatting in English, Sinhala and Tamil",
          "Help Center with FAQs, contacts, release notes and self-service support tickets (TKT-YYYY-####)",
          "Full System Walkthrough Guide and Documentation Library inside the app",
        ],
      },
    ],
  },
  {
    id: "v2-0-x",
    version: "2.0.x",
    state: "Foundation",
    summary:
      "The foundation the current release builds on — the core invoices, bills, dashboards and access model.",
    groups: [
      {
        title: "Core operations",
        items: [
          "Customer and contractor master data with bank details and ratings",
          "Tender register with pipeline statuses",
          "Invoice ledger with creation, editing and CSV export",
          "Contractor bill register with the verification workflow",
        ],
      },
      {
        title: "Platform",
        items: [
          "Dashboard analytics: executive summary, monthly trend, status breakdown, approval velocity",
          "Role-based access control with five roles and a permission catalogue",
          "Audit logs recording every status change",
          "Maintenance mode with system-wide banner and write gating",
          "System telemetry for Super Admins",
        ],
      },
    ],
  },
];

export default function ReleasesPage() {
  const [activeId, setActiveId] = useState(releases[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const updateActive = () => {
      let current = releases[0].id;
      for (const release of releases) {
        const el = sectionRefs.current[release.id];
        if (el && el.getBoundingClientRect().top <= 120) current = release.id;
      }
      setActiveId(current);
    };

    viewport.addEventListener("scroll", updateActive, { passive: true });
    return () => viewport.removeEventListener("scroll", updateActive);
  }, []);

  const scrollToRelease = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-widest mb-2">
              Documentation
            </div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">Release Notes</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              What shipped in each version of ProcureX, and how updates are rolled out
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

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
          {/* Rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-2">
                  Versions
                </p>
                <nav className="space-y-0.5">
                  {releases.map((release) => {
                    const active = activeId === release.id;
                    return (
                      <button
                        key={release.id}
                        onClick={() => scrollToRelease(release.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors text-left ${
                          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Package className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Version {release.version}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-semibold text-foreground">You are on 2.1.0</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  The latest release is always active in the footer of the Help Center.
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-4 min-w-0">
            {releases.map((release) => (
              <section
                key={release.id}
                id={release.id}
                ref={(el) => { sectionRefs.current[release.id] = el; }}
                className="scroll-mt-20"
              >
                <Card className={release.current ? "border-primary/30" : undefined}>
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        {release.current ? <Megaphone className="w-4.5 h-4.5" /> : <Layers className="w-4.5 h-4.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm font-semibold text-foreground">Version {release.version}</h2>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${
                              release.current
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {release.state}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{release.summary}</p>
                      </div>
                    </div>

                    {release.groups.map((group) => (
                      <div key={group.title} className="space-y-2">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          {group.title}
                        </p>
                        <ul className="space-y-1.5">
                          {group.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
                              <CheckCircle2
                                className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${release.current ? "text-emerald-500" : "text-muted-foreground/50"}`}
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            ))}

            {/* How updates arrive */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <RefreshCcw className="w-3.5 h-3.5 text-primary" />
                  How updates arrive
                </h2>
                <div className="rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-3.5 flex gap-3">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Changes are rolled out through a maintenance window: the Super Admin switches maintenance mode on, the update is applied and verified, then the banner is switched off. The full procedure is in the Operations Runbook.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/help/docs/runbook"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Operations Runbook
                  </Link>
                  <Link
                    href="/help/guides"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    System Walkthrough
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
