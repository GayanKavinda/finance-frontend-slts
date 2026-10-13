"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookHeart,
  CalendarCheck,
  DatabaseBackup,
  RefreshCcw,
  Wrench,
  Siren,
  ShieldCheck,
  Terminal,
  Info,
  AlertTriangle,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// Operations runbook — recurring procedures and incident
// response for the platform team.
// ─────────────────────────────────────────────────────────────

const runbookSections = [
  {
    id: "rhythm",
    label: "Operating Rhythm",
    icon: CalendarCheck,
    title: "Operating Rhythm",
    summary:
      "The recurring checks that keep the system healthy. Everything here can be done from the admin UI.",
    blocks: [
      {
        type: "steps",
        title: "Daily",
        items: [
          { title: "Glance at the dashboard", detail: "Confirm KPIs are populating — an empty dashboard usually means the seed or a job failed." },
          { title: "Check the notification bell", detail: "Bills and invoices waiting on your role should be moving; a stalled stage means someone is away." },
          { title: "Skim the support tickets", detail: "Anything raised by users in the Help Center — respond within 2 business hours." },
        ],
      },
      {
        type: "steps",
        title: "Weekly",
        items: [
          { title: "Review audit logs", detail: "Admin → Audit Logs: look for unexpected status changes or repeated failed actions." },
          { title: "Check the cheque register", detail: "Confirm cheques are clearing and bounce follow-ups are not overdue." },
          { title: "Review approval velocity", detail: "If bills or invoices sit in Submitted for days, chase the pending approver." },
          { title: "Check contractor bill documents", detail: "Any bill without a document is a verification blocker waiting to happen." },
        ],
      },
      {
        type: "steps",
        title: "Monthly",
        items: [
          { title: "Reconcile the ledger", detail: "Invoice ledger vs banked totals — the mark-banked status should match the bank statement." },
          { title: "Review user access", detail: "Admin → Users: deactivate leavers, confirm role assignments still match responsibilities." },
          { title: "Confirm backups ran", detail: "See the Backup section — verify a restore actually works before you trust it." },
          { title: "Check retention balances", detail: "Settle retention money that has hit its release date." },
        ],
      },
    ],
  },
  {
    id: "backup",
    label: "Backup & Restore",
    icon: DatabaseBackup,
    title: "Backup & Restore",
    summary:
      "What to back up and how to restore — a database-only backup loses uploaded documents and PDFs.",
    blocks: [
      {
        type: "kv",
        title: "What to back up",
        rows: [
          ["Database", "The finance-app MySQL database — every record, workflow state and audit entry"],
          ["Storage directory", "finance-backend/storage/app — uploaded documents (contractor bills, completion certificates, site photos) and generated files"],
          ["Environment files", ".env on both backend and frontend — configuration is not in the database"],
        ],
      },
      {
        type: "code",
        title: "Full database backup (mysqldump)",
        code: "C:\\xampp\\mysql\\bin\\mysqldump.exe -uroot --databases finance-app > C:\\backups\\finance-app-%date:~10,4%%date:~4,2%%date:~7,2%.sql",
      },
      {
        type: "code",
        title: "Restore from a dump",
        code: "C:\\xampp\\mysql\\bin\\mysql.exe -uroot -e \"CREATE DATABASE `finance-app` CHARACTER SET utf8mb4;\"\nC:\\xampp\\mysql\\bin\\mysql.exe -uroot finance-app < C:\\backups\\finance-app-YYYYMMDD.sql",
      },
      {
        type: "steps",
        title: "Storage backup",
        items: [
          { title: "Stop writes (recommended)", detail: "Ask the Super Admin to enable maintenance mode during the copy so no upload lands mid-backup." },
          { title: "Copy storage/app", detail: "A plain file copy of the directory is sufficient; include it with the nightly database dump." },
          { title: "Verify", detail: "After restore, open an invoice's documents tab and download a PDF — if files are missing, the storage link or the copy is incomplete." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Test your restores",
        text: "A backup you have never restored is a guess. Rehearse the restore into a scratch database quarterly",
      },
    ],
  },
  {
    id: "reset",
    label: "Reset & Reseed",
    icon: RefreshCcw,
    title: "Reset & Reseed Procedures",
    summary:
      "Rebuilding the environment from scratch, and the side effects each procedure has.",
    blocks: [
      {
        type: "code",
        title: "Full clean reset + complete seed",
        code: "cd C:\\xampp\\htdocs\\finance-app\\finance-backend\nC:\\xampp\\php\\php.exe artisan migrate:fresh --seed --force",
      },
      {
        type: "code",
        title: "Re-run one seeder without touching other data (idempotent)",
        code: "C:\\xampp\\php\\php.exe artisan db:seed --class=SupportTicketSeeder --force",
      },
      {
        type: "table",
        title: "What each procedure does",
        head: ["Procedure", "Effect"],
        rows: [
          ["migrate:fresh --seed", "Drops every table, rebuilds the schema, reloads all seeders. All users are signed out (sessions are stored in the database)"],
          ["db:seed (single class)", "Re-applies that seeder only — safe for idempotent seeders, destructive otherwise"],
          ["migrate (no fresh)", "Applies pending migrations only — for production upgrades, never touches data"],
          ["storage:link", "Recreates the public → storage link; run after a fresh clone or if PDFs return errors"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Sessions are database-backed",
        text: "Because sessions live in the database, a full re-seed signs everyone out mid-work. Warn users first, and use the single-seeder route when only one dataset needs topping up.",
      },
    ],
  },
  {
    id: "maintenance",
    label: "Maintenance Windows",
    icon: Wrench,
    title: "Maintenance Window Procedure",
    summary:
      "The supported way to take the system offline for upkeep — no users get confusing half-written states.",
    blocks: [
      {
        type: "steps",
        title: "Running a window",
        items: [
          { title: "Announce the window", detail: "Tell users the start, expected end, and that write operations will be blocked." },
          { title: "Enable maintenance mode", detail: "Super Admin → Settings → System. Writes are blocked for everyone except super admins, reads stay open, and an amber banner is shown to all users." },
          { title: "Do the work", detail: "Migrations, storage work, backups, releases." },
          { title: "Verify", detail: "Sign in as an ordinary user and confirm a write now succeeds." },
          { title: "Disable maintenance mode", detail: "The banner disappears and operations restore. Announce completion." },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Why not just stop the server",
        text: "Maintenance mode gives everyone a clear banner instead of cryptic network errors, and super admins can still work through the window. It is the intended mechanism — plain server downtime gives neither.",
      },
    ],
  },
  {
    id: "incidents",
    label: "Incident Response",
    icon: Siren,
    title: "Incident Response",
    summary:
      "The failures you will actually see, what they mean and the first three things to check.",
    blocks: [
      {
        type: "table",
        title: "Symptom → cause → first moves",
        head: ["Symptom", "Likely cause & response"],
        rows: [
          ["Dashboard and every page is empty", "API not running or seeding incomplete — check the API is up at :8000, then reseed"],
          ["Everyone is signed out at once", "The database was re-seeded (sessions live there) — expected after migrate:fresh, otherwise treat as a DB incident"],
          ["PDF / document download fails", "Missing storage link — run php artisan storage:link; if only one generator fails, that endpoint is the problem"],
          ["Writes blocked for non-super-admins", "Maintenance mode is on — disable it once the window ends"],
          ["Users see 403 on an action", "Their role lacks the permission — check Admin → Roles and assign the right role"],
          ["Out-of-order status rejected", "By design — walk the record through the intermediate statuses"],
          ["Interpreter / CSRF errors (419 / 403 on writes)", "Hostname mismatch — pick one hostname (localhost:3000) and clear cookies"],
          ["Uploaded documents gone after reseed", "storage/ is separate from the database — restore the storage backup alongside the SQL restore"],
          ["Login feels slow or locked", "Rate limiting after failed attempts — wait a minute; repeated lockouts belong in the security review"],
        ],
      },
      {
        type: "steps",
        title: "During an incident",
        items: [
          { title: "Contain", detail: "If writes are corrupting data, enable maintenance mode immediately." },
          { title: "Capture", detail: "Note the exact time, the record numbers involved, and which user hit it — then check Admin → Audit Logs and System Logs for the same window." },
          { title: "Communicate", detail: "Tell affected users what is blocked and the expected fix time." },
          { title: "Fix forward", detail: "Prefer correcting records over a full re-seed; only re-seed when the dataset itself is the problem." },
          { title: "Write it up", detail: "Record the cause and fix against the support ticket or incident notes so the next occurrence is shorter." },
        ],
      },
    ],
  },
  {
    id: "governance",
    label: "Governance",
    icon: ShieldCheck,
    title: "Governance & Routine Reviews",
    summary:
      "The human procedures that keep data quality and access rights correct over time.",
    blocks: [
      {
        type: "steps",
        title: "User lifecycle",
        items: [
          { title: "Joiner", detail: "Create the account, assign the least-privileged role that fits, hand them the onboarding checklist for that role." },
          { title: "Mover", detail: "Update the role to the new responsibility — permissions follow the role, so the UI updates immediately." },
          { title: "Leaver", detail: "Deactivate first (reversible), confirm they hold no pending approvals, then permanently delete if required." },
        ],
      },
      {
        type: "steps",
        title: "Data quality reviews",
        items: [
          { title: "Master data", detail: "Quarterly: merge duplicate contractors, refresh bank details, correct stale customer tax numbers." },
          { title: "Blacklisted contractors", detail: "Review periodically — remove blacklisting when the suspension is resolved." },
          { title: "Contractor ratings", detail: "Refresh the 1–5 star ratings so bid comparisons reflect current performance." },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Related documents",
        text: "Setup & Deployment covers installation and production configuration; the Testing Guide shows how to verify the stack after changes; the System Walkthrough Guide documents every workflow referenced here.",
      },
    ],
  },
];

// ── Render helpers ────────────────────────────────────────────

const calloutTones = {
  info: { wrap: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20", icon: Info, iconClass: "text-blue-500" },
  warning: { wrap: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: AlertTriangle, iconClass: "text-amber-500" },
};

function Callout({ block }) {
  const tone = calloutTones[block.tone] || calloutTones.info;
  const Icon = tone.icon;
  return (
    <div className={`rounded-lg border p-3.5 flex gap-3 ${tone.wrap}`}>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${tone.iconClass}`} />
      <div>
        <p className="text-xs font-medium text-foreground">{block.title}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{block.text}</p>
      </div>
    </div>
  );
}

function CodeBlock({ block }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{block.title}</p>
      <pre className="rounded-lg border border-border bg-muted/50 p-3 overflow-x-auto">
        <code className="text-[10px] font-mono text-foreground leading-relaxed whitespace-pre">{block.code}</code>
      </pre>
    </div>
  );
}

function Steps({ block }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{block.title}</p>
      <ol className="space-y-2.5">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-semibold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{item.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function KVTable({ block }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{block.title}</p>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y divide-border">
            {block.rows.map(([k, v]) => (
              <tr key={k}>
                <td className="px-3 py-2 align-top w-1/3 text-xs font-medium text-foreground">{k}</td>
                <td className="px-3 py-2 align-top text-[11px] text-muted-foreground leading-relaxed">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataTable({ block }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{block.title}</p>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              {block.head.map((h) => (
                <th key={h} className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {block.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className={`px-3 py-2 align-top text-[11px] leading-relaxed ${j === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionBlock({ block }) {
  switch (block.type) {
    case "steps": return <Steps block={block} />;
    case "table": return <DataTable block={block} />;
    case "kv": return <KVTable block={block} />;
    case "code": return <CodeBlock block={block} />;
    case "callout": return <Callout block={block} />;
    default: return null;
  }
}

export default function RunbookPage() {
  const [activeId, setActiveId] = useState(runbookSections[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const updateActive = () => {
      let current = runbookSections[0].id;
      for (const section of runbookSections) {
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
              Operations Runbook
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Backups, resets, maintenance windows, incident response and routine governance — for the platform team
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
            <div className="sticky top-6">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-2">
                Procedures
              </p>
              <nav className="space-y-0.5">
                {runbookSections.map((section) => {
                  const Icon = section.icon;
                  const active = activeId === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors text-left ${
                        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Mobile pills */}
          <div className="lg:hidden -mx-4 px-4">
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {runbookSections.map((section) => {
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
            {runbookSections.map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => { sectionRefs.current[section.id] = el; }}
                  className="scroll-mt-20"
                >
                  <Card>
                    <CardContent className="p-4 sm:p-5 space-y-4">
                      <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{section.summary}</p>
                        </div>
                      </div>
                      {section.blocks.map((block, i) => (
                        <SectionBlock key={i} block={block} />
                      ))}
                    </CardContent>
                  </Card>
                </section>
              );
            })}

            {/* Footer */}
            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted shrink-0">
                  <Terminal className="w-4.5 h-4.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Everything here assumes the standard XAMPP layout</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                    Paths and commands follow the Setup & Deployment Guide. If your installation differs, translate the paths — the sequence is the same.
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
