"use client";

import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";
import { usePermission } from "@/hooks/usePermission";
import {
  ArrowLeft,
  Users,
  Eye,
  Briefcase,
  Landmark,
  ShieldCheck,
  Crown,
  Cpu,
  ArrowRight,
  Info,
  ListChecks,
  CheckCircle2,
  Lock,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// Use cases — the complete catalogue by actor.
// ─────────────────────────────────────────────────────────────

const actors = [
  {
    id: "viewer",
    name: "Viewer",
    icon: Eye,
    cls: "bg-muted text-muted-foreground",
    goal: "Read-only insight into billing and the ledger",
    cases: [
      { id: "UC-V01", name: "View invoice ledger", pre: "Signed in", flow: "Open Invoices → filter/search the ledger → open an invoice detail to read the roadmap, amounts and documents.", post: "No state changes — the role holds view-invoice only." },
      { id: "UC-V02", name: "View dashboard (if enabled)", pre: "Signed in", flow: "Read KPI cards and charts.", post: "No state changes." },
    ],
  },
  {
    id: "procurement",
    name: "Procurement",
    icon: Briefcase,
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    goal: "Run the tender-to-award pipeline and money-out preparation",
    cases: [
      { id: "UC-P01", name: "Manage customer master data", pre: "manage-customers", flow: "Customers → Add/Edit → fill details → Save.", post: "Customer selectable across tenders, jobs and invoices." },
      { id: "UC-P02", name: "Manage contractor master data", pre: "manage-contractors", flow: "Contractors → Add → company, contact, tax ID, bank details, status, rating → Save.", post: "Contractor selectable for bids and bills." },
      { id: "UC-P03", name: "Create a tender", pre: "manage-tenders", flow: "Tenders → New Tender → number, customer, name, budget, dates, scope → Save as Open.", post: "Tender appears in the pipeline." },
      { id: "UC-P04", name: "Award a tender", pre: "manage-tenders", flow: "Edit tender → status Awarded → enter awarded amount → Save → Download award letter PDF.", post: "Award letter available; job creation enabled." },
      { id: "UC-P05", name: "Create a project job", pre: "manage-jobs", flow: "Jobs → New Job → pick tender (customer auto-links) → name, value, scope, dates → Save as Pending.", post: "Job open for bidding." },
      { id: "UC-P06", name: "Enter contractor quotations", pre: "enter-quotations, job is Pending", flow: "Job detail → Add bid → contractor, amount, date, duration, scope → repeat for 3+ contractors.", post: "Bid comparison table populated." },
      { id: "UC-P07", name: "Award a job (select winning bid)", pre: "select-contractor, ≥1 bid exists", flow: "Job detail → Select on the winning bid → confirm.", post: "Bid Selected, others Rejected, job In Progress, award letter available." },
      { id: "UC-P08", name: "Issue a purchase order", pre: "manage-pos", flow: "Purchase Orders → New PO → number, job, tender, vendor, amount, date, address → Save as Draft → walk Draft → Approved → Sent → Received.", post: "PO in register with audit history; PDF available." },
      { id: "UC-P09", name: "Create and submit a contractor bill", pre: "submit-contractor-bill", flow: "Contractor Bills → New Bill → job, PO, contractor, amount, date → upload document → Verify → Submit.", post: "Bill awaits finance approval; finance notified." },
      { id: "UC-P10", name: "Create an invoice and generate the tax invoice", pre: "create-invoice", flow: "Invoices → Create Invoice → tender → job → PO → number, amount, dates, address → Tax Invoice tab → Generate.", post: "Invoice at Tax Generated, VAT schedule locked." },
      { id: "UC-P11", name: "Submit invoice to finance", pre: "submit-invoice", flow: "Invoice detail → Submit to finance.", post: "Invoice Submitted; finance notified." },
      { id: "UC-P12", name: "Export registers", pre: "manage-jobs", flow: "Jobs / POs / Invoices → Export CSV (filters apply).", post: "CSV downloaded." },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    icon: Landmark,
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    goal: "Approve, pay and bank — with full audit visibility",
    cases: [
      { id: "UC-F01", name: "Approve a contractor bill", pre: "approve-contractor-payment, bill Submitted", flow: "Contractor Bills → open bill → Approve.", post: "Bill Approved; Pay Bill enabled." },
      { id: "UC-F02", name: "Reject a contractor bill", pre: "approve-contractor-payment", flow: "Open Submitted/Approved bill → Reject → enter mandatory reason → confirm.", post: "Bill returns to Draft; creator notified." },
      { id: "UC-F03", name: "Record a contractor bill payment", pre: "mark-contractor-paid, bill Approved", flow: "Open bill → Pay Bill → milestone, amount, retention, reference, bank, date → record.", post: "Payment stored; bill Paid when settled." },
      { id: "UC-F04", name: "Approve an invoice", pre: "approve-payment, invoice Submitted", flow: "Invoice detail → Approve.", post: "Invoice Approved; Record Payment enabled." },
      { id: "UC-F05", name: "Reject an invoice", pre: "reject-invoice", flow: "Invoice detail → Reject → mandatory reason → confirm.", post: "Approval data cleared; invoice Draft for the creator." },
      { id: "UC-F06", name: "Record an invoice payment", pre: "record-payment, invoice Approved", flow: "Invoice detail → Record Payment → milestone, amount, retention, cheque/ref, bank, date → record.", post: "Invoice Payment Received; receipt generated; cheque registered if applicable." },
      { id: "UC-F07", name: "Mark an invoice banked", pre: "mark-banked", flow: "Invoice detail → Mark Banked → deposit reference + cleared date → confirm.", post: "Invoice Banked — terminal money-in state." },
      { id: "UC-F08", name: "Review the audit trail", pre: "view-audit-trail", flow: "PO detail or Invoice audit tab → read status history.", post: "No state changes." },
    ],
  },
  {
    id: "admin",
    name: "Admin",
    icon: ShieldCheck,
    cls: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
    goal: "Everything operational, plus users and roles",
    cases: [
      { id: "UC-A01", name: "Manage users", pre: "manage-users", flow: "Admin → Users → assign role / deactivate / reactivate / permanently delete.", post: "Access updated immediately across UI and API." },
      { id: "UC-A02", name: "Manage roles and permissions", pre: "manage-roles", flow: "Admin → Roles → create/update/delete roles → manage the permission catalogue.", post: "Role changes apply everywhere via RBAC." },
      { id: "UC-A03", name: "Review audit logs", pre: "manage-users", flow: "Admin → Audit Logs → filter by module, action, user or date.", post: "No state changes." },
      { id: "UC-A04", name: "All operational use cases", pre: "Admin holds all day-to-day permissions", flow: "Everything Procurement and Finance can do, plus master data and administration.", post: "—" },
    ],
  },
  {
    id: "superadmin",
    name: "Super Admin",
    icon: Crown,
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    goal: "Everything, plus the platform itself",
    cases: [
      { id: "UC-S01", name: "Toggle maintenance mode", pre: "manage-system", flow: "Settings → System → maintenance mode on/off.", post: "Writes blocked for non-super-admins; banner shown app-wide." },
      { id: "UC-S02", name: "Monitor system telemetry", pre: "manage-system", flow: "System Logs → read server load, DB latency, memory, active sessions and the log stream.", post: "No state changes." },
      { id: "UC-S03", name: "All use cases", pre: "Super Admin holds every permission", flow: "Everything every other actor can do.", post: "—" },
    ],
  },
  {
    id: "system",
    name: "System (automated)",
    icon: Cpu,
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    goal: "Reactions triggered by every workflow transition",
    cases: [
      { id: "UC-X01", name: "Generate ticket numbers", pre: "A support ticket is submitted", flow: "Assign TKT-YYYY-#### sequentially in the model boot hook.", post: "Ticket stored as Open." },
      { id: "UC-X02", name: "Write workflow actors and history", pre: "Any status change", flow: "Stamp submitted_by/approved_by/recorded_by with timestamps; append rows to PO and invoice status history.", post: "Audit trail complete." },
      { id: "UC-X03", name: "Notify the next actor", pre: "Any workflow transition", flow: "Create an in-app notification for the next actor's role group.", post: "Bell badge increments; polled every 30s." },
      { id: "UC-X04", name: "Generate receipts and register cheques", pre: "Payment recorded", flow: "Generate the internal receipt number; register cheque details when the method is Cheque.", post: "Receipt downloadable; cheque in the register." },
      { id: "UC-X05", name: "Generate contractor codes", pre: "A contractor is created", flow: "Assign the auto contractor_code in the model boot hook.", post: "Contractor stored with a unique code." },
    ],
  },
];

function UseCaseCard({ uc, actorCls }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <code className="text-[10px] font-mono font-semibold text-primary">{uc.id}</code>
        <h5 className="text-xs font-medium text-foreground">{uc.name}</h5>
      </div>
      <dl className="mt-1.5 space-y-1">
        <div className="flex gap-1.5">
          <dt className="text-[10px] font-medium text-muted-foreground shrink-0 w-[68px]">Trigger</dt>
          <dd className="text-[10px] text-muted-foreground leading-relaxed">{uc.pre}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-[10px] font-medium text-muted-foreground shrink-0 w-[68px]">Main flow</dt>
          <dd className="text-[10px] text-muted-foreground leading-relaxed">{uc.flow}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-[10px] font-medium text-muted-foreground shrink-0 w-[68px]">Outcome</dt>
          <dd className="text-[10px] text-muted-foreground leading-relaxed">{uc.post}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function UseCasesPage() {
  const { t } = useTranslation();
  // Translate the catalogue at render so language switches cover every
  // actor, goal, use case, trigger, flow and outcome.
  const actorsT = actors.map((actor) => ({
    ...actor,
    name: t(actor.name),
    goal: t(actor.goal),
    cases: actor.cases.map((uc) => ({
      ...uc,
      name: t(uc.name),
      pre: t(uc.pre),
      flow: t(uc.flow),
      post: t(uc.post),
    })),
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
              The use-case catalogue is available to Super Admins, Admins and the development team only. If you need it for
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
            <h1 className="text-base font-semibold tracking-tight text-foreground">Use Cases</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every actor, every use case — trigger, main flow and outcome, including the automated system reactions
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
              href="/help/docs/dev/database-map"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              Database Map
            </Link>
          </div>
        </div>

        {/* Actor overview map */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              Actor map — who drives the system
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {actorsT.map((actor) => {
                const Icon = actor.icon;
                return (
                  <div key={actor.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-md ${actor.cls}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <h3 className="text-xs font-semibold text-foreground">{actor.name}</h3>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{actor.goal}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {actor.cases.length} use case{actor.cases.length === 1 ? "" : "s"}:{" "}
                      <span className="font-mono">{actor.cases.map((c) => c.id).join(" · ")}</span>
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="rounded-lg border border-dashed border-border p-3 flex gap-2.5">
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Permissions map one-to-one onto these use cases: if an actor&apos;s role lacks the permission named in a use case,
                neither the button nor the endpoint is available. The System actor represents backend automation — no human
                triggers it; it reacts to state changes the others cause.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Catalogue */}
        <div className="space-y-4 pt-2 border-t border-border/50">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <ListChecks className="w-3.5 h-3.5 text-primary" />
            Use Case Catalogue
          </h2>

          {actorsT.map((actor) => {
            const Icon = actor.icon;
            return (
              <Card key={actor.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                    <span className={`p-2 rounded-lg shrink-0 ${actor.cls}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{actor.name}</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{actor.goal}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {actor.cases.map((uc) => (
                      <UseCaseCard key={uc.id} uc={uc} actorCls={actor.cls} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Coverage note */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-5 text-primary" />
              Coverage cross-check
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                ["Tenders", "UC-P03, UC-P04"],
                ["Jobs & awards", "UC-P05, UC-P06, UC-P07"],
                ["Purchase orders", "UC-P08"],
                ["Contractor bills", "UC-P09, UC-F01, UC-F02, UC-F03"],
                ["Invoices", "UC-P10, UC-P11, UC-F04, UC-F05, UC-F06, UC-F07"],
                ["Master data", "UC-P01, UC-P02"],
                ["Notifications", "UC-X03"],
                ["Support tickets", "UC-X01"],
                ["Access & audit", "UC-A01, UC-A02, UC-A03, UC-F08"],
                ["Platform", "UC-S01, UC-S02"],
              ].map(([area, ids]) => (
                <div key={area} className="rounded-lg border border-border px-2.5 py-1.5">
                  <p className="text-[10px] font-medium text-foreground">{area}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">{ids}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Every workflow stage has at least one human use case and one system reaction. The flowcharts page draws the
              same journeys as diagrams.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
