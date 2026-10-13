"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Server,
  Cpu,
  Play,
  Settings,
  Database,
  LogIn,
  Rocket,
  Stethoscope,
  Info,
  AlertTriangle,
  Lightbulb,
  Package,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// Setup & deployment guide — running the system locally
// and taking it to production.
// ─────────────────────────────────────────────────────────────

const setupSections = [
  {
    id: "prerequisites",
    label: "Prerequisites",
    icon: Cpu,
    title: "Prerequisites",
    summary:
      "What must be installed before the system can run, on Windows with XAMPP.",
    blocks: [
      {
        type: "kv",
        title: "Required software",
        rows: [
          ["XAMPP (PHP 8.2+ and MySQL)", "PHP at C:\\xampp\\php\\php.exe with MySQL running on port 3306. Required PHP extensions: pdo_mysql, mbstring, xml, bcmath and gd (for PDFs)."],
          ["Node.js 18+", "Node 20 LTS is recommended for the Next.js frontend."],
          ["Composer", "For the Laravel backend dependencies."],
          ["The repository", "finance-backend (Laravel API) and finance-frontend (Next.js app) side by side."],
        ],
      },
      {
        type: "kv",
        title: "The three components",
        rows: [
          ["API", "Laravel 12 + Sanctum (cookie auth) — runs on http://127.0.0.1:8000"],
          ["Frontend", "Next.js + React + Tailwind — runs on http://localhost:3000"],
          ["Database", "MySQL (XAMPP) at 127.0.0.1:3306, database name finance-app"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Same-origin by design",
        text: "The frontend proxies /api/* and /sanctum/* to the backend, so the browser always talks to a single origin.",
      },
    ],
  },
  {
    id: "first-time-setup",
    label: "First-Time Setup",
    icon: Package,
    title: "First-Time Setup",
    summary:
      "Run these steps once on a fresh clone to get both servers able to start.",
    blocks: [
      {
        type: "code",
        title: "1 — Install backend dependencies",
        code: "cd C:\\xampp\\htdocs\\finance-app\\finance-backend\ncomposer install",
      },
      {
        type: "code",
        title: "2 — Create the environment file",
        code: "Copy-Item .env.example .env\n# then edit .env and set DB_DATABASE=finance-app",
      },
      {
        type: "code",
        title: "3 — Generate the app key",
        code: "C:\\xampp\\php\\php.exe artisan key:generate",
      },
      {
        type: "code",
        title: "4 — Link storage (needed for uploaded documents and PDFs)",
        code: "C:\\xampp\\php\\php.exe artisan storage:link",
      },
      {
        type: "code",
        title: "5 — Create the empty database",
        code: "C:\\xampp\\mysql\\bin\\mysql.exe -uroot -e \"CREATE DATABASE `finance-app` CHARACTER SET utf8mb4;\"\n# or create it in phpMyAdmin",
      },
      {
        type: "code",
        title: "6 — Run migrations and seed the demo dataset",
        code: "C:\\xampp\\php\\php.exe artisan migrate:fresh --seed --force",
      },
      {
        type: "code",
        title: "7 — Install frontend dependencies",
        code: "cd C:\\xampp\\htdocs\\finance-app\\finance-frontend\nnpm install",
      },
      {
        type: "callout",
        tone: "warning",
        title: "migrate:fresh is destructive",
        text: "It drops every table and rebuilds them from the migrations. Only run it when you intend to reset the data — it also signs everyone out, because the session table is wiped.",
      },
    ],
  },
  {
    id: "starting",
    label: "Starting the System",
    icon: Play,
    title: "Starting the System",
    summary:
      "Two servers, two terminals. The frontend must be running for the API to be reachable through the proxy.",
    blocks: [
      {
        type: "code",
        title: "Terminal 1 — the API",
        code: "cd C:\\xampp\\htdocs\\finance-app\\finance-backend\nC:\\xampp\\php\\php.exe artisan serve",
      },
      {
        type: "code",
        title: "Terminal 2 — the frontend",
        code: "cd C:\\xampp\\htdocs\\finance-app\\finance-frontend\nnpm run dev",
      },
      {
        type: "steps",
        title: "Then verify",
        items: [
          { title: "Open the app", detail: "Browse to http://localhost:3000." },
          { title: "Sign in", detail: "Use the demo account for your role — the seeded credentials are provided by your administrator." },
          { title: "Check the dashboard loads data", detail: "If KPIs are empty, the seed may be incomplete — see the Seeding section." },
          { title: "Keep the hostname consistent", detail: "Use localhost:3000 (or 127.0.0.1:3000) everywhere — mixing hostnames breaks the session cookie scope." },
        ],
      },
    ],
  },
  {
    id: "configuration",
    label: "Configuration",
    icon: Settings,
    title: "Configuration Reference",
    summary:
      "The settings that matter, where they live and what they affect.",
    blocks: [
      {
        type: "table",
        title: "Backend — .env",
        head: ["Key", "Purpose"],
        rows: [
          ["APP_URL", "Base URL of the API (default http://127.0.0.1:8000)"],
          ["DB_CONNECTION / DB_HOST / DB_PORT", "MySQL connection (127.0.0.1:3306)"],
          ["DB_DATABASE / DB_USERNAME / DB_PASSWORD", "The finance-app database and its credentials"],
          ["SESSION_DRIVER", "Session storage (database) — a re-seed signs everyone out"],
          ["MAIL_MAILER", "Mail transport used by OTP and notification emails"],
          ["FRONTEND_URL", "Allowed origin for the SPA / CORS"],
        ],
      },
      {
        type: "table",
        title: "Frontend — next.config.mjs",
        head: ["Setting", "Purpose"],
        rows: [
          ["Rewrites /api/* → http://127.0.0.1:8000", "Proxies API traffic so the browser stays same-origin"],
          ["Rewrites /sanctum/* → http://127.0.0.1:8000", "Proxies the CSRF cookie bootstrap"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Changing a port",
        text: "If the API runs on a different port, update the rewrite targets in next.config.mjs to match.",
      },
    ],
  },
  {
    id: "seeding",
    label: "Seeding & Reset",
    icon: Database,
    title: "Seeding & Reset",
    summary:
      "The demo dataset and how to rebuild it from a clean slate.",
    blocks: [
      {
        type: "code",
        title: "Full clean reset + complete seed",
        code: "C:\\xampp\\php\\php.exe artisan migrate:fresh --seed --force",
      },
      {
        type: "code",
        title: "Re-run only the quotation seeder (idempotent)",
        code: "C:\\xampp\\php\\php.exe artisan db:seed --class=ContractorQuotationSeeder --force",
      },
      {
        type: "table",
        title: "What the seed produces",
        head: ["Data", "Rows", "Notes"],
        rows: [
          ["Users & roles", "5 users, 5 roles", "Super Admin, Admin, Procurement, Finance, Viewer"],
          ["Customers", "8", "Dialog, LECO, CEB, SLT, NWSDB, Mobitel, AASL, Railways"],
          ["Contractors", "8", "TechBuild, Sigma Engineering, DataNet, PowerLink, SkyNet, CivTech, Apex Telecom, GreenPath"],
          ["Tenders", "10", "5 awarded, 5 open"],
          ["Jobs", "10", "6 in progress, 3 pending (with bids open), 1 awarded"],
          ["Contractor quotations", "30", "3 competitive bids for every job"],
          ["Purchase orders", "10", "With status history"],
          ["Contractor bills", "8", "Paid / approved / submitted states"],
          ["Invoices", "7", "With payment and banking history"],
          ["Cheques, notifications, audit logs, tickets", "2 / 2 / 4 / 7", "Supporting workflow history"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Schema layout",
        text: "One create_* migration per table — there are no alter migrations. After any consolidation, the full rebuild is simply migrate:fresh --seed --force.",
      },
    ],
  },
  {
    id: "signing-in",
    label: "Signing In",
    icon: LogIn,
    title: "Signing In & Roles",
    summary:
      "The seeded accounts map one-to-one to the roles used across the system.",
    blocks: [
      {
        type: "table",
        title: "Demo accounts and what each role can do",
        head: ["Account", "Role", "Can do"],
        rows: [
          ["superadmin@finance.com", "Super Admin", "Everything, including system settings, maintenance mode and telemetry"],
          ["admin@finance.com", "Admin", "All operations plus user and role management (no system access)"],
          ["procurement@finance.com", "Procurement", "Master data, tenders, jobs, quotations, contractor bills"],
          ["finance@finance.com", "Finance", "Approve and record payments, banking, audit trail"],
          ["viewer@finance.com", "Viewer", "Read-only invoice access"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Credentials",
        text: "The demo password for every seeded account is defined by the project administrator (it is intentionally not documented here). Ask your administrator for the current value.",
      },
    ],
  },
  {
    id: "production",
    label: "Production",
    icon: Rocket,
    title: "Production Deployment",
    summary:
      "Taking the stack live: build the frontend, serve the API behind a real web server and lock down the environment.",
    blocks: [
      {
        type: "steps",
        title: "Build and deploy",
        items: [
          { title: "Build the frontend", detail: "Run npm run build in finance-frontend, then npm run start (or deploy the static export per the hosting configuration)." },
          { title: "Serve the API", detail: "Run the Laravel app behind Nginx/Apache with PHP-FPM pointing at finance-backend/public — not artisan serve, which is development-only." },
          { title: "Point the frontend at the API", detail: "Update the rewrite targets in next.config.mjs (or the hosting equivalent) to the production API origin." },
          { title: "Set production env values", detail: "APP_ENV=production, APP_DEBUG=false, real database and mail credentials, and the production FRONTEND_URL." },
          { title: "Run migrations on the target", detail: "php artisan migrate --force on the production database, then seed only if a fresh demo environment is intended." },
          { title: "Verify", detail: "Confirm sign-in works on the production hostname and that /api/user responds through the proxy." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Session and cookie scope",
        text: "Sanctum cookie auth is host-scoped. Deploy the frontend and API under the same site (or configure stateful domains) — and always use the production hostname consistently.",
      },
    ],
  },
  {
    id: "health",
    label: "Health Checks",
    icon: Stethoscope,
    title: "Quick Health Checks",
    summary:
      "Fast checks when something is not behaving as expected.",
    blocks: [
      {
        type: "table",
        title: "Checks",
        head: ["Check", "Expected"],
        rows: [
          ["http://127.0.0.1:8000 reachable", "The Laravel API responds (any JSON error is fine — it means it is up)"],
          ["http://localhost:3000 loads", "The sign-in page renders"],
          ["Proxy works", "The browser reaches /api/user after sign-in"],
          ["PDFs download", "storage:link has been run and storage/ is writable"],
          ["Data present", "The dashboard KPIs show figures — if empty, reseed"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Where to look next",
        text: "The System Walkthrough Guide has the full troubleshooting table, and the Testing Guide shows how to verify the system with automated suites.",
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

export default function SetupDocsPage() {
  const [activeId, setActiveId] = useState(setupSections[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const updateActive = () => {
      let current = setupSections[0].id;
      for (const section of setupSections) {
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
              Setup & Deployment Guide
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              From a clean machine to a running system: prerequisites, installation, configuration, seeding and production
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
          {/* Category rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-2">
                Sections
              </p>
              <nav className="space-y-0.5">
                {setupSections.map((section) => {
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
              {setupSections.map((section) => {
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
            {setupSections.map((section) => {
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
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <Settings className="w-4.5 h-4.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">System running but behaving oddly?</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      The Walkthrough Guide has a full troubleshooting table, and the Testing Guide shows how to verify the stack automatically.
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
