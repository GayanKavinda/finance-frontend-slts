"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  Link2,
  Info,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// Data dictionary — every entity, field and status value,
// mirroring the backend model definitions.
// ─────────────────────────────────────────────────────────────

const dictSections = [
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    title: "Customer",
    summary: "Client master data. Referenced by tenders, jobs, purchase orders and invoices.",
    blocks: [
      {
        type: "fields",
        title: "Fields",
        rows: [
          { name: "name", req: true, type: "string", desc: "Customer / client company name" },
          { name: "email", type: "string", desc: "Accounts or billing contact email" },
          { name: "phone", type: "string", desc: "Contact number" },
          { name: "billing_address", type: "text", desc: "Address used on invoices and tax invoices" },
          { name: "tax_number", type: "string", desc: "Customer tax identification number" },
          { name: "contact_person", type: "string", desc: "Named contact at the customer" },
        ],
      },
      { type: "text", text: "Relations: has many tenders, jobs, purchase orders and invoices." },
    ],
  },
  {
    id: "contractors",
    label: "Contractors",
    icon: Building2,
    title: "Contractor",
    summary: "Vendor master data. Submits bids on jobs and is paid through the bill workflow.",
    blocks: [
      {
        type: "fields",
        title: "Fields",
        rows: [
          { name: "name", req: true, type: "string", desc: "Company / trading name" },
          { name: "contact_person", type: "string", desc: "Named contact" },
          { name: "email / phone", type: "string", desc: "Contact channels" },
          { name: "address", type: "text", desc: "Registered or site address" },
          { name: "tax_id", type: "string", desc: "Contractor tax identification number" },
          { name: "bank_name", type: "string", desc: "Bank the contractor is paid through" },
          { name: "bank_account_number / bank_details", type: "string", desc: "Payment account details" },
          { name: "status", req: true, type: "enum", desc: "Active or Blacklisted — blacklisted cannot be selected for new bills or jobs" },
          { name: "rating", type: "integer 1–5", desc: "Manual vendor performance rating" },
          { name: "notes", type: "text", desc: "Internal notes" },
        ],
      },
      { type: "text", text: "Relations: has many quotations, contractor bills and jobs (as selected contractor)." },
    ],
  },
  {
    id: "tenders",
    label: "Tenders",
    icon: Gavel,
    title: "Tender",
    summary: "The bid opportunity pipeline. Feeds jobs and is referenced by POs and invoices.",
    blocks: [
      {
        type: "fields",
        title: "Fields",
        rows: [
          { name: "tender_number", req: true, type: "string", desc: "Unique tender reference, e.g. TDR-FTTH-2026" },
          { name: "name", req: true, type: "string", desc: "Short name of the tender" },
          { name: "description", type: "text", desc: "Scope description / project terms" },
          { name: "customer_id", type: "FK → customers", desc: "The customer the tender belongs to" },
          { name: "budget", type: "decimal", desc: "Estimated / budgetary cost" },
          { name: "awarded_amount", type: "decimal", desc: "Value actually won — greater than zero unlocks the award letter" },
          { name: "start_date / end_date", type: "date", desc: "Tender or project window" },
          { name: "status", req: true, type: "enum", desc: "Open · In Progress · Awarded · Closed" },
          { name: "notes", type: "text", desc: "Internal notes" },
        ],
      },
      {
        type: "status",
        title: "Status values",
        rows: [
          ["Open", "Bid opportunity not yet won or lost"],
          ["In Progress", "Being worked on"],
          ["Awarded", "Won — award letter available"],
          ["Closed", "Fully billed and completed"],
        ],
      },
    ],
  },
  {
    id: "jobs",
    label: "Jobs",
    icon: Briefcase,
    title: "Project Job",
    summary: "The unit of delivery. Links the tender to the bidding contractors, PO, bills and invoice.",
    blocks: [
      {
        type: "fields",
        title: "Fields",
        rows: [
          { name: "tender_id", req: true, type: "FK → tenders", desc: "The tender this job belongs to" },
          { name: "customer_id", type: "FK → customers", desc: "Auto-linked from the tender" },
          { name: "name", req: true, type: "string", desc: "Job name" },
          { name: "project_value", type: "decimal", desc: "Contract value for the job" },
          { name: "description", type: "text", desc: "Scope description" },
          { name: "status", req: true, type: "enum", desc: "Pending · In Progress · Completed" },
          { name: "selected_contractor_id", type: "FK → contractors", desc: "Winning contractor — set when a bid is selected" },
          { name: "contractor_quote_amount", type: "decimal", desc: "Winning quoted amount — set on award" },
          { name: "contractor_quote_date", type: "date", desc: "Date of the winning quotation" },
          { name: "work_start_date / work_completion_date", type: "date", desc: "Planned execution window" },
        ],
      },
      { type: "text", text: "Relations: one tender, one customer, many quotations, many POs, many contractor bills, many invoices." },
    ],
  },
  {
    id: "quotations",
    label: "Quotations",
    icon: FileSignature,
    title: "Contractor Quotation",
    summary: "A bid submitted by a contractor for a job, compared in the bid table.",
    blocks: [
      {
        type: "fields",
        title: "Fields",
        rows: [
          { name: "job_id", req: true, type: "FK → project_jobs", desc: "The job being bid on" },
          { name: "contractor_id", req: true, type: "FK → contractors", desc: "The bidding contractor" },
          { name: "quotation_amount", req: true, type: "decimal", desc: "Quoted amount in LKR" },
          { name: "quotation_date", req: true, type: "date", desc: "Date of the quotation" },
          { name: "estimated_days", type: "integer", desc: "Estimated days to complete" },
          { name: "work_scope", type: "text", desc: "Work scope / notes for the bid" },
          { name: "status", req: true, type: "enum", desc: "Submitted · Selected · Rejected" },
          { name: "entered_by", type: "FK → users", desc: "Who entered the bid" },
        ],
      },
      {
        type: "status",
        title: "Status values",
        rows: [
          ["Submitted", "Bid recorded, awaiting decision"],
          ["Selected", "Winning bid — the job is awarded"],
          ["Rejected", "Losing bid — set automatically for all others when a winner is selected"],
        ],
      },
    ],
  },
  {
    id: "purchase-orders",
    label: "Purchase Orders",
    icon: ClipboardList,
    title: "Purchase Order",
    summary: "The order document issued against a job, with a server-enforced status machine and audit trail.",
    blocks: [
      {
        type: "fields",
        title: "Fields",
        rows: [
          { name: "po_number", req: true, type: "string", desc: "Unique PO reference, e.g. PO-2026-0042" },
          { name: "job_id", req: true, type: "FK → project_jobs", desc: "The job the PO belongs to" },
          { name: "tender_id", req: true, type: "FK → tenders", desc: "The tender the job belongs to" },
          { name: "customer_id", type: "FK → customers", desc: "The vendor (stored as the customer link on the PO)" },
          { name: "po_amount", type: "decimal", desc: "Order value" },
          { name: "po_date", req: true, type: "date", desc: "Order date" },
          { name: "po_description", type: "text", desc: "Scope / description" },
          { name: "billing_address", req: true, type: "text", desc: "Billing / delivery address" },
          { name: "status", req: true, type: "enum", desc: "Draft · Approved · Sent · Received · Cancelled" },
        ],
      },
      {
        type: "status",
        title: "Status values (in order)",
        rows: [
          ["Draft", "Created, not yet approved"],
          ["Approved", "Reviewed and passed"],
          ["Sent", "Issued to the vendor"],
          ["Received", "Goods/services received"],
          ["Cancelled", "Withdrawn at any point"],
        ],
      },
    ],
  },
  {
    id: "contractor-bills",
    label: "Contractor Bills",
    icon: Receipt,
    title: "Contractor Bill & Payments",
    summary: "Money-out records with their milestone payments, documents and workflow fields.",
    blocks: [
      {
        type: "fields",
        title: "Bill fields",
        rows: [
          { name: "bill_number", req: true, type: "string", desc: "Bill reference, e.g. CB-2026-0006" },
          { name: "job_id", req: true, type: "FK → project_jobs", desc: "The job being billed for" },
          { name: "po_id", type: "FK → purchase_orders", desc: "The PO the bill sits against" },
          { name: "contractor_id", type: "FK → contractors", desc: "The billing contractor" },
          { name: "amount", req: true, type: "decimal", desc: "Bill value" },
          { name: "bill_date", req: true, type: "date", desc: "Bill date" },
          { name: "document_path", type: "string", desc: "The supporting document — verification requires at least one" },
          { name: "status", req: true, type: "enum", desc: "Draft · Verified · Submitted · Approved · Paid · Rejected" },
          { name: "verified_by / verified_at", type: "FK / timestamp", desc: "Verification record" },
          { name: "submitted_by / submitted_at", type: "FK / timestamp", desc: "Submission record" },
          { name: "approved_by / approved_at", type: "FK / timestamp", desc: "Approval record" },
          { name: "paid_at", type: "timestamp", desc: "When the bill was fully paid" },
          { name: "rejected_by / rejection_reason", type: "FK / text", desc: "Who rejected and why" },
        ],
      },
      {
        type: "fields",
        title: "Bill payment fields",
        rows: [
          { name: "contractor_bill_id", req: true, type: "FK → contractor_bills", desc: "The bill being paid" },
          { name: "amount", req: true, type: "decimal", desc: "Amount paid in this instalment" },
          { name: "retention_amount", type: "decimal", desc: "Retention held back" },
          { name: "milestone_name", type: "string", desc: "Which milestone the payment covers" },
          { name: "payment_method", type: "string", desc: "Payment channel" },
          { name: "payment_reference", type: "string", desc: "Bank / transaction reference" },
          { name: "bank_name", type: "string", desc: "Paying bank" },
          { name: "payment_date", type: "date", desc: "Payment date" },
          { name: "recorded_by", type: "FK → users", desc: "Who recorded the payment" },
        ],
      },
    ],
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: FileSpreadsheet,
    title: "Invoice",
    summary: "Money-in records with tax invoice, payment and banking fields.",
    blocks: [
      {
        type: "fields",
        title: "Fields",
        rows: [
          { name: "tender_id / job_id", type: "FK → tenders / project_jobs", desc: "What is being billed" },
          { name: "po_id", type: "FK → purchase_orders", desc: "Related purchase order" },
          { name: "customer_id", type: "FK → customers", desc: "The customer being invoiced" },
          { name: "invoice_number", req: true, type: "string", desc: "Invoice reference, e.g. INV-2026-0003" },
          { name: "invoice_amount", req: true, type: "decimal", desc: "Invoice value" },
          { name: "invoice_date", type: "date", desc: "Billing date" },
          { name: "billing_address", type: "text", desc: "Customer billing address" },
          { name: "customer_po_number", type: "string", desc: "The customer's own PO reference" },
          { name: "customer_po_description", type: "text", desc: "Invoice details / terms" },
          { name: "status", req: true, type: "enum", desc: "Draft · Tax Generated · Submitted · Approved · Payment Received · Banked" },
          { name: "payment_amount / payment_reference / payment_method", type: "decimal / string", desc: "Recorded payment details" },
          { name: "bank_name / paid_at", type: "string / timestamp", desc: "Bank and payment timestamp" },
          { name: "retention_amount / banked_at / bank_reference", type: "decimal / timestamp / string", desc: "Retention and banking details" },
          { name: "submitted_by · approved_by · rejected_by + timestamps", type: "FK / timestamp", desc: "Workflow actor records" },
        ],
      },
      {
        type: "status",
        title: "Status values (in order)",
        rows: [
          ["Draft", "Being prepared"],
          ["Tax Generated", "Statutory tax invoice generated — VAT schedule locked"],
          ["Submitted", "With finance for approval"],
          ["Approved", "Approved by finance"],
          ["Payment Received", "A payment has been recorded"],
          ["Banked", "Funds landed in the account — terminal state"],
        ],
      },
    ],
  },
  {
    id: "cheques",
    label: "Cheque Register",
    icon: Landmark,
    title: "Cheque Transaction",
    summary: "Cheques received against invoices, registered automatically when a cheque payment is recorded.",
    blocks: [
      {
        type: "fields",
        title: "Fields",
        rows: [
          { name: "invoice_id", type: "FK → invoices", desc: "The invoice the cheque pays" },
          { name: "payer_name / payer_account_number", type: "string", desc: "Drawer details" },
          { name: "payer_bank_name / payer_bank_branch / payer_bank_code", type: "string", desc: "Drawer bank details" },
          { name: "cheque_number", req: true, type: "string", desc: "Cheque number" },
          { name: "cheque_date", type: "date", desc: "Cheque date" },
          { name: "amount", req: true, type: "decimal", desc: "Cheque value" },
          { name: "amount_in_words", type: "string", desc: "Amount written out (for the printed record)" },
          { name: "payee_name", type: "string", desc: "Who the cheque is payable to" },
          { name: "signature_path", type: "string", desc: "Signed document on file" },
          { name: "status", req: true, type: "enum", desc: "Pending · Cleared · Bounced" },
        ],
      },
    ],
  },
  {
    id: "relations",
    label: "How It Links",
    icon: Link2,
    title: "Entity Relationship Map",
    summary:
      "How the records connect from tender to banked payment — the same chain the UI walks you through.",
    blocks: [
      {
        type: "table",
        title: "The chain",
        head: ["Record", "Belongs to", "Has many"],
        rows: [
          ["Tender", "Customer", "Jobs, POs, invoices"],
          ["Project job", "Tender + Customer", "Quotations, POs, bills, invoices"],
          ["Contractor quotation", "Job + Contractor", "—"],
          ["Purchase order", "Job + Tender + Customer (vendor)", "Invoices"],
          ["Contractor bill", "Job + PO + Contractor", "Bill payments, documents"],
          ["Bill payment", "Contractor bill", "—"],
          ["Invoice", "Tender + Job + PO + Customer", "Cheques, documents, audit entries"],
          ["Cheque", "Invoice", "—"],
          ["User", "Role(s)", "Quotations, bills, approvals, tickets"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Referential integrity in the UI",
        text: "Because jobs link tenders and invoices link POs, the creation wizards filter their dropdowns — pick a tender and only its jobs appear; pick a job and only its POs appear. That is the relationship map reflected in the interface.",
      },
    ],
  },
];

// ── Render helpers ────────────────────────────────────────────

function FieldsTable({ block }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{block.title}</p>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Field</th>
              <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Type</th>
              <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {block.rows.map((row) => (
              <tr key={row.name}>
                <td className="px-3 py-2 align-top w-2/5">
                  <code className="text-[10px] font-mono font-medium text-foreground">{row.name}</code>
                  {row.req && <span className="ml-1.5 text-[9px] font-medium text-destructive uppercase">required</span>}
                </td>
                <td className="px-3 py-2 align-top text-[10px] text-muted-foreground font-mono whitespace-nowrap">{row.type}</td>
                <td className="px-3 py-2 align-top text-[11px] text-muted-foreground leading-relaxed">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusTable({ block }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{block.title}</p>
      <div className="flex flex-wrap gap-2">
        {block.rows.map(([status, desc]) => (
          <div key={status} className="rounded-lg border border-border p-2.5 bg-card min-w-[200px] flex-1">
            <span className="inline-block px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">{status}</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextNote({ block }) {
  return (
    <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
      <Link2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
      {block.text}
    </p>
  );
}

function Callout({ block }) {
  return (
    <div className="rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-3.5 flex gap-3">
      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-medium text-foreground">{block.title}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{block.text}</p>
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
    case "fields": return <FieldsTable block={block} />;
    case "status": return <StatusTable block={block} />;
    case "text": return <TextNote block={block} />;
    case "table": return <DataTable block={block} />;
    case "callout": return <Callout block={block} />;
    default: return null;
  }
}

export default function DataDictionaryPage() {
  const [activeId, setActiveId] = useState(dictSections[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const updateActive = () => {
      let current = dictSections[0].id;
      for (const section of dictSections) {
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
            <h1 className="text-base font-semibold tracking-tight text-foreground">{t("Data Dictionary")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every entity, field and status value in the system, and how the records relate
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
                Entities
              </p>
              <nav className="space-y-0.5">
                {dictSections.map((section) => {
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
              {dictSections.map((section) => {
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
            {dictSections.map((section) => {
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
                  <Database className="w-4.5 h-4.5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Field names mirror the backend models</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                    The names shown here match the Laravel model fillable fields, so they are the same keys you see in the API Reference. Workflow behaviour for each field is documented in the System Walkthrough Guide.
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
