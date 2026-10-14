"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";
import { usePermission } from "@/hooks/usePermission";
import {
  ArrowLeft,
  Database,
  KeyRound,
  Link2,
  Info,
  Layers,
  ShieldAlert,
  Hash,
  Table2,
  Lock,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// Database map — the complete MySQL schema behind ProcureX.
// Legend: PK primary key · FK foreign key · U unique ·
//         enum fixed value list · SD soft deletes
// ─────────────────────────────────────────────────────────────

const legend = [
  { badge: "PK", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", label: "Primary key" },
  { badge: "FK", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", label: "Foreign key" },
  { badge: "U", cls: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400", label: "Unique" },
  { badge: "enum", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", label: "Fixed value list" },
  { badge: "SD", cls: "bg-muted text-muted-foreground", label: "Soft deletes (deleted_at)" },
];

function Col({ name, flags, note }) {
  const badgeCls = (f) =>
    f === "PK" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
    : f === "FK" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
    : f === "U" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400"
    : f === "enum" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
    : "bg-muted text-muted-foreground";
  return (
    <div className="flex items-baseline gap-1.5 py-[3px]">
      <code className="text-[10px] font-mono text-foreground">{name}</code>
      {flags.map((f) => (
        <span key={f} className={`px-1 rounded text-[8px] font-semibold ${badgeCls(f)}`}>{f}</span>
      ))}
      {note && <span className="text-[9px] text-muted-foreground/70 italic">{note}</span>}
    </div>
  );
}

function TableCard({ name, title, note, columns, badges }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
        <Table2 className="w-3 h-3 text-primary shrink-0" />
        <code className="text-[11px] font-mono font-semibold text-foreground">{name}</code>
        <div className="flex gap-1 ml-auto">
          {badges?.map((b) => (
            <span key={b} className="px-1 rounded bg-muted text-muted-foreground text-[8px] font-semibold">{b}</span>
          ))}
        </div>
      </div>
      <div className="px-3 py-1.5 divide-y divide-border/50">
        {columns.map((c) => (
          <Col key={c[0]} name={c[0]} flags={c[1]} note={c[2]} />
        ))}
      </div>
      {note && <p className="px-3 py-2 border-t border-border text-[10px] text-muted-foreground leading-relaxed">{note}</p>}
    </div>
  );
}

// ── ER diagram geometry ───────────────────────────────────────
const NODE_W = 168;
const NODE_H = 34;

const nodes = [
  // Master data
  { id: "customers", x: 24, y: 16, label: "customers" },
  { id: "tenders", x: 24, y: 150, label: "tenders" },
  { id: "contractors", x: 232, y: 150, label: "contractors" },
  { id: "users", x: 1004, y: 150, label: "users" },
  // Delivery
  { id: "project_jobs", x: 24, y: 300, label: "project_jobs" },
  { id: "contractor_quotations", x: 232, y: 300, label: "contractor_quotations" },
  // Money out
  { id: "purchase_orders", x: 24, y: 450, label: "purchase_orders" },
  { id: "po_status", x: 232, y: 450, label: "purchase_order_status_histories" },
  { id: "contractor_bills", x: 440, y: 450, label: "contractor_bills" },
  { id: "bill_docs", x: 648, y: 450, label: "contractor_bill_documents" },
  { id: "bill_payments", x: 648, y: 560, label: "contractor_bill_payments" },
  // Money in
  { id: "invoices", x: 440, y: 690, label: "invoices" },
  { id: "invoice_payments", x: 648, y: 690, label: "invoice_payments" },
  { id: "cheques", x: 648, y: 800, label: "cheque_transactions" },
  { id: "tax_invoices", x: 440, y: 800, label: "tax_invoices" },
  { id: "invoice_docs", x: 856, y: 690, label: "invoice_documents" },
  { id: "invoice_history", x: 856, y: 800, label: "invoice_status_history" },
  // Platform
  { id: "audit_logs", x: 856, y: 940, label: "audit_logs" },
  { id: "notifications", x: 1064, y: 690, label: "notifications" },
  { id: "support_tickets", x: 1064, y: 800, label: "support_tickets" },
];

const edges = [
  { from: "customers", to: "tenders", label: "customer_id" },
  { from: "tenders", to: "project_jobs", label: "tender_id" },
  { from: "customers", to: "project_jobs", label: "customer_id" },
  { from: "project_jobs", to: "contractor_quotations", label: "job_id" },
  { from: "contractors", to: "contractor_quotations", label: "contractor_id" },
  { from: "contractors", to: "project_jobs", label: "selected_contractor_id" },
  { from: "tenders", to: "purchase_orders", label: "tender_id" },
  { from: "project_jobs", to: "purchase_orders", label: "job_id" },
  { from: "purchase_orders", to: "po_status", label: "purchase_order_id" },
  { from: "project_jobs", to: "contractor_bills", label: "job_id" },
  { from: "purchase_orders", to: "contractor_bills", label: "po_id" },
  { from: "contractors", to: "contractor_bills", label: "contractor_id" },
  { from: "contractor_bills", to: "bill_docs", label: "contractor_bill_id" },
  { from: "contractor_bills", to: "bill_payments", label: "contractor_bill_id" },
  { from: "purchase_orders", to: "invoices", label: "po_id" },
  { from: "customers", to: "invoices", label: "customer_id" },
  { from: "invoices", to: "invoice_payments", label: "invoice_id" },
  { from: "invoices", to: "cheques", label: "invoice_id" },
  { from: "invoices", to: "tax_invoices", label: "invoice_id" },
  { from: "invoices", to: "invoice_docs", label: "invoice_id" },
  { from: "invoices", to: "invoice_history", label: "invoice_id" },
];

const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));

function anchor(node, side) {
  if (side === "right") return { x: node.x + NODE_W, y: node.y + NODE_H / 2 };
  if (side === "left") return { x: node.x, y: node.y + NODE_H / 2 };
  if (side === "bottom") return { x: node.x + NODE_W / 2, y: node.y + NODE_H };
  return { x: node.x + NODE_W / 2, y: node.y };
}

function edgePath(edge) {
  const a = nodeById[edge.from];
  const b = nodeById[edge.to];
  const dy = b.y - a.y;
  // same row -> horizontal
  if (Math.abs(dy) < 10) {
    const sideA = a.x <= b.x ? "right" : "left";
    const sideB = a.x <= b.x ? "left" : "right";
    const p1 = anchor(a, sideA);
    const p2 = anchor(b, sideB);
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
  }
  // different rows -> orthogonal elbow
  const p1 = anchor(a, b.y > a.y ? "bottom" : "top");
  const p2 = anchor(b, b.y > a.y ? "top" : "bottom");
  const midY = (p1.y + p2.y) / 2;
  const cx1 = a.x + NODE_W / 2;
  const cx2 = b.x + NODE_W / 2;
  return `M ${p1.x} ${p1.y} L ${p1.x} ${midY} L ${p2.x} ${midY} L ${p2.x} ${p2.y}`;
}

function edgeLabelPos(edge) {
  const a = nodeById[edge.from];
  const b = nodeById[edge.to];
  const dy = b.y - a.y;
  if (Math.abs(dy) < 10) {
    const left = a.x <= b.x ? a : b;
    return { x: left.x + NODE_W + 4, y: left.y + NODE_H / 2 - 4 };
  }
  return { x: Math.min(a.x, b.x) + 6, y: (a.y + b.y) / 2 + 6 };
}

export default function DatabaseMapPage() {
  const { t } = useTranslation();
  // Note: table names, column names and other technical identifiers stay
  // in English by design — only the prose around the schema is translated.
  // Developer documentation is restricted to the admin tier (Super Admin,
  // Admin) and development-team accounts holding an admin permission.
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
              The database map is available to Super Admins, Admins and the development team only. If you need it for
              integration work, ask an administrator.
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
              Developer Documentation
            </div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">{t("Database Map")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("The complete MySQL schema — every table, column, key and relationship behind the tender-to-cash system")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/help/docs/dev"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Developer Docs
            </Link>
            <Link
              href="/help/docs"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              Library
            </Link>
          </div>
        </div>

        {/* Legend + summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{t("Legend")}</span>
              {legend.map((l) => (
                <span key={l.badge} className="inline-flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${l.cls}`}>{l.badge}</span>
                  <span className="text-[10px] text-muted-foreground">{l.label}</span>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The schema is built from one <code className="text-[10px] font-mono">create_*</code> migration per table — there are no
              alter migrations, so the map below is always the full picture. 25 tables across five domains: master data, delivery,
              money out, money in, and platform.
            </p>
          </CardContent>
        </Card>

        {/* ER diagram */}
        <Card>
          <CardContent className="p-3 sm:p-5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {t("Entity relationship diagram")}
            </p>
            <div className="rounded-lg border border-border bg-muted/20 overflow-x-auto">
              <svg viewBox="0 0 1300 1000" className="min-w-[900px] w-full" style={{ height: "auto" }} role="img" aria-label={t("Entity relationship diagram")}>
                <defs>
                  <marker id="fkArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" />
                  </marker>
                  <marker id="oneArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(217 91% 60%)" />
                  </marker>
                </defs>

                {/* Domain bands */}
                <g>
                  <rect x="12" y="4" width="420" height="272" rx="10" fill="hsl(217 91% 60% / 0.045)" stroke="hsl(var(--border))" strokeDasharray="4 4" />
                  <text x="22" y="20" className="fill-muted-foreground" style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>MASTER DATA & DELIVERY</text>
                  <rect x="12" y="434" width="820" height="192" rx="10" fill="hsl(38 92% 50% / 0.05)" stroke="hsl(var(--border))" strokeDasharray="4 4" />
                  <text x="22" y="450" className="fill-muted-foreground" style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>MONEY OUT — PURCHASE ORDERS & CONTRACTOR BILLS</text>
                  <rect x="428" y="674" width="620" height="188" rx="10" fill="hsl(160 84% 39% / 0.05)" stroke="hsl(var(--border))" strokeDasharray="4 4" />
                  <text x="438" y="690" className="fill-muted-foreground" style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>MONEY IN — INVOICES & PAYMENTS</text>
                </g>

                {/* Edges */}
                <g>
                  {edges.map((e) => {
                    const path = edgePath(e);
                    const pos = edgeLabelPos(e);
                    return (
                      <g key={`${e.from}-${e.to}-${e.label}`}>
                        <path d={path} fill="none" stroke="hsl(217 91% 60% / 0.55)" strokeWidth="1.2" markerEnd="url(#fkArrow)" />
                        <text x={pos.x} y={pos.y} className="fill-muted-foreground" style={{ fontSize: 8, fontFamily: "monospace" }}>{e.label}</text>
                      </g>
                    );
                  })}
                </g>

                {/* Nodes */}
                <g>
                  {nodes.map((n) => (
                    <g key={n.id}>
                      <rect
                        x={n.x}
                        y={n.y}
                        width={NODE_W}
                        height={NODE_H}
                        rx="6"
                        fill="hsl(var(--card))"
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                      />
                      <text
                        x={n.x + NODE_W / 2}
                        y={n.y + NODE_H / 2 + 3.5}
                        textAnchor="middle"
                        className="fill-foreground"
                        style={{ fontSize: 9.5, fontFamily: "monospace", fontWeight: 600 }}
                      >
                        {n.label.length > 26 ? n.label.slice(0, 25) + "…" : n.label}
                      </text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-2">
              Arrows point from the parent table to the child that holds the foreign key, labelled with the column name.
              Relations to <code className="font-mono">users</code> are omitted for readability — they are listed per table below.
            </p>
          </CardContent>
        </Card>

        {/* Cascade summary */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-primary" />
              {t("Delete cascade rules")}
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">When this row is deleted</th>
                    <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Cascade (delete children) / Null (keep, detach)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["customer", "cascade → tenders, jobs, POs, invoices · nullOnDelete → none"],
                    ["contractor", "cascade → quotations, bills · nullOnDelete → none"],
                    ["tender", "cascade → jobs, POs"],
                    ["project job", "cascade → quotations, bills, POs (nullOnDelete on POs)"],
                    ["purchase order", "cascade → status histories · nullOnDelete → bills"],
                    ["contractor bill", "cascade → documents, payments"],
                    ["invoice", "cascade → payments, cheques, tax invoice, documents, history"],
                    ["user", "cascade → quotations, notification prefs, tickets · nullOnDelete → bills & invoice workflow actors (records kept)"],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="px-3 py-2 align-top text-[11px] font-medium text-foreground">{k}</td>
                      <td className="px-3 py-2 align-top text-[11px] text-muted-foreground leading-relaxed">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Soft deletes (SD) apply to customers, contractors, tenders, project jobs and users — deleted records stay in the
              database with a <code className="font-mono">deleted_at</code> stamp and are excluded from queries.
            </p>
          </CardContent>
        </Card>

        {/* Table reference */}
        <div className="space-y-4 pt-2 border-t border-border/50">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-primary" />
            {t("Table Reference")}
          </h2>

          {/* Master data */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3 h-3" /> Master data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              <TableCard
                name="customers"
                badges={["SD"]}
                columns={[
                  ["id", ["PK"]],
                  ["name", []],
                  ["email", []],
                  ["phone", []],
                  ["billing_address", [], "required"],
                  ["tax_number", []],
                  ["contact_person", []],
                  ["created_at / updated_at", []],
                ]}
              />
              <TableCard
                name="contractors"
                badges={["SD"]}
                columns={[
                  ["id", ["PK"]],
                  ["contractor_code", ["U"], "auto-generated"],
                  ["name", []],
                  ["contact_person / email / phone", []],
                  ["address / contact", []],
                  ["tax_id", []],
                  ["bank_name", [], "required for payments"],
                  ["bank_account_number / bank_details", []],
                  ["status", [], "Active · Blacklisted"],
                  ["rating", [], "1–5"],
                  ["notes", []],
                ]}
              />
              <TableCard
                name="tenders"
                badges={["SD"]}
                columns={[
                  ["id", ["PK"]],
                  ["tender_number", ["U"]],
                  ["name", []],
                  ["description / notes", []],
                  ["customer_id", ["FK"]],
                  ["budget", [], "decimal 15,2"],
                  ["awarded_amount", ["0"]],
                  ["start_date / end_date", []],
                  ["status", [], "Open · In Progress · Awarded · Closed"],
                ]}
              />
            </div>
          </div>

          {/* Delivery */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Link2 className="w-3 h-3" /> Delivery
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              <TableCard
                name="project_jobs"
                badges={["SD"]}
                note="The customer is auto-linked from the tender on creation. contractor_quote_amount / _date and selected_contractor_id are written the moment a bid is selected."
                columns={[
                  ["id", ["PK"]],
                  ["tender_id", ["FK"]],
                  ["customer_id", ["FK"]],
                  ["name", []],
                  ["project_value", [], "decimal 15,2"],
                  ["description", []],
                  ["selected_contractor_id", ["FK"], "null while Pending"],
                  ["contractor_quote_amount", []],
                  ["contractor_quote_date", []],
                  ["work_start_date / work_completion_date", []],
                  ["status", [], "Pending · In Progress · Completed"],
                  ["completed_at", []],
                ]}
              />
              <TableCard
                name="contractor_quotations"
                note="exactly 3 bids per job in the seeded dataset"
                columns={[
                  ["id", ["PK"]],
                  ["job_id", ["FK"], "cascade"],
                  ["contractor_id", ["FK"], "cascade"],
                  ["quotation_amount", [], "decimal 15,2"],
                  ["quotation_date", []],
                  ["estimated_days", []],
                  ["work_scope / notes", []],
                  ["status", [], "Submitted · Selected · Rejected"],
                  ["entered_by", ["FK"], "users"],
                ]}
              />
            </div>
          </div>

          {/* Money out */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <KeyRound className="w-3 h-3" /> Money out
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              <TableCard
                name="purchase_orders"
                note="Status is a server-enforced state machine — invalid transitions are rejected with 422."
                columns={[
                  ["id", ["PK"]],
                  ["po_number", ["U"]],
                  ["job_id", ["FK"], "nullOnDelete"],
                  ["tender_id", ["FK"], "cascade"],
                  ["customer_id", ["FK"], "vendor link"],
                  ["po_amount", [], "decimal 15,2"],
                  ["po_date", []],
                  ["po_description", []],
                  ["billing_address", []],
                  ["status", ["enum"], "Draft · Approved · Sent · Received · Cancelled"],
                ]}
              />
              <TableCard
                name="purchase_order_status_histories"
                note="Every lifecycle move with the change note — the PO audit trail."
                columns={[
                  ["id", ["PK"]],
                  ["purchase_order_id", ["FK"], "cascade"],
                  ["old_status", []],
                  ["new_status", []],
                  ["changed_by", ["FK"], "users"],
                  ["reason", []],
                  ["metadata", [], "json"],
                  ["created_at", []],
                ]}
              />
              <TableCard
                name="contractor_bills"
                note="Verification requires at least one row in contractor_bill_documents. document_path is the legacy single-PDF field."
                columns={[
                  ["id", ["PK"]],
                  ["job_id", ["FK"], "cascade"],
                  ["po_id", ["FK"], "nullOnDelete"],
                  ["contractor_id", ["FK"], "cascade"],
                  ["bill_number", ["U"]],
                  ["amount / bill_date", []],
                  ["document_path", [], "legacy"],
                  ["status", ["enum"], "Draft · Uploaded · Verified · Submitted · Approved · Paid · Rejected"],
                  ["verified_by / verified_at", []],
                  ["submitted_by / submitted_at", []],
                  ["approved_by / approved_at", []],
                  ["rejected_by / rejected_at", []],
                  ["rejection_reason", []],
                  ["paid_at / payment_amount", []],
                  ["payment_reference / bank_name", []],
                  ["notes", []],
                ]}
              />
              <TableCard
                name="contractor_bill_documents"
                columns={[
                  ["id", ["PK"]],
                  ["contractor_bill_id", ["FK"], "cascade"],
                  ["document_type", [], "bill · certificate · photos"],
                  ["file_name / file_path", []],
                  ["file_size / mime_type", []],
                  ["uploaded_by", ["FK"], "users"],
                  ["description", []],
                ]}
              />
              <TableCard
                name="contractor_bill_payments"
                note="Partial payments and retention — one bill can have many installments until it is fully Paid."
                columns={[
                  ["id", ["PK"]],
                  ["contractor_bill_id", ["FK"], "cascade"],
                  ["amount", [], "decimal 15,2"],
                  ["retention_amount", [], "default 0.00"],
                  ["milestone_name", []],
                  ["payment_method", [], "Bank Transfer · Cheque"],
                  ["payment_reference / bank_name", []],
                  ["payment_date", []],
                  ["recorded_by", ["FK"], "users"],
                  ["notes", []],
                ]}
              />
            </div>
          </div>

          {/* Money in */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Hash className="w-3 h-3" /> Money in
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              <TableCard
                name="invoices"
                note="The create wizard selects tender and job to filter the PO dropdown, but those ids are not stored on the row — the tender and job are reached through po_id."
                columns={[
                  ["id", ["PK"]],
                  ["po_id", ["FK"], "cascade"],
                  ["customer_id", ["FK"], "cascade"],
                  ["invoice_number", ["U"]],
                  ["invoice_amount", [], "decimal 15,2"],
                  ["invoice_date", []],
                  ["billing_address", []],
                  ["customer_po_number / customer_po_description", []],
                  ["status", ["enum"], "Draft · Tax Generated · Submitted · Approved · Rejected · Payment Received · Banked · Paid"],
                  ["payment_reference / payment_method", []],
                  ["payment_amount / payment_received_date", []],
                  ["cheque_number / bank_name", []],
                  ["receipt_number", ["U"], "internal receipt"],
                  ["is_banked / banked_at / bank_reference", []],
                  ["submitted / approved / rejected + _by + _at", []],
                  ["rejection_reason / payment_notes", []],
                  ["recorded_by", ["FK"], "users"],
                ]}
              />
              <TableCard
                name="invoice_payments"
                note="Milestone installments — recording one generates the internal receipt and registers cheques."
                columns={[
                  ["id", ["PK"]],
                  ["invoice_id", ["FK"], "cascade"],
                  ["amount", [], "decimal 15,2"],
                  ["retention_amount", [], "default 0.00"],
                  ["milestone_name", []],
                  ["payment_method", [], "Cheque · Bank Transfer · Cash"],
                  ["cheque_number / bank_name", []],
                  ["receipt_number", ["U"]],
                  ["payment_date", []],
                  ["recorded_by", ["FK"], "users"],
                  ["notes", []],
                ]}
              />
              <TableCard
                name="cheque_transactions"
                note="Created automatically when an invoice payment is recorded by cheque — the clearing/bounce registry."
                columns={[
                  ["id", ["PK"]],
                  ["invoice_id", ["FK"], "cascade"],
                  ["payer_name / payer_account_number", []],
                  ["payer_bank_name / branch / code", []],
                  ["cheque_number", []],
                  ["cheque_date / amount / amount_in_words", []],
                  ["payee_name", []],
                  ["signature_path", []],
                  ["status", ["enum"], "Pending · Cleared · Bounced"],
                ]}
              />
              <TableCard
                name="tax_invoices"
                note="Generated from a Draft invoice — locked=true freezes the VAT schedule."
                columns={[
                  ["id", ["PK"]],
                  ["invoice_id", ["FK"], "cascade"],
                  ["tax_invoice_number", ["U"]],
                  ["tax_percentage", [], "e.g. 18.00"],
                  ["tax_amount", [], "decimal 15,2"],
                  ["total_amount", [], "decimal 15,2"],
                  ["locked", [], "default false"],
                ]}
              />
              <TableCard
                name="invoice_documents"
                columns={[
                  ["id", ["PK"]],
                  ["invoice_id", ["FK"], "cascade"],
                  ["document_type", [], "signed form · customer PO…"],
                  ["file_name / file_path", []],
                  ["file_size / mime_type", []],
                  ["uploaded_by", ["FK"], "users"],
                  ["description", []],
                ]}
              />
              <TableCard
                name="invoice_status_history"
                note="The invoice audit trail — every transition with its reason."
                columns={[
                  ["id", ["PK"]],
                  ["invoice_id", ["FK"], "cascade"],
                  ["old_status / new_status", []],
                  ["changed_by", ["FK"], "users"],
                  ["reason", []],
                  ["metadata", [], "json"],
                  ["created_at", []],
                ]}
              />
            </div>
          </div>

          {/* Platform & auth */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" /> Platform & access
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              <TableCard
                name="users"
                badges={["SD"]}
                note="login_attempts + lockout_until implement failed-login lockout; two_factor_enabled gates the login challenge."
                columns={[
                  ["id", ["PK"]],
                  ["name / email", ["U"]],
                  ["password / remember_token", []],
                  ["avatar_path / profile fields", []],
                  ["login_attempts", [], "default 0"],
                  ["lockout_until", []],
                  ["two_factor_enabled", [], "default false"],
                  ["email_verified_at", []],
                  ["profile_updated_at / _by", []],
                  ["created_at / updated_at", []],
                ]}
              />
              <TableCard
                name="roles · permissions"
                note="Spatie permission package. model_has_roles / model_has_permissions / role_has_permissions are the pivot tables linking users to roles and roles to permissions."
                columns={[
                  ["roles: id · name · guard_name", ["U"], "name+guard"],
                  ["permissions: id · name · guard_name", ["U"], "name+guard"],
                  ["role_has_permissions: role_id + permission_id", ["PK", "FK"]],
                  ["model_has_roles: role_id + model_type + model_id", ["PK"]],
                  ["model_has_permissions: permission_id + model_type + model_id", ["PK"]],
                ]}
              />
              <TableCard
                name="sessions · password_reset_tokens · personal_access_tokens"
                note="Standard Laravel auth tables — database-backed sessions are why a full re-seed signs everyone out."
                columns={[
                  ["sessions: id (PK) · user_id · ip · payload", []],
                  ["password_reset_tokens: email (PK) · token", []],
                  ["personal_access_tokens: id · tokenable · name · token", ["U"]],
                ]}
              />
              <TableCard
                name="notifications · notification_preferences"
                note="Laravel's polymorphic notifications channel per user; preferences hold the email/browser toggles (critical is forced on)."
                columns={[
                  ["notifications: id (uuid PK) · type · notifiable", []],
                  ["notifications: data (json) · read_at", []],
                  ["notification_preferences: user_id (FK, U)", []],
                  ["email_alerts / browser_alerts / critical_alerts", [], "booleans"],
                ]}
              />
              <TableCard
                name="audit_logs"
                note="Action, actor and entity — polymorphic target with entity_type + entity_id."
                columns={[
                  ["id", ["PK"]],
                  ["user_id", ["FK"], "nullOnDelete"],
                  ["action", []],
                  ["entity_type / entity_id", [], "morph target"],
                  ["timestamp", [], "useCurrent"],
                ]}
              />
              <TableCard
                name="support_tickets"
                note="Help Center tickets — ticket numbers are TKT-YYYY-####, generated in model boot."
                columns={[
                  ["id", ["PK"]],
                  ["ticket_number", ["U"]],
                  ["user_id", ["FK"], "cascade"],
                  ["category / priority / subject", []],
                  ["description", []],
                  ["status", [], "Open · In Progress · Resolved · Closed"],
                  ["resolved_at", []],
                ]}
              />
              <TableCard
                name="login_activities"
                columns={[
                  ["id", ["PK"]],
                  ["user_id", ["FK"], "cascade"],
                  ["ip_address / user_agent", []],
                  ["device / platform / browser", []],
                  ["status", [], "success · failed"],
                  ["created_at", []],
                ]}
              />
              <TableCard
                name="documents · finance_submissions"
                note="Generic polymorphic document store (job/invoice/bill/PO) and the finance submission bundles."
                columns={[
                  ["documents: id · related_entity_type + _id", []],
                  ["documents: file_path · uploaded_by", []],
                  ["finance_submissions: id · submission_type", []],
                  ["finance_submissions: document_ids (json)", []],
                  ["finance_submissions: submitted_by · approved_by", []],
                  ["status", ["enum"], "Pending · Approved · Rejected"],
                ]}
              />
              <TableCard
                name="system_settings"
                note="Key/value store — maintenance mode lives here (type: string|boolean|integer|json)."
                columns={[
                  ["id", ["PK"]],
                  ["key", ["U"]],
                  ["value", [], "text"],
                  ["type", [], "default string"],
                ]}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted shrink-0">
              <Info className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Schema truth lives in the migrations</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                One create_* migration per table, no alter migrations. To verify a column after a change:{" "}
                <code className="text-[10px] font-mono">php artisan migrate:fresh --seed</code> rebuilds everything from these
                files. Model fillable lists mirror these names — see the Data Dictionary for the field-level documentation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
