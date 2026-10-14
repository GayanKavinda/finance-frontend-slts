"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";
import {
  ArrowLeft,
  Database,
  Users,
  Building2,
  Gavel,
  Briefcase,
  FileSignature,
  ClipboardList,
  Receipt,
  FileSpreadsheet,
  Landmark,
  GraduationCap,
  Info,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// Demo data reference — exactly what the seed produces,
// for training and testing scenarios.
// ─────────────────────────────────────────────────────────────

function DocTable({ title, head, rows }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              {head.map((h) => (
                <th key={h} className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, i) => (
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

const demoDataSections = [
  {
    id: "whats-seeded",
    label: "What's Seeded",
    icon: Database,
    title: "What the Seed Produces",
    summary:
      "The demo dataset is rebuilt with one command and covers the whole tender-to-cash cycle — so every module has realistic data to work with.",
    blocks: [
      {
        type: "table",
        title: "Row counts",
        head: ["Data", "Rows"],
        rows: [
          ["Users (5 roles)", "5"],
          ["Customers", "8"],
          ["Contractors", "8"],
          ["Tenders (5 awarded, 5 open)", "10"],
          ["Jobs (6 in progress, 3 pending, 1 completed)", "10"],
          ["Contractor quotations", "30 — exactly 3 bids per job"],
          ["Purchase orders with status history", "10"],
          ["Contractor bills", "8"],
          ["Invoices with payment and banking history", "7"],
          ["Cheques, notifications, audit logs, support tickets", "2 / 2 / 4 / 7"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Rebuild it any time",
        text: "php artisan migrate:fresh --seed --force drops everything and reloads this exact dataset. That also signs everyone out, because sessions live in the database.",
      },
    ],
  },
  {
    id: "master-data",
    label: "Master Data",
    icon: Building2,
    title: "Master Data",
    summary:
      "The customers and contractors behind every demo scenario.",
    blocks: [
      {
        type: "table",
        title: "Customers (8)",
        head: ["Customer", "Sector"],
        rows: [
          ["Dialog Axiata PLC", "Telecommunications"],
          ["Lanka Electricity Company (LECO)", "Electricity distribution"],
          ["Ceylon Electricity Board", "Electricity generation"],
          ["Sri Lanka Telecom PLC", "Telecommunications"],
          ["National Water Supply & Drainage Board", "Water infrastructure"],
          ["Mobitel (Pvt) Ltd", "Mobile telecommunications"],
          ["Airport & Aviation Services (Sri Lanka)", "Aviation services"],
          ["Sri Lanka Railways", "Rail transport"],
        ],
      },
      {
        type: "table",
        title: "Contractors (8)",
        head: ["Contractor", "Speciality"],
        rows: [
          ["TechBuild Solutions (Pvt) Ltd", "General engineering"],
          ["Sigma Engineering & Construction", "Civil & structural"],
          ["DataNet Infrastructure Ltd", "Networks & data"],
          ["PowerLink Electrical Services", "Electrical"],
          ["SkyNet Tower Contractors", "Tower works"],
          ["CivTech Builders (Pvt) Ltd", "Civil works"],
          ["Apex Telecom Installations Ltd", "Telecom installations"],
          ["GreenPath Civil Works", "Civil & trenching"],
        ],
      },
    ],
  },
  {
    id: "tenders-jobs",
    label: "Tenders & Jobs",
    icon: Gavel,
    title: "Tenders & Jobs",
    summary:
      "The pipeline the demos run through — five won tenders and five open bids.",
    blocks: [
      {
        type: "table",
        title: "Awarded tenders (first five of ten)",
        head: ["Tender", "Name", "Awarded value"],
        rows: [
          ["TND-2026-001", "Fibre Optic Network Expansion – Western Province", "LKR 18,500,000"],
          ["TND-2026-002", "4G LTE Tower Modernisation – Colombo Metro", "LKR 12,000,000"],
          ["TND-2026-003", "Smart Metering Infrastructure Deployment", "LKR 45,000,000"],
          ["TND-2026-004", "Substation Automation & SCADA Upgrade", "LKR 32,000,000"],
          ["TND-2026-005", "(see the register)", "—"],
        ],
      },
      {
        type: "table",
        title: "Jobs (first seven of ten)",
        head: ["Job", "Value", "State"],
        rows: [
          ["FTTH Cable Laying – Colombo Zone A", "LKR 8,500,000", "Awarded — TechBuild at 8,100,000"],
          ["FTTH Splicing & Testing – Colombo Zone B", "LKR 5,500,000", "Awarded — DataNet at 5,200,000"],
          ["Smart Meter Installation – Colombo South", "LKR 18,000,000", "Awarded — Apex Telecom at 17,500,000"],
          ["RTU Replacement – Substations 1–5", "LKR 14,000,000", "Pending — 3 open bids"],
          ["Fibre Trench & Duct – Jaffna District", "LKR 28,000,000", "See register"],
          ["In-Row Cooling Unit Installation – DC Hall A", "LKR 4,800,000", "See register"],
          ["Pump Station Telemetry – Southern Zone", "LKR 12,000,000", "See register"],
        ],
      },
    ],
  },
  {
    id: "quotations",
    label: "Bidding Example",
    icon: FileSignature,
    title: "The Bidding Example — RTU Replacement",
    summary:
      "The most useful demo scenario in the dataset: a pending job with three open bids, ready for an award decision.",
    blocks: [
      {
        type: "table",
        title: "Open bids on job #4 (RTU Replacement – Substations 1–5)",
        head: ["Contractor", "Bid", "Duration", "Status"],
        rows: [
          ["PowerLink Electrical Services", "LKR 13,500,000", "See register", "Submitted"],
          ["Sigma Engineering & Construction", "LKR 13,850,000", "See register", "Submitted"],
          ["TechBuild Solutions (Pvt) Ltd", "LKR 14,100,000", "See register", "Submitted"],
        ],
      },
      {
        type: "steps",
        title: "Run it as a demo",
        items: [
          { title: "Open the job", detail: "Jobs → RTU Replacement – Substations 1–5. The Next Steps card recommends 3 bids — exactly what is loaded." },
          { title: "Compare", detail: "The bid comparison table shows contractor, date, duration and amount side by side." },
          { title: "Award", detail: "Click Select on PowerLink and confirm — the job flips to In Progress, the other two bids are Rejected, and the Award Letter download appears." },
          { title: "Show the result", detail: "The quotations panel is now read-only with the full bid history retained — point out that rejected bids stay visible for audit." },
        ],
      },
    ],
  },
  {
    id: "money-flow",
    label: "Money Flow Data",
    icon: Receipt,
    title: "Purchase Orders, Bills & Invoices",
    summary:
      "Records at every stage of both cash cycles — useful for showing the workflow without creating data live.",
    blocks: [
      {
        type: "table",
        title: "Invoices (7)",
        head: ["Invoice", "Customer", "Amount", "Stage"],
        rows: [
          ["INV-2026-0001", "Dialog Axiata PLC", "LKR 3,500,000", "Banked (full settlement)"],
          ["INV-2026-0002", "Dialog Axiata PLC", "LKR 2,600,000", "Payment Received"],
          ["INV-2026-0003", "Dialog Axiata PLC", "LKR 8,750,000", "Banked"],
          ["INV-2026-0004", "Dialog Axiata PLC", "LKR 13,600,000", "Approved — awaiting payment"],
          ["INV-2026-0005", "Dialog Axiata PLC", "LKR 4,500,000", "Submitted — awaiting finance"],
          ["INV-2026-0006", "Dialog Axiata PLC", "See register", "Draft"],
          ["INV-2026-0007", "Lanka Electricity Company (LECO)", "See register", "Rejected"],
        ],
      },
      {
        type: "table",
        title: "The rest of the money flow",
        head: ["Register", "What is in it"],
        rows: [
          ["Purchase orders (10)", "POs with status history across the Draft → Approved → Sent → Received lifecycle — PDFs and audit trail available on each"],
          ["Contractor bills (8)", "Bills at paid, approved, submitted and draft stages, each with supporting documents and payment records"],
          ["Cheques (2)", "Cheque payments registered against invoices with payer, bank and amount details"],
          ["Support tickets (7)", "Tickets at Open, In Progress and Resolved — show that the Help Center tracks issues too"],
        ],
      },
    ],
  },
  {
    id: "scenarios",
    label: "Training Scenarios",
    icon: GraduationCap,
    title: "Training Scenarios",
    summary:
      "Ready-made exercises for walking a new user through the system — each one uses data that already exists.",
    blocks: [
      {
        type: "steps",
        title: "Scenario A — award a job (5 minutes)",
        items: [
          { title: "Start", detail: "Jobs → RTU Replacement – Substations 1–5 (Pending, 3 bids)." },
          { title: "Act", detail: "Compare the three bids, Select PowerLink Electrical Services, confirm the dialog." },
          { title: "Verify", detail: "Job is In Progress; the other two bids are Rejected; the Award Letter button downloads a PDF." },
        ],
      },
      {
        type: "steps",
        title: "Scenario B — pay a contractor bill (8 minutes)",
        items: [
          { title: "Start", detail: "Contractor Bills → pick a Draft bill (e.g. CB-2026-0006)." },
          { title: "Act", detail: "Upload a document, Verify, then Submit to finance. Sign in as finance@finance.com, Approve, then Pay Bill (milestone + amount + retention + reference)." },
          { title: "Verify", detail: "The bill reaches Paid with the payment recorded, and the requester is notified in-app." },
        ],
      },
      {
        type: "steps",
        title: "Scenario C — bank an invoice (8 minutes)",
        items: [
          { title: "Start", detail: "Invoices → INV-2026-0004 (Approved) as finance@finance.com." },
          { title: "Act", detail: "Record Payment with a cheque reference — the cheque lands in the register — then Mark Banked with the deposit reference." },
          { title: "Verify", detail: "The invoice is Banked, the internal receipt downloads, and the dashboard KPIs reflect the new collection." },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Reset between sessions",
        text: "After training sessions, run php artisan migrate:fresh --seed --force to restore every record — the scenarios above all work again from a clean slate.",
      },
    ],
  },
];

export default function DemoDataPage() {
  const { t } = useTranslation();
  // Translate the demo-data reference at render so language switches cover
  // every section, table and training step.
  const sectionsT = demoDataSections.map((section) => ({
    ...section,
    title: t(section.title),
    summary: t(section.summary),
    blocks: section.blocks.map((block) => ({
      ...block,
      title: block.title ? t(block.title) : block.title,
      text: block.text ? t(block.text) : block.text,
      head: block.head ? block.head.map((h) => t(h)) : block.head,
      rows: block.rows ? block.rows.map((row) => row.map((cell) => t(cell))) : block.rows,
      items: block.items
        ? block.items.map((item) =>
            typeof item === "string" ? t(item) : { title: t(item.title), detail: t(item.detail) }
          )
        : block.items,
    })),
  }));
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
              {t("Demo Data Reference")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Exactly what the seed produces — the people, companies and records behind every demo and training scenario
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sectionsT.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} id={section.id} className="scroll-mt-20">
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
                  {section.blocks.map((block, i) => {
                    if (block.type === "table") {
                      return <DocTable key={i} title={block.title} head={block.head} rows={block.rows} />;
                    }
                    if (block.type === "steps") {
                      return (
                        <div key={i} className="space-y-2">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{block.title}</p>
                          <ol className="space-y-2.5">
                            {block.items.map((item, j) => (
                              <li key={j} className="flex gap-3">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-semibold flex items-center justify-center mt-0.5">
                                  {j + 1}
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
                    if (block.type === "callout") {
                      return (
                        <div key={i} className="rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-3.5 flex gap-3">
                          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-foreground">{block.title}</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{block.text}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Users className="w-4.5 h-4.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Accounts and credentials</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  The five demo accounts (Super Admin, Admin, Procurement, Finance, Viewer) are listed with their roles in the Setup guide. Passwords are provided by your administrator.
                </p>
              </div>
            </div>
            <Link
              href="/help/docs/setup"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors shrink-0"
            >
              Setup Guide
            </Link>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
