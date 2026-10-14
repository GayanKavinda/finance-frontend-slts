"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";
import { usePermission } from "@/hooks/usePermission";
import {
  ArrowLeft,
  Workflow,
  GitBranch,
  Info,
  ArrowDown,
  CornerDownRight,
  RotateCcw,
  CircleDot,
  Ban,
  Bell,
  ShieldCheck,
  LogIn,
  Lock,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// Flowcharts — every workflow as a diagram.
// Node types: start, action, decision, system, end, note
// ─────────────────────────────────────────────────────────────

const nodeStyles = {
  start: "rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  end: "rounded-full bg-foreground text-background",
  action: "rounded-lg border border-border bg-card text-foreground",
  decision: "rounded-lg border-2 border-amber-400/70 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
  system: "rounded-lg border border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300",
  note: "rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground italic",
};

function Node({ node }) {
  const cls = nodeStyles[node.type] || nodeStyles.action;
  return (
    <div className={`px-3 py-1.5 text-[11px] font-medium text-center max-w-[280px] ${cls}`}>
      {node.label}
      {node.detail && (
        <span className="block text-[9px] font-normal opacity-80 mt-0.5">{node.detail}</span>
      )}
    </div>
  );
}

function Connector({ label, loop }) {
  return (
    <div className="flex flex-col items-center py-0.5">
      <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
      {loop ? (
        <RotateCcw className="w-3 h-3 text-amber-500" />
      ) : (
        <ArrowDown className="w-3 h-3 text-muted-foreground" />
      )}
    </div>
  );
}

function BranchRow({ branch }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex items-center gap-1 pt-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
        <CornerDownRight className="w-3 h-3" />
        {branch.label}
      </div>
      <div className="flex flex-col items-center">
        {branch.steps.map((n, i) => (
          <div key={i} className="flex flex-col items-center">
            {i > 0 && <Connector />}
            <Node node={n} />
          </div>
        ))}
      </div>
    </div>
  );
}

// A flowchart is an array of items:
//   { t: "node", node } | { t: "label", text, loop? } | { t: "branches", branches: [{label, steps}] }
function Flowchart({ steps }) {
  return (
    <div className="flex flex-col items-center py-2">
      {steps.map((item, i) => {
        if (item.t === "label") {
          return (
            <div key={i} className="flex flex-col items-center">
              {item.loop && <RotateCcw className="w-3.5 h-3.5 text-amber-500 mb-0.5" />}
              <Connector label={item.text} loop={item.loop} />
            </div>
          );
        }
        if (item.t === "branches") {
          return (
            <div key={i} className="flex flex-col items-center">
              <Connector />
              <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5">
                {item.branches.map((b, j) => (
                  <BranchRow key={j} branch={b} />
                ))}
              </div>
            </div>
          );
        }
        return (
          <div key={i} className="flex flex-col items-center">
            {i > 0 && <Connector />}
            <Node node={item.node} />
          </div>
        );
      })}
    </div>
  );
}

function FlowCard({ id, icon: Icon, title, summary, steps, footer }) {
  return (
    <Card id={id} className="scroll-mt-20">
      <CardContent className="p-4 space-y-1">
        <div className="flex items-start gap-3 pb-3 border-b border-border/50">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{summary}</p>
          </div>
        </div>
        <Flowchart steps={steps} />
        {footer && (
          <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/50 pt-2 mt-1">{footer}</p>
        )}
      </CardContent>
    </Card>
  );
}

const flowcharts = [
  {
    id: "flow-master",
    icon: Workflow,
    title: "1. Tender-to-cash — the master flow",
    summary: "The complete journey from a bid opportunity to money in the bank, with the actor who owns each stage.",
    steps: [
      { t: "node", node: { type: "start", label: "Customer tender identified", detail: "Procurement" } },
      { t: "label", text: "register" },
      { t: "node", node: { type: "action", label: "Tender created — status Open" } },
      { t: "label", text: "won" },
      { t: "node", node: { type: "action", label: "Tender Awarded → award letter PDF" } },
      { t: "label", text: "deliver" },
      { t: "node", node: { type: "action", label: "Project job — status Pending" } },
      { t: "node", node: { type: "action", label: "Contractor bids collected (3+)" } },
      { t: "label", text: "decide" },
      { t: "node", node: { type: "decision", label: "Select winning bid", detail: "others auto-Rejected" } },
      { t: "label", text: "awarded" },
      { t: "node", node: { type: "action", label: "Job In Progress → award letter PDF" } },
      { t: "label", text: "order" },
      { t: "node", node: { type: "action", label: "PO: Draft → Approved → Sent → Received" } },
      { t: "label", text: "money out" },
      { t: "node", node: { type: "action", label: "Contractor bills: Draft → Verified → Submitted → Approved → Paid", detail: "document required before Verify" } },
      { t: "label", text: "money in" },
      { t: "node", node: { type: "action", label: "Invoice: Draft → Tax Generated → Submitted → Approved" } },
      { t: "label", text: "collected" },
      { t: "node", node: { type: "action", label: "Record Payment → Payment Received", detail: "receipt + cheque register" } },
      { t: "label", text: "banked" },
      { t: "node", node: { type: "end", label: "Invoice Banked — cycle complete" } },
    ],
    footer: "Every transition notifies the next actor's role group in-app and writes audit history. Rejected items loop back — see flowcharts 4 and 5.",
  },
  {
    id: "flow-bidding",
    icon: GitBranch,
    title: "2. Bidding & job award",
    summary: "How a Pending job becomes an awarded job, including the guardrails around bid selection.",
    steps: [
      { t: "node", node: { type: "start", label: "Job exists — status Pending", detail: "no contractor attached" } },
      { t: "label", text: "bids" },
      { t: "node", node: { type: "action", label: "Add bid: contractor · amount · date · duration · scope" } },
      { t: "label", text: "repeat for 3+ contractors" },
      { t: "node", node: { type: "action", label: "Bid comparison table rendered" } },
      { t: "label", text: "decide" },
      { t: "node", node: { type: "decision", label: "Select a winning bid?" } },
      { t: "branches", branches: [
        { label: "Yes", steps: [
          { type: "action", label: "Confirm the award dialog" },
          { type: "system", label: "System: bid → Selected · rivals → Rejected" },
          { type: "system", label: "System: job → In Progress + quote data written" },
          { type: "system", label: "System: procurement notified" },
          { type: "end", label: "Award Letter PDF available · panel read-only" },
        ] },
        { label: "Not yet", steps: [
          { type: "note", label: "Stay Pending — keep collecting bids" },
          { type: "note", label: "Next Steps card recommends 3 bids minimum" },
        ] },
      ] },
    ],
    footer: "Guardrails: bidding is only possible while the job is Pending; the Add button disappears on award; the bid history stays visible for comparison and audit.",
  },
  {
    id: "flow-po",
    icon: GitBranch,
    title: "3. Purchase order state machine",
    summary: "The server-enforced PO lifecycle — every legal move, every rejection, every cancel path.",
    steps: [
      { t: "node", node: { type: "start", label: "New PO saved", detail: "status Draft" } },
      { t: "label", text: "edit + change note" },
      { t: "node", node: { type: "decision", label: "Next valid status?" } },
      { t: "branches", branches: [
        { label: "Draft", steps: [{ type: "action", label: "→ Approved" }] },
        { label: "Approved", steps: [{ type: "action", label: "→ Sent" }] },
        { label: "Sent", steps: [{ type: "action", label: "→ Received" }] },
        { label: "Any state", steps: [{ type: "action", label: "→ Cancelled" }] },
      ] },
      { t: "label", text: "invalid move" },
      { t: "branches", branches: [
        { label: "Skipped step", steps: [{ type: "note", label: "422 rejected — e.g. Draft → Sent is not allowed" }] },
        { label: "Legal move", steps: [
          { type: "system", label: "ROW written to purchase_order_status_histories" },
          { type: "system", label: "Actor + change note + timestamp recorded" },
        ] },
      ] },
      { t: "label", text: "end states" },
      { t: "node", node: { type: "end", label: "Received or Cancelled — no further edits to status" } },
    ],
    footer: "Every PO row also exposes the PDF download, and the audit trail (view-audit-trail permission — Admin and Finance) reads the same history table.",
  },
  {
    id: "flow-bill",
    icon: GitBranch,
    title: "4. Contractor bill workflow (money out)",
    summary: "Draft to Paid with the reject loop and the document gate.",
    steps: [
      { t: "node", node: { type: "start", label: "Bill created — status Draft", detail: "Procurement" } },
      { t: "label", text: "attach" },
      { t: "node", node: { type: "decision", label: "At least one supporting document?" } },
      { t: "branches", branches: [
        { label: "No", steps: [{ type: "note", label: "Verify blocked — upload the bill, certificate or photo" }] },
        { label: "Yes", steps: [
          { type: "action", label: "Verify → status Verified", detail: "procurement notified" },
          { type: "action", label: "Submit → status Submitted", detail: "finance notified" },
        ] },
      ] },
      { t: "label", text: "finance decides" },
      { t: "node", node: { type: "decision", label: "Approve?" } },
      { t: "branches", branches: [
        { label: "Approve", steps: [
          { type: "action", label: "Status Approved" },
          { type: "action", label: "Pay Bill: milestone · amount · retention · bank · ref · date", detail: "Finance" },
        ] },
        { label: "Reject", steps: [
          { type: "action", label: "Mandatory reason recorded" },
          { type: "system", label: "Status → Draft · creator notified" },
          { type: "note", label: "Correct and resubmit — loop back to Verify" },
        ] },
      ] },
      { t: "label", text: "settled" },
      { t: "node", node: { type: "system", label: "Partial payments supported — retention held back" } },
      { t: "label", text: "fully paid" },
      { t: "node", node: { type: "end", label: "Paid — terminal status" } },
    ],
  },
  {
    id: "flow-invoice",
    icon: GitBranch,
    title: "5. Invoice lifecycle (money in)",
    summary: "Draft to Banked, including the tax invoice generation, the reject loop and cheque registration.",
    steps: [
      { t: "node", node: { type: "start", label: "Invoice created — status Draft", detail: "wizard: tender → job → PO" } },
      { t: "label", text: "statutory" },
      { t: "node", node: { type: "action", label: "Generate Tax Invoice → Tax Generated", detail: "18% VAT schedule locked" } },
      { t: "label", text: "to finance" },
      { t: "node", node: { type: "action", label: "Submit → Submitted", detail: "finance notified" } },
      { t: "label", text: "finance decides" },
      { t: "node", node: { type: "decision", label: "Approve?" } },
      { t: "branches", branches: [
        { label: "Approve", steps: [{ type: "action", label: "Status Approved — Record Payment enabled" }] },
        { label: "Reject", steps: [
          { type: "action", label: "Mandatory reason recorded" },
          { type: "system", label: "Approval data cleared · status → Draft" },
          { type: "note", label: "Creator corrects and resubmits — loop" },
        ] },
      ] },
      { t: "label", text: "payment" },
      { t: "node", node: { type: "action", label: "Record Payment: milestone · amount · retention · cheque/ref · bank · date" } },
      { t: "label", text: "system reactions" },
      { t: "node", node: { type: "system", label: "Status → Payment Received · internal receipt generated" } },
      { t: "node", node: { type: "system", label: "If Cheque → registered in the cheque register" } },
      { t: "label", text: "funds land" },
      { t: "node", node: { type: "action", label: "Mark Banked: deposit reference · cleared date" } },
      { t: "node", node: { type: "end", label: "Banked — terminal money-in state" } },
    ],
  },
  {
    id: "flow-notifications",
    icon: Bell,
    title: "6. Notification & approval chain",
    summary: "Who gets told what, when — the chain that keeps records moving.",
    steps: [
      { t: "node", node: { type: "action", label: "Any status change on a job · bill · invoice" } },
      { t: "label", text: "system" },
      { t: "node", node: { type: "system", label: "Notification created for the next actor's role group" } },
      { t: "label", text: "delivered" },
      { t: "node", node: { type: "action", label: "Bell badge increments — polled every 30 seconds" } },
      { t: "label", text: "user" },
      { t: "node", node: { type: "decision", label: "Open the bell or the Notifications page" } },
      { t: "branches", branches: [
        { label: "Act", steps: [
          { type: "action", label: "Navigate to the linked record" },
          { type: "action", label: "Perform the next workflow action" },
          { type: "system", label: "Next notification cycle begins" },
        ] },
        { label: "Read & clear", steps: [
          { type: "action", label: "Mark read / mark all read / delete" },
          { type: "note", label: "Badge and page state stay in sync instantly" },
        ] },
      ] },
    ],
    footer: "verification → procurement · bill submitted → finance · rejection → the creator · payment recorded → the invoice creator. Settings → Notifications controls email/browser delivery (critical alerts are always delivered).",
  },
  {
    id: "flow-helpdesk",
    icon: CircleDot,
    title: "7. Support ticket flow",
    summary: "How an issue travels from a user to resolution — the ticket system behind the Help Center.",
    steps: [
      { t: "node", node: { type: "start", label: "User submits a ticket", detail: "category · priority · subject · description" } },
      { t: "label", text: "system" },
      { t: "node", node: { type: "system", label: "TKT-YYYY-#### assigned · stored as Open" } },
      { t: "node", node: { type: "action", label: "Ticket appears in My Support Tickets" } },
      { t: "label", text: "IT team" },
      { t: "node", node: { type: "decision", label: "Triage" } },
      { t: "branches", branches: [
        { label: "Working", steps: [{ type: "action", label: "Status → In Progress" }] },
        { label: "Duplicate / out of scope", steps: [{ type: "action", label: "Status → Closed" }] },
      ] },
      { t: "label", text: "fixed" },
      { t: "node", node: { type: "end", label: "Resolved — resolved_at stamped" } },
    ],
  },
  {
    id: "flow-auth",
    icon: LogIn,
    title: "8. Authentication & two-factor challenge",
    summary: "The sign-in path including lockout, the 2FA challenge and session handling.",
    steps: [
      { t: "node", node: { type: "start", label: "Sign-in submitted", detail: "email + password" } },
      { t: "label", text: "check" },
      { t: "node", node: { type: "decision", label: "Credentials valid & not locked out?" } },
      { t: "branches", branches: [
        { label: "Invalid / locked", steps: [
          { type: "system", label: "login_attempts incremented · lockout after threshold" },
          { type: "system", label: "login_activities: status failed" },
          { type: "end", label: "Error toast · stay on sign-in" },
        ] },
        { label: "Valid", steps: [
          { type: "decision", label: "Two-factor enabled?" },
          { type: "note", label: "If not → session established → dashboard" },
        ] },
      ] },
      { t: "label", text: "2FA enabled" },
      { t: "node", node: { type: "system", label: "6-digit code emailed — 10-minute expiry, 5 attempts, single use" } },
      { t: "label", text: "verify" },
      { t: "node", node: { type: "decision", label: "Code correct?" } },
      { t: "branches", branches: [
        { label: "Yes", steps: [{ type: "end", label: "Session established · welcome toast" }] },
        { label: "No / expired", steps: [{ type: "action", label: "Resend code (rate-limited) · retry" }] },
      ] },
      { t: "label", text: "afterwards" },
      { t: "node", node: { type: "system", label: "Sessions are database-backed — a re-seed signs everyone out" } },
    ],
    footer: "Unauthenticated API requests return a JSON 401 (never an HTML redirect). Rate limits: login 10/min, password reset 5/min, 2FA verify 10/min, resend 3/min.",
  },
];

export default function FlowchartsPage() {
  const { t } = useTranslation();
  // Translate the walkthrough at render so language switches cover every
  // diagram title, summary, node, branch and footer.
  const walkthroughsT = flowcharts.map((flow) => ({
    ...flow,
    title: t(flow.title),
    summary: t(flow.summary),
    footer: flow.footer ? t(flow.footer) : flow.footer,
    steps: flow.steps.map((item) => {
      if (item.t === "label") return { ...item, text: t(item.text) };
      if (item.t === "branches") {
        return {
          ...item,
          branches: item.branches.map((branch) => ({
            ...branch,
            label: t(branch.label),
            steps: branch.steps.map((node) => ({
              ...node,
              label: t(node.label),
              detail: node.detail ? t(node.detail) : node.detail,
            })),
          })),
        };
      }
      return {
        ...item,
        node: {
          ...item.node,
          label: t(item.node.label),
          detail: item.node.detail ? t(item.node.detail) : item.node.detail,
        },
      };
    }),
  }));
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
              The flowcharts are available to Super Admins, Admins and the development team only. If you need them for
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
            <h1 className="text-base font-semibold tracking-tight text-foreground">Flowcharts</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every workflow as a diagram — state machines, decision points, loops and the automated system reactions
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
              href="/help/docs/dev/use-cases"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              Use Cases
            </Link>
          </div>
        </div>

        {/* Legend */}
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">How to read</span>
            {[
              { icon: CircleDot, label: "Start / end state", cls: "text-emerald-500" },
              { icon: Ban, label: "Human action", cls: "text-foreground" },
              { icon: GitBranch, label: "Decision", cls: "text-amber-500" },
              { icon: Bell, label: "System reaction", cls: "text-blue-500" },
              { icon: RotateCcw, label: "Loop back", cls: "text-amber-500" },
            ].map((l) => (
              <span key={l.label} className="inline-flex items-center gap-1.5">
                <l.icon className={`w-3.5 h-3.5 ${l.cls}`} />
                <span className="text-[10px] text-muted-foreground">{l.label}</span>
              </span>
            ))}
          </CardContent>
        </Card>

        {/* Flowcharts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {walkthroughsT.map((flow) => (
            <FlowCard key={flow.id} {...flow} />
          ))}
        </div>

        {/* Footer */}
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted shrink-0">
              <Info className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">State machines are the contract</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                The valid-transition tables in the models (Tender, ProjectJob, PurchaseOrder, ContractorBill, Invoice) are the
                source of these diagrams — if a diagram and the model ever disagree, the model wins, and the diagram is
                documentation debt.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
