"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePermission } from "@/hooks/usePermission";
import {
  ArrowLeft,
  ArrowRight,
  Server,
  KeyRound,
  Building2,
  Gavel,
  Briefcase,
  FileSignature,
  ClipboardList,
  Receipt,
  FileSpreadsheet,
  Download,
  Bell,
  SlidersHorizontal,
  Ticket as TicketIcon,
  ShieldCheck,
  AlertTriangle,
  Info,
  Lightbulb,
  Lock,
  Gauge,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// API reference — every endpoint exposed by the Laravel backend.
// ─────────────────────────────────────────────────────────────

const apiSections = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: Server,
    title: "API Overview",
    summary:
      "The ProcureX API is a Laravel REST API served under /api. Every response is JSON. Authentication uses a Sanctum session or a bearer token; the internals of the auth and security surface are documented in the restricted internal section.",
    blocks: [
      {
        type: "kv",
        title: "Base configuration",
        rows: [
          ["Base URL", "http://127.0.0.1:8000/api (the frontend proxies /api/* to the backend, so the browser always talks same-origin)"],
          ["Content type", "application/json — send and receive JSON on every endpoint"],
          ["Auth model", "Laravel Sanctum — cookie session for the web app, personal access token (Bearer) for direct API clients"],
          ["Interactive collection", "A ready-to-import Postman collection covering the full workflow ships with the repository"],
        ],
      },
      {
        type: "steps",
        title: "Making your first request",
        items: [
          { title: "Sign in to the application", detail: "Authenticate through the app (POST /api/login with email and password) — the full authentication flow, including session bootstrap, is covered in the internal security section." },
          { title: "Send the Authorization header for direct calls", detail: "For non-browser clients, attach a personal access token: Authorization: Bearer <token>." },
          { title: "Identify the caller", detail: "GET /api/user returns the authenticated user with their roles and permissions — the frontend uses this to gate UI actions." },
          { title: "Explore by module", detail: "Use the groups on this page; each workflow action also appears in the System Walkthrough Guide with its UI steps." },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Permissions are server-side truth",
        text: "Every gated endpoint re-checks permissions on the server. Consult the permission reference under Conventions to plan which roles can call which endpoints.",
      },
    ],
  },
  {
    id: "security-internal",
    label: "Security & Access",
    icon: Lock,
    title: "Authentication & Security (Internal)",
    restricted: true,
    summary:
      "The authentication and security surface — login flow, two-factor challenges, OTP password reset, session handling and rate limits. Restricted to administrators and the development team.",
    blocks: [
      {
        type: "table",
        title: "Auth endpoints",
        head: ["Method", "Endpoint", "Purpose"],
        rows: [
          ["POST", "/login", "Sign in with email + password; returns the user (or a 2FA challenge)"],
          ["POST", "/logout", "Revoke the current session"],
          ["POST", "/register", "Create a new account"],
          ["POST", "/forgot-password-otp", "Request a password reset OTP"],
          ["POST", "/verify-otp", "Verify the reset OTP"],
          ["POST", "/reset-password-otp", "Set a new password with the OTP"],
          ["POST", "/verify-2fa", "Complete the two-factor login challenge"],
          ["POST", "/resend-2fa", "Request a fresh two-factor code"],
          ["GET", "/2fa/status", "Two-factor state for the current user"],
          ["POST", "/2fa/enable", "Enable two-factor (current password required)"],
          ["POST", "/2fa/disable", "Disable two-factor (current password required)"],
        ],
      },
      {
        type: "steps",
        title: "Authentication flow (internals)",
        items: [
          { title: "Bootstrap the CSRF cookie", detail: "GET /sanctum/csrf-cookie sets the XSRF-TOKEN cookie used by all subsequent writes (the axios client does this automatically)." },
          { title: "Sign in", detail: "POST /api/login with {email, password}. On success the session is established and the user payload is returned." },
          { title: "Handle the 2FA challenge (if enabled)", detail: "When the account has two-factor enabled, login returns a challenge instead of a session. POST /api/verify-2fa with the emailed code (10-minute validity, 5 attempts, single use), or /api/resend-2fa for a fresh code." },
          { title: "Sign out", detail: "POST /api/logout revokes the session and current tokens." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Rate limits protect the auth surface",
        text: "Login is throttled (10 attempts/minute), password reset (5/minute) and two-factor verification (10/minute, resend 3/minute). Exceeding a limit returns HTTP 429 — wait and retry rather than hammering.",
      },
      {
        type: "callout",
        tone: "info",
        title: "Session behaviour",
        text: "Unauthenticated API requests return a JSON 401 (never an HTML redirect). Sessions persist in the database, so a full re-seed of the demo dataset signs everyone out. Admin and Finance roles can additionally review login activity from Settings.",
      },
    ],
  },
  {
    id: "master-data",
    label: "Master Data",
    icon: Building2,
    title: "Customers & Contractors",
    summary:
      "Full CRUD resources for the two master-data entities that feed tenders, jobs, bills and invoices.",
    blocks: [
      {
        type: "table",
        title: "Endpoints",
        head: ["Method", "Endpoint", "Purpose"],
        rows: [
          ["GET", "/customers", "List customers (supports pagination and search)"],
          ["POST", "/customers", "Create a customer — name, email, phone, billing address, tax number, contact person"],
          ["GET", "/customers/{id}", "Fetch one customer"],
          ["PUT/PATCH", "/customers/{id}", "Update a customer"],
          ["DELETE", "/customers/{id}", "Delete a customer"],
          ["GET", "/contractors", "List contractors"],
          ["POST", "/contractors", "Create a contractor — company, contact, tax ID, bank details, status, rating"],
          ["GET", "/contractors/{id}", "Fetch one contractor"],
          ["PUT/PATCH", "/contractors/{id}", "Update a contractor"],
          ["DELETE", "/contractors/{id}", "Delete a contractor"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Contractor bank details",
        text: "Bank name and account number are part of the contractor payload because bill payments (POST /contractor-bills/{id}/pay) record the paying bank and reference.",
      },
    ],
  },
  {
    id: "tenders",
    label: "Tenders",
    icon: Gavel,
    title: "Tenders",
    summary:
      "The tender pipeline resource, plus the customer award letter PDF generator.",
    blocks: [
      {
        type: "table",
        title: "Endpoints",
        head: ["Method", "Endpoint", "Purpose"],
        rows: [
          ["GET", "/tenders", "List tenders with linked jobs and customers"],
          ["POST", "/tenders", "Create a tender (status Open)"],
          ["GET", "/tenders/{id}", "Fetch one tender"],
          ["PUT/PATCH", "/tenders/{id}", "Update a tender, e.g. set status Awarded and the awarded amount"],
          ["DELETE", "/tenders/{id}", "Delete a tender"],
          ["GET", "/tenders/{id}/award-customer", "Download the tender award letter PDF (requires an awarded amount)"],
        ],
      },
      { type: "flow", title: "Tender statuses", steps: ["Open", "In Progress", "Awarded", "Closed"] },
    ],
  },
  {
    id: "jobs",
    label: "Jobs",
    icon: Briefcase,
    title: "Jobs",
    summary:
      "Project jobs plus the CSV export and the award letter PDF.",
    blocks: [
      {
        type: "table",
        title: "Endpoints",
        head: ["Method", "Endpoint", "Purpose"],
        rows: [
          ["GET", "/jobs", "List jobs (filter by status, customer, tender, search; paginated)"],
          ["POST", "/jobs", "Create a job (status Pending, customer auto-linked from the tender)"],
          ["GET", "/jobs/{id}", "Fetch one job with its linked tender, quotations and PO context"],
          ["PUT/PATCH", "/jobs/{id}", "Update a job"],
          ["DELETE", "/jobs/{id}", "Delete a job (blocked while active purchase orders exist)"],
          ["GET", "/jobs/export", "Download the filtered jobs register as CSV (permission: manage-jobs)"],
          ["GET", "/jobs/{id}/award-letter", "Download the job award letter PDF (available once a bid is selected)"],
        ],
      },
      { type: "flow", title: "Job statuses", steps: ["Pending", "In Progress", "Completed"] },
    ],
  },
  {
    id: "quotations",
    label: "Quotations",
    icon: FileSignature,
    title: "Contractor Quotations",
    summary:
      "The bidding feed and the award action that decides the winning contractor.",
    blocks: [
      {
        type: "table",
        title: "Endpoints",
        head: ["Method", "Endpoint", "Permission", "Purpose"],
        rows: [
          ["GET", "/jobs/{jobId}/quotations", "—", "Bid comparison feed for the job page"],
          ["POST", "/quotations", "enter-quotations", "Enter a contractor bid — job, contractor, amount, date, duration, work scope"],
          ["POST", "/quotations/{id}/select", "select-contractor", "Award the job — this bid becomes Selected, others Rejected, job moves to In Progress"],
        ],
      },
      { type: "flow", title: "Bid statuses", steps: ["Submitted", "Selected", "Rejected"] },
    ],
  },
  {
    id: "purchase-orders",
    label: "Purchase Orders",
    icon: ClipboardList,
    title: "Purchase Orders",
    summary:
      "The PO register resource, stats, PDF download and audit trail.",
    blocks: [
      {
        type: "table",
        title: "Endpoints",
        head: ["Method", "Endpoint", "Permission", "Purpose"],
        rows: [
          ["GET", "/purchase-orders", "—", "List purchase orders (filter by status, search; paginated)"],
          ["POST", "/purchase-orders", "—", "Issue a PO (status Draft)"],
          ["GET", "/purchase-orders/{id}", "—", "Fetch one PO with status history"],
          ["PUT/PATCH", "/purchase-orders/{id}", "—", "Update a PO, including lifecycle status moves with a change note"],
          ["DELETE", "/purchase-orders/{id}", "—", "Delete a PO"],
          ["GET", "/purchase-orders/stats", "—", "Register stats: total, committed value, counts by status"],
          ["GET", "/purchase-orders/{id}/download-pdf", "—", "Download the PO PDF"],
          ["GET", "/purchase-orders/{id}/audit-trail", "view-audit-trail", "Full PO status history"],
        ],
      },
      {
        type: "flow",
        title: "PO lifecycle (server-enforced)",
        steps: ["Draft", "Approved", "Sent", "Received"],
        note: "Cancelled is possible at any point. Out-of-order transitions are rejected with 422.",
      },
    ],
  },
  {
    id: "contractor-bills",
    label: "Contractor Bills",
    icon: Receipt,
    title: "Contractor Bills",
    summary:
      "The money-out workflow: create, attach documents, verify, submit, approve/reject and pay.",
    blocks: [
      {
        type: "table",
        title: "Endpoints",
        head: ["Method", "Endpoint", "Permission", "Purpose"],
        rows: [
          ["GET", "/contractor-bills", "submit-contractor-bill", "List contractor bills with documents and payments"],
          ["POST", "/contractor-bills", "submit-contractor-bill", "Create a bill (status Draft)"],
          ["POST", "/contractor-bills/{id}/upload-document", "submit-contractor-bill", "Attach a supporting document (multipart)"],
          ["DELETE", "/contractor-bills/documents/{id}", "submit-contractor-bill", "Remove an attached document"],
          ["POST", "/contractor-bills/{id}/verify", "verify-contractor-bill", "Draft → Verified (requires at least one document)"],
          ["POST", "/contractor-bills/{id}/submit", "submit-contractor-bill", "Verified → Submitted"],
          ["POST", "/contractor-bills/{id}/approve", "approve-contractor-payment", "Submitted → Approved"],
          ["POST", "/contractor-bills/{id}/reject", "approve-contractor-payment", "Submitted/Approved → Rejected (reason required)"],
          ["POST", "/contractor-bills/{id}/pay", "mark-contractor-paid", "Approved → Paid — milestone, amount, retention, bank, reference, date"],
        ],
      },
      {
        type: "flow",
        title: "Bill workflow (server-enforced)",
        steps: ["Draft", "Verified", "Submitted", "Approved", "Paid"],
        note: "Rejected bills return to Draft for correction and resubmission.",
      },
    ],
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: FileSpreadsheet,
    title: "Invoices, Tax Invoices & Payments",
    summary:
      "The money-in workflow: draft, statutory tax invoice, finance approval, payment recording and banking — plus analytics feeds for the dashboard.",
    blocks: [
      {
        type: "table",
        title: "Invoice lifecycle endpoints",
        head: ["Method", "Endpoint", "Permission", "Purpose"],
        rows: [
          ["GET", "/invoices", "view-invoice", "List invoices (filterable, paginated)"],
          ["POST", "/invoices", "create-invoice", "Create an invoice (status Draft)"],
          ["GET", "/invoices/{id}", "view-invoice", "Invoice detail with payments, documents and history"],
          ["PUT", "/invoices/{id}", "edit-invoice", "Edit while in Draft"],
          ["POST", "/tax-invoices", "create-invoice", "Generate the tax invoice → Tax Generated (locks the VAT schedule)"],
          ["POST", "/invoices/{id}/submit-to-finance", "submit-invoice", "→ Submitted"],
          ["POST", "/invoices/{id}/approve", "approve-payment", "→ Approved"],
          ["POST", "/invoices/{id}/reject", "reject-invoice", "Reject with a reason — approval data is cleared"],
          ["POST", "/invoices/{id}/record-payment", "record-payment", "→ Payment Received — milestone instalment with retention; cheques are registered automatically"],
          ["POST", "/invoices/{id}/mark-banked", "mark-banked", "→ Banked — deposit reference and cleared date"],
          ["POST", "/invoices/{id}/upload-document", "—", "Attach a document to the invoice"],
          ["DELETE", "/invoices/{id}/documents/{documentId}", "—", "Remove an attached document"],
          ["GET", "/invoices/{id}/audit-trail", "view-audit-trail", "Invoice status history"],
        ],
      },
      {
        type: "table",
        title: "Analytics endpoints (dashboard)",
        head: ["Method", "Endpoint", "Purpose"],
        rows: [
          ["GET", "/executive-summary", "KPI summary — invoiced, collected, outstanding, collection efficiency (aliases: /invoice-summary, /invoices/summary)"],
          ["GET", "/invoices/status-breakdown", "Counts and amounts by status"],
          ["GET", "/invoices/monthly-trend", "Month-by-month invoiced vs received"],
          ["GET", "/invoices/approval-velocity", "Approval stage timings"],
          ["GET", "/invoices/performance-metrics", "Performance metrics feed"],
        ],
      },
      {
        type: "flow",
        title: "Invoice lifecycle (server-enforced)",
        steps: ["Draft", "Tax Generated", "Submitted", "Approved", "Payment Received", "Banked"],
      },
    ],
  },
  {
    id: "pdfs",
    label: "PDFs & Files",
    icon: Download,
    title: "PDF Generation & File Endpoints",
    summary:
      "Every document the system can produce, served as a direct download.",
    blocks: [
      {
        type: "table",
        title: "Endpoints",
        head: ["Method", "Endpoint", "Returns", "Available when"],
        rows: [
          ["GET", "/invoices/{id}/pdf", "Invoice PDF", "Any invoice"],
          ["GET", "/invoices/{id}/download-receipt", "Internal receipt PDF", "A payment has been recorded (receipt number required)"],
          ["GET", "/jobs/{id}/award-letter", "Job award letter PDF", "A winning bid has been selected"],
          ["GET", "/tenders/{id}/award-customer", "Tender award letter PDF", "Tender is Awarded with an awarded amount"],
          ["GET", "/purchase-orders/{id}/download-pdf", "Purchase order PDF", "Any PO"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Direct vs proxied access",
        text: "The frontend calls these through its /api/* proxy. Direct browser downloads to :8000 also work with an authenticated session cookie.",
      },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    title: "Notifications",
    summary:
      "Per-user notification feed that drives the navbar bell and the Notifications page.",
    blocks: [
      {
        type: "table",
        title: "Endpoints",
        head: ["Method", "Endpoint", "Purpose"],
        rows: [
          ["GET", "/notifications", "Paginated notification feed for the current user"],
          ["GET", "/notifications/unread", "All unread notifications"],
          ["GET", "/notifications/unread-count", "Lightweight unread total for the navbar badge (polled every 30s)"],
          ["POST", "/notifications/read-all", "Mark every notification as read"],
          ["POST", "/notifications/{id}/read", "Mark one notification as read"],
          ["DELETE", "/notifications/{id}", "Delete a notification"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Who gets notified",
        text: "Each workflow transition notifies the next actor's role group in-app: verification notifies procurement, bill/invoice submission notifies finance, rejections notify the creator.",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings & System",
    icon: SlidersHorizontal,
    title: "Settings & System Endpoints",
    summary:
      "Per-user preferences, two-factor state and the system-wide maintenance switch.",
    blocks: [
      {
        type: "table",
        title: "Endpoints",
        head: ["Method", "Endpoint", "Permission", "Purpose"],
        rows: [
          ["GET/PUT", "/notification-preferences", "— (self)", "Read / update the caller's notification preferences (critical alerts are forced on)"],
          ["GET", "/system/maintenance-status", "—", "Maintenance mode state (drives the app-wide banner)"],
          ["PUT", "/system/maintenance-mode", "manage-system", "Toggle maintenance mode — 503-gates writes for non-super-admins"],
          ["GET", "/system/metrics", "manage-system", "Server load, DB latency, memory, active sessions"],
          ["GET", "/system/logs", "manage-system", "Application log stream"],
        ],
      },
    ],
  },
  {
    id: "support-tickets",
    label: "Support Tickets",
    icon: TicketIcon,
    title: "Support Tickets",
    summary:
      "The Help Center's ticket endpoints — submit from any role, read back your own submissions.",
    blocks: [
      {
        type: "table",
        title: "Endpoints",
        head: ["Method", "Endpoint", "Purpose"],
        rows: [
          ["GET", "/support-tickets", "Your submitted tickets, newest first (paginated)"],
          ["POST", "/support-tickets", "Submit a ticket — category, priority, subject, description; returns the assigned TKT-YYYY-#### number"],
        ],
      },
      {
        type: "table",
        title: "Valid values",
        head: ["Field", "Values"],
        rows: [
          ["category", "Account & Access · Tenders & Jobs · Purchase Orders · Contractor Bills · Invoices & Payments · Notifications · Report a Bug · Feature Request · Other"],
          ["priority", "Low · Medium · High · Critical"],
          ["status (set by the system)", "Open · In Progress · Resolved · Closed"],
        ],
      },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    icon: ShieldCheck,
    title: "Admin: Users, Roles & Audit",
    summary:
      "User and role management plus the audit trail, gated by permission server-side.",
    blocks: [
      {
        type: "table",
        title: "Endpoints",
        head: ["Method", "Endpoint", "Permission", "Purpose"],
        rows: [
          ["GET", "/admin/users", "manage-users", "User directory"],
          ["GET", "/admin/users/{id}", "manage-users", "User detail"],
          ["POST", "/admin/users/{id}/assign-role", "manage-users", "Assign a role to a user"],
          ["DELETE", "/admin/users/{id}/deactivate", "manage-users", "Deactivate a user"],
          ["POST", "/admin/users/{id}/reactivate", "manage-users", "Reactivate a deactivated user"],
          ["DELETE", "/admin/users/{id}/permanent", "manage-users", "Permanently delete a user"],
          ["GET", "/admin/roles", "manage-roles", "List roles with permissions"],
          ["POST", "/admin/roles", "manage-roles", "Create a role"],
          ["GET/PUT/DELETE", "/admin/roles/{id}", "manage-roles", "View / update / delete a role"],
          ["GET", "/admin/permissions", "manage-roles", "Permission catalogue"],
          ["POST", "/admin/permissions", "manage-roles", "Create a permission"],
          ["DELETE", "/admin/permissions/{id}", "manage-roles", "Delete a permission"],
          ["GET", "/admin/audit-logs", "manage-users", "Audit trail (filterable)"],
          ["GET", "/admin/audit-logs/meta", "manage-users", "Audit filter metadata"],
        ],
      },
    ],
  },
  {
    id: "conventions",
    label: "Conventions",
    icon: Gauge,
    title: "Status Codes, Errors & Permissions",
    summary:
      "What the API returns and how to interpret it when integrating or debugging.",
    blocks: [
      {
        type: "table",
        title: "HTTP status codes",
        head: ["Code", "Meaning"],
        rows: [
          ["200 / 201", "Success / created — the response body carries the resource or a confirmation message"],
          ["401", "Not authenticated (or session expired) — unauthenticated API requests return JSON 401, never an HTML redirect"],
          ["403", "Authenticated but missing the permission for the endpoint"],
          ["404", "Resource not found (or not visible to your role)"],
          ["422", "Validation failed — errors are keyed by field, e.g. {\"message\": \"...\", \"errors\": {\"category\": [\"...\"]}}"],
          ["429", "Rate limited — back off and retry (see the auth rate limits above)"],
          ["503", "Maintenance mode is on and the request is a write from a non-super-admin — reads stay open"],
        ],
      },
      {
        type: "table",
        title: "Permission reference (gate names)",
        head: ["Permission", "Grants access to"],
        rows: [
          ["manage-customers / manage-contractors", "Master data CRUD"],
          ["manage-tenders / manage-jobs / manage-pos", "Tender, job and PO management"],
          ["enter-quotations", "Entering contractor bids"],
          ["select-contractor", "Awarding a job (selecting the winning bid)"],
          ["submit-contractor-bill / verify-contractor-bill", "Creating, documenting and verifying bills"],
          ["approve-contractor-payment / mark-contractor-paid", "Bill approval and payment"],
          ["create-invoice / edit-invoice / submit-invoice", "Invoice drafting and submission"],
          ["approve-payment / record-payment / mark-banked / reject-invoice", "Finance decisions and banking"],
          ["view-invoice", "Invoice visibility"],
          ["view-audit-trail", "PO and invoice audit history"],
          ["manage-users / manage-roles", "User, role and permission administration"],
          ["manage-system", "Maintenance mode and system telemetry"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Permissions are server-side truth",
        text: "The UI hides actions you do not hold, but the API re-checks every gated request. Build integrations against the permission table above, not against button visibility.",
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

function MethodBadge({ method }) {
  const colors = {
    GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    POST: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    PUT: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    PATCH: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    DELETE: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  };
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide ${colors[method] || "bg-muted text-muted-foreground"}`}>
      {method}
    </span>
  );
}

function EndpointTable({ block }) {
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
                {row.map((cell, j) => {
                  const isMethod = j === 0 && ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(cell);
                  const isEndpoint = j === 1;
                  return (
                    <td key={j} className={`px-3 py-2 align-top text-[11px] leading-relaxed ${j === 0 && !isMethod ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {isMethod ? <MethodBadge method={cell} /> : null}
                      {isEndpoint ? <code className="text-[10px] font-mono text-foreground break-all">{cell}</code> : null}
                      {!isMethod && !isEndpoint ? cell : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FlowChips({ block }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{block.title}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {block.steps.map((step, i) => (
          <div key={step} className="flex items-center gap-1.5">
            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-medium whitespace-nowrap">{step}</span>
            {i < block.steps.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>
      {block.note && <p className="text-[11px] text-muted-foreground leading-relaxed">{block.note}</p>}
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
    case "table": return <EndpointTable block={block} />;
    case "flow": return <FlowChips block={block} />;
    case "callout": return <Callout block={block} />;
    case "kv": return <KVTable block={block} />;
    default: return null;
  }
}

export default function ApiDocsPage() {
  const [activeId, setActiveId] = useState(apiSections[0].id);
  const sectionRefs = useRef({});
  // Security internals are visible to Super Admin / Admin (and any
  // development-team account holding an admin permission) only.
  const isAdminTier = usePermission(["manage-users", "manage-roles", "manage-system"]);

  useEffect(() => {
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const updateActive = () => {
      let current = apiSections[0].id;
      for (const section of apiSections) {
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
              API Reference
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every endpoint of the ProcureX backend: authentication, workflow actions, analytics and administration
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
              href="/help/guides"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              Walkthrough
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
          {/* Category rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-2">
                Endpoint Groups
              </p>
              <nav className="space-y-0.5">
                {apiSections.map((section) => {
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
              {apiSections.map((section) => {
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
              {apiSections.map((section) => {
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
                              Authentication and security internals are available to Super Admins, Admins and the development team only. If you need access for integration work, ask an administrator.
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
                    <KeyRound className="w-4.5 h-4.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Need a working request example?</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      A ready-to-import Postman collection covering the full workflow ships with the repository.
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
