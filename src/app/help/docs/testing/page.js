"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import Link from "next/link";
import { usePermission } from "@/hooks/usePermission";
import {
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  Terminal,
  Server,
  TestTube2,
  CheckCircle2,
  Info,
  AlertTriangle,
  Lightbulb,
  Lock,
  BarChart3,
  PencilRuler,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// Testing documentation — how the system is verified.
// ─────────────────────────────────────────────────────────────

const testSections = [
  {
    id: "overview",
    label: "Overview",
    icon: FlaskConical,
    title: "Test Strategy Overview",
    summary:
      "Quality is verified on two layers: a PHPUnit feature suite that exercises the backend workflows end-to-end through real HTTP requests, and a Playwright suite that drives the actual browser through the UI.",
    blocks: [
      {
        type: "kv",
        title: "The two layers",
        rows: [
          ["Backend — PHPUnit", "Feature tests run against an in-memory SQLite database. Each test builds the data it needs, calls the API and asserts the response, the database state and the workflow rules (state machines, permission gates, validation)."],
          ["Frontend — Playwright", "Real Chromium runs against the live app (both servers must be running). Covers QA walkthroughs, edge cases, file downloads, mocked API contracts, network resilience, responsiveness, visual snapshots and accessibility."],
          ["Latest results", "Backend: 61 tests / 232 assertions passing. Frontend QA: 26/26 pass, plus 19 RBAC / visual / accessibility checks."],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Run the backend suite first",
        text: "The feature suite proves the API contracts (statuses, permissions, PDFs). The browser suite assumes those contracts hold — backend failures usually surface as UI failures.",
      },
    ],
  },
  {
    id: "running-tests",
    label: "Running Tests",
    icon: Terminal,
    title: "Running the Tests",
    summary:
      "Two commands run everything: Artisan for the backend suite, Playwright for the browser suite.",
    blocks: [
      {
        type: "code",
        title: "Backend — full suite",
        code: "cd C:\\xampp\\htdocs\\finance-app\\finance-backend\nC:\\xampp\\php\\php.exe artisan test",
      },
      {
        type: "code",
        title: "Backend — single area",
        code: "C:\\xampp\\php\\php.exe artisan test --filter=ProcurementFlowTest",
      },
      {
        type: "code",
        title: "Frontend — full browser suite (both servers must be running)",
        code: "cd C:\\xampp\\htdocs\\finance-app\\finance-frontend\nnpx playwright test",
      },
      {
        type: "code",
        title: "Frontend — single spec",
        code: "npx playwright test src/tests/qa_full_suite.spec.js\nnpx playwright test -g \"TC-012\"",
      },
      {
        type: "steps",
        title: "Before you run",
        items: [
          { title: "Start the API", detail: "Run php artisan serve from finance-backend (http://127.0.0.1:8000)." },
          { title: "Start the frontend", detail: "Run npm run dev from finance-frontend (http://localhost:3000)." },
          { title: "Keep one hostname", detail: "Use localhost:3000 consistently — the browser suite signs in through the app and mixing hostnames breaks the session." },
          { title: "Seed the demo data", detail: "The suites expect the seeded dataset (tenders, jobs, bids, POs, bills, invoices). See the Setup guide for reseeding." },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Backend tests are self-contained",
        text: "The PHPUnit suite uses an in-memory SQLite database and the RefreshDatabase trait — it never touches your local finance-app database. The browser suite does use it, so reseed afterwards if a run leaves data behind.",
      },
    ],
  },
  {
    id: "backend-suites",
    label: "Backend Suites",
    icon: Server,
    title: "Backend Test Suites (PHPUnit)",
    summary:
      "Each suite covers one domain of the tender-to-cash workflow, testing the real API endpoints, status machines and permission gates.",
    blocks: [
      {
        type: "table",
        title: "What each suite proves",
        head: ["Suite", "Covers"],
        rows: [
          ["ProcurementFlowTest", "Tenders, jobs, quotation entry and winning-bid selection, PO state machine"],
          ["ContractorBillWorkflowTest", "Bill create → document upload → verify → submit → finance approve/reject → payment, plus permission checks"],
          ["InvoiceWorkflowTest", "Invoice lifecycle incl. tax invoice generation, approval, rejection clearing, payment recording, banking and audit trail"],
          ["PdfGenerationTest", "Invoice PDF, PO PDF, job award letter and internal receipt downloads"],
          ["UserManagementTest", "User directory, role assignment, deactivation rules and RBAC enforcement"],
          ["SupportTicketTest", "Help Center ticket listing, submission with auto numbering and validation errors"],
        ],
      },
      {
        type: "steps",
        title: "How backend tests are written",
        items: [
          { title: "RefreshDatabase", detail: "Every test starts from a clean in-memory database." },
          { title: "Seed only what you need", detail: "Tests seed the roles they need (RolePermissionSeeder) and create their own users via factories." },
          { title: "Drive the API", detail: "Requests go through the real routing and middleware stack with actingAs(), so permission gates are genuinely enforced." },
          { title: "Assert both sides", detail: "Assert the JSON response and the database state — e.g. a selected quotation must also flip the job to In Progress and reject rival bids." },
        ],
      },
    ],
  },
  {
    id: "frontend-suites",
    label: "Frontend Suites",
    icon: TestTube2,
    title: "Frontend Test Suites (Playwright)",
    summary:
      "Browser-level verification across the whole application surface — functional QA, edge cases, downloads, contracts, resilience, responsiveness and accessibility.",
    blocks: [
      {
        type: "table",
        title: "The full QA suite — module walkthroughs (TC-001…TC-025 + language)",
        head: ["Spec", "Covers"],
        rows: [
          ["qa_full_suite.spec.js", "Authentication and dashboard KPIs (TC-001), tenders register / creation / search / edit / delete (TC-002…004), jobs list, views and export (TC-005), purchase orders register and stats (TC-006), invoices ledger and detail (TC-007…008), contractors (TC-009), contractor bills pipeline (TC-010), customers (TC-011), Settings draft model for every tab (TC-012…017), notifications inbox (TC-018), admin users, roles and audit logs (TC-020…025), and the language switch end-to-end (TC-021)"],
        ],
      },
      {
        type: "table",
        title: "Specialised suites",
        head: ["Suite", "Covers"],
        rows: [
          ["edge_cases.spec.js (EC-001…014)", "Validation boundaries, empty states, injection-safe search, 404 and not-found fallbacks, empty-export guards, rapid filter toggling, pagination edges, back/forward navigation and reload persistence"],
          ["file_workflows.spec.js (FILE-001…003)", "CSV export downloads for tenders and purchase orders, and the backend invoice PDF returning the correct content type"],
          ["mock_api.spec.js (MA-001…012)", "API-contract behaviour with mocked responses: payload rendering, 500 error toast, 401 redirect, loading skeletons, empty states, 422 keeping the modal open, aborted requests, malformed JSON, and create/delete flows"],
          ["network_resilience.spec.js (NET-001…003)", "Slow 3G degradation, server errors on submission preserving input, and complete offline behaviour"],
          ["responsive_devices.spec.js (RESP-001…003)", "iPhone, iPad and desktop viewports render without overflow and scale tables correctly"],
          ["visual_regression.spec.js (VIS-001…003)", "Snapshot comparison for the sign-in portal, dashboard KPI layout and sidebar structure"],
          ["accessibility.spec.js (AX-001…013)", "Language declaration, form labels, landmarks, alt text, keyboard tab order, focus indicators, accessible names, table semantics, dialog semantics with focus containment, ARIA live regions and WCAG AA contrast"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Visual snapshots are baselines",
        text: "Visual regression specs compare against committed snapshots. If a legitimate UI change alters a snapshot, re-record the baseline for that spec rather than editing the screenshot by hand.",
      },
    ],
  },
  {
    id: "coverage",
    label: "Coverage Map",
    icon: BarChart3,
    title: "Coverage by Module",
    summary:
      "What is verified for each part of the system, across both layers.",
    blocks: [
      {
        type: "table",
        title: "Backend coverage",
        head: ["Module", "Backend tests"],
        rows: [
          ["Tenders", "Creation, status transitions, award letter PDF"],
          ["Jobs & quotations", "Creation, bid entry, winning-bid selection with side effects, award letter"],
          ["Purchase orders", "Full state machine incl. rejected out-of-order transitions, PDF, stats"],
          ["Contractor bills", "Document requirement, verify, submit, approve, reject-with-reason, pay, permission gates"],
          ["Invoices", "Create, tax invoice, submit, approve, reject clearing, record payment, bank, audit trail, PDFs and receipts"],
          ["Users & roles", "Directory, assignment, deactivation, RBAC 403s"],
          ["Help Center", "Ticket submission, numbering, validation, per-user visibility"],
        ],
      },
      {
        type: "table",
        title: "Frontend coverage",
        head: ["Module", "Browser tests"],
        rows: [
          ["Authentication & shell", "Login flow, route protection, session persistence, reload survival"],
          ["Dashboard", "KPI rendering from the executive summary, layout snapshot"],
          ["Tenders / Jobs / POs / Invoices", "Registers, filters, modals, exports, detail views, action buttons"],
          ["Settings", "Draft model on every tab, save persistence, notification preference round-trip to the API, theme application"],
          ["Notifications", "Inbox, filtering and badge behaviour"],
          ["Administration", "Users directory, role assignment, audit log access, telemetry page"],
          ["Cross-cutting", "Responsiveness, accessibility, visual baselines, network resilience, API contract handling"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "End-to-end smoke path",
        text: "The suites collectively verify the full cycle: job award → award letter → PO Draft→Approved→Sent→Received → bill with document → verify → submit → approve → pay → invoice → tax invoice → approve → payment → banked with receipt → audit trail → notifications → dashboard KPIs.",
      },
    ],
  },
  {
    id: "security-testing",
    label: "Security Testing",
    icon: Lock,
    title: "Security & Access Testing (Internal)",
    restricted: true,
    summary:
      "Authentication, permission and resilience testing. Restricted to administrators and the development team.",
    blocks: [
      {
        type: "table",
        title: "Backend security suites",
        head: ["Suite", "Covers"],
        rows: [
          ["AuthAndSecurityTest", "Login with valid and invalid credentials, failed-attempt counting, account lockout, the full OTP password-reset flow, unauthenticated request handling and token revocation on logout"],
          ["SettingsSecurityTest", "Notification preference persistence with critical alerts forced on, the complete two-factor challenge / verify / resend / disable cycle, maintenance mode 503 gating, JSON 401 hardening and the unread-count badge endpoint"],
        ],
      },
      {
        type: "table",
        title: "Frontend security specs",
        head: ["Suite", "Covers"],
        rows: [
          ["rbac_security.spec.js (SEC-001…003)", "Unauthenticated route access redirects to sign-in, tampered session tokens force logout, and sign-in rate limiting with error banners"],
          ["qa_full_suite (TC-015 / TC-019)", "Security modals (active sessions and login history) and system telemetry access"],
          ["edge_cases (EC-003 / EC-008)", "Invalid credential handling and protected route redirects"],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Permission tests are the guardrail",
        text: "Several backend suites deliberately assert that the wrong role receives 403 — for example that a viewer cannot enter quotations and that only Finance can approve payments. Keep those assertions when adding features.",
      },
    ],
  },
  {
    id: "writing-tests",
    label: "Writing Tests",
    icon: PencilRuler,
    title: "Adding New Tests",
    summary:
      "Conventions for extending the suites so they stay fast, isolated and meaningful.",
    blocks: [
      {
        type: "steps",
        title: "Backend conventions",
        items: [
          { title: "Use RefreshDatabase", detail: "Never share state between tests." },
          { title: "Test through the API", detail: "Use actingAs() routes, not model calls, so middleware and permission gates are included." },
          { title: "Assert the workflow, not just the response", detail: "For transitions, assert the resulting status and side effects (rejected bids, cleared approval data, generated receipts)." },
          { title: "Name tests as behaviour", detail: "e.g. 'bill cannot be verified without attached document' — the name states the rule." },
        ],
      },
      {
        type: "steps",
        title: "Frontend conventions",
        items: [
          { title: "Follow the spec families", detail: "Add QA walkthroughs to qa_full_suite.spec.js (incrementing TC numbers) and specialised checks to their matching spec file." },
          { title: "Keep IDs sequential", detail: "TC-026 after TC-025; SEC-004 after SEC-003 — the numbering is used when reporting results." },
          { title: "Wait on conditions, not timeouts", detail: "Prefer locator assertions over fixed sleeps so the suite stays fast and stable." },
          { title: "One behaviour per test", detail: "Each test should fail for exactly one reason." },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Before merging",
        text: "Run the full backend suite plus the affected frontend specs, and record the pass counts in your report.",
      },
    ],
  },
];

// ── Render helpers ────────────────────────────────────────────

const calloutTones = {
  info: { wrap: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20", icon: Info, iconClass: "text-blue-500" },
  warning: { wrap: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: AlertTriangle, iconClass: "text-amber-500" },
  tip: { wrap: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", icon: Lightbulb, iconClass: "text-emerald-500" },
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

function SectionBlock({ block }) {
  switch (block.type) {
    case "steps": return <Steps block={block} />;
    case "table": return <DataTable block={block} />;
    case "callout": return <Callout block={block} />;
    case "kv": return <KVTable block={block} />;
    case "code": return <CodeBlock block={block} />;
    default: return null;
  }
}

export default function TestingDocsPage() {
  const [activeId, setActiveId] = useState(testSections[0].id);
  const { t } = useTranslation();

  // Translate the page content at render so language switches apply.
  const sectionsT = testSections.map((section) => ({
    ...section,
    label: t(section.label),
    title: t(section.title),
    summary: t(section.summary),
    blocks: section.blocks.map((block) => ({
      ...block,
      title: block.title ? t(block.title) : block.title,
      note: block.note ? t(block.note) : block.note,
      text: block.text ? t(block.text) : block.text,
      items: block.items ? block.items.map((item) => (typeof item === "string" ? t(item) : { ...item, title: t(item.title), detail: t(item.detail) })) : block.items,
      terms: block.terms ? block.terms.map((term) => ({ term: t(term.term), def: t(term.def) })) : block.terms,
      steps: block.steps ? block.steps.map((s) => t(s)) : block.steps,
      rows: block.rows
        ? block.rows.map((row) =>
            Array.isArray(row)
              ? row.map((cell) => (typeof cell === "string" ? t(cell) : cell))
              : typeof row === "object" && row !== null
                ? Object.fromEntries(Object.entries(row).map(([k, v]) => [k, typeof v === "string" ? t(v) : v]))
                : row
          )
        : block.rows,
      head: block.head ? block.head.map((h) => t(h)) : block.head,
      code: block.code ? block.code : block.code,
    })),
  }));
  const sectionRefs = useRef({});
  // Security testing internals are visible to Super Admin / Admin (and any
  // development-team account holding an admin permission) only.
  const isAdminTier = usePermission(["manage-users", "manage-roles", "manage-system"]);

  useEffect(() => {
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const updateActive = () => {
      let current = sectionsT[0].id;
      for (const section of sectionsT) {
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
              Testing Guide
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              How the system is verified: backend feature suites, browser QA suites, coverage and conventions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/help/docs"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Documents
            </Link>
            <Link
              href="/help/docs/api"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              API Reference
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
          {/* Category rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-2">
                Sections
              </p>
              <nav className="space-y-0.5">
                {sectionsT.map((section) => {
                  const Icon = section.icon;
                  const active = activeId === section.id;
                  const locked = section.restricted && !isAdminTier;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors text-left ${
                        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {locked ? <Lock className="w-3.5 h-3.5 shrink-0" /> : <Icon className="w-3.5 h-3.5 shrink-0" />}
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
              {sectionsT.map((section) => {
                const Icon = section.icon;
                const active = activeId === section.id;
                const locked = section.restricted && !isAdminTier;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors whitespace-nowrap ${
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {locked ? <Lock className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 min-w-0">
            {sectionsT.map((section) => {
              const Icon = section.icon;
              const locked = section.restricted && !isAdminTier;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => { sectionRefs.current[section.id] = el; }}
                  className="scroll-mt-20"
                >
                  <Card className={locked ? "border-dashed" : undefined}>
                    <CardContent className="p-4 sm:p-5 space-y-4">
                      <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                            {section.restricted && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 text-[9px] font-semibold uppercase tracking-wide">
                                <Lock className="w-2.5 h-2.5" />
                                Internal
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{section.summary}</p>
                        </div>
                      </div>
                      {locked ? (
                        <div className="rounded-lg border border-dashed border-border p-6 text-center">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mx-auto mb-2.5">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <h3 className="text-xs font-medium text-foreground">Restricted documentation</h3>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 max-w-sm mx-auto">
                            Security and access testing details are available to Super Admins, Admins and the development team only.
                          </p>
                        </div>
                      ) : (
                        section.blocks.map((block, i) => (
                          <SectionBlock key={i} block={block} />
                        ))
                      )}
                    </CardContent>
                  </Card>
                </section>
              );
            })}

            {/* Footer */}
            <Card>
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <CheckCircle2 className="w-4.5 h-4.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current status: all suites green</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      Backend 61 tests / 232 assertions · Frontend QA 26/26 plus 19 RBAC / visual / accessibility checks.
                    </p>
                  </div>
                </div>
                <Link
                  href="/help/docs"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors shrink-0"
                >
                  Browse Documents
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
