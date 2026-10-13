"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Workflow,
  LayoutDashboard,
  Users,
  Building2,
  Gavel,
  Briefcase,
  FileSignature,
  ClipboardList,
  Receipt,
  FileSpreadsheet,
  Bell,
  SlidersHorizontal,
  ShieldCheck,
  Download,
  LifeBuoy,
  Info,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// ─────────────────────────────────────────────────────────────
// Complete system walkthrough — every module, every step,
// every field, every status and every download in the system.
// ─────────────────────────────────────────────────────────────

const guideSections = [
  // ── 1. Overview ─────────────────────────────────────────────
  {
    id: "overview",
    label: "System Overview",
    icon: Workflow,
    title: "System Overview & End-to-End Lifecycle",
    summary:
      "ProcureX is a tender-to-cash procurement platform. It covers the full commercial lifecycle — from winning a customer tender to collecting the final payment and banking it.",
    blocks: [
      {
        type: "flow",
        title: "The tender-to-cash lifecycle",
        steps: [
          "Customer Tender",
          "Tender Awarded",
          "Project Job",
          "Contractor Bids",
          "Job Awarded",
          "Purchase Order",
          "Contractor Bills",
          "Customer Invoice",
          "Payment Received",
          "Banked",
        ],
      },
      {
        type: "steps",
        title: "The journey, stage by stage",
        items: [
          { title: "Set up master data", detail: "Create the Customers and Contractors you work with. Contractors need bank details because payments are made to them." },
          { title: "Create the tender", detail: "In Tenders, register the customer tender with its budget, dates and scope. It starts as Open." },
          { title: "Award the tender", detail: "When you win, set the status to Awarded and enter the awarded amount. The row then offers a customer award letter PDF download." },
          { title: "Create the project job", detail: "In Jobs, create the job against the tender. It starts as Pending — no contractor is attached yet." },
          { title: "Collect contractor quotations", detail: "On the job detail page, add bids from contractors. The system recommends at least 3 bids so you can compare like-for-like." },
          { title: "Award the job", detail: "Compare the bids and select the winner. The job moves to In Progress, losing bids are marked Rejected, and the award letter PDF becomes available." },
          { title: "Issue the purchase order", detail: "In Purchase Orders, raise the PO for the job and walk it through Draft → Approved → Sent → Received." },
          { title: "Process contractor bills", detail: "Create bills, attach documents, verify, submit to finance, get approval and record payments with retention and milestone tracking." },
          { title: "Invoice the customer", detail: "Create the invoice against the tender/job/PO, generate the statutory tax invoice, submit to finance for approval." },
          { title: "Collect and bank", detail: "Record the payment (bank transfer or cheque), download the internal receipt, then mark the invoice banked once funds land." },
          { title: "Monitor", detail: "Follow everything from the Dashboard, the Notifications bell and the Audit Logs." },
        ],
      },
      {
        type: "table",
        title: "Roles in the system",
        head: ["Role", "Responsible for"],
        rows: [
          ["Super Admin", "Everything, including system settings, maintenance mode and system telemetry"],
          ["Admin", "All day-to-day operations plus user and role management (no system/infrastructure access)"],
          ["Procurement", "Master data, tenders, jobs, quotations, contractor bills"],
          ["Finance", "Approvals, payment recording, banking, audit trail"],
          ["Viewer", "Read-only access to invoices"],
        ],
      },
      {
        type: "table",
        title: "Permission matrix",
        head: ["Permission", "Super Admin", "Admin", "Procurement", "Finance", "Viewer"],
        rows: [
          ["Manage customers / contractors", "✓", "✓", "✓", "—", "—"],
          ["Manage tenders / jobs / POs", "✓", "✓", "✓", "—", "—"],
          ["Enter quotations", "✓", "✓", "✓", "—", "—"],
          ["Select contractor (award job)", "✓", "✓", "✓", "—", "—"],
          ["Submit / verify contractor bills", "✓", "✓", "✓", "—", "—"],
          ["Approve / mark contractor payments", "✓", "✓", "—", "✓", "—"],
          ["Create / submit invoices", "✓", "✓", "✓", "—", "—"],
          ["Approve / record / bank invoice payments", "✓", "✓", "—", "✓", "—"],
          ["View invoices", "✓", "✓", "✓", "✓", "✓"],
          ["View audit trail", "✓", "✓", "—", "✓", "—"],
          ["Manage users / roles", "✓", "✓", "—", "—", "—"],
          ["Manage system (maintenance, telemetry)", "✓", "—", "—", "—", "—"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "How permissions show up",
        text: "Action buttons only appear when your role holds the permission, and every write endpoint is validated on the server as well. If a button is missing or an action is refused, your role does not cover that step — ask an administrator.",
      },
    ],
  },

  // ── 2. Dashboard ────────────────────────────────────────────
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    summary:
      "The landing page after sign-in. It is the executive summary of the whole operation — money in, money out and how fast things move.",
    blocks: [
      {
        type: "table",
        title: "What each panel shows",
        head: ["Panel", "What it tells you"],
        rows: [
          ["KPI cards", "Total invoiced, total collected and the outstanding balance at a glance, plus collection efficiency as a percentage"],
          ["Monthly trend", "A line chart of invoiced vs received amounts month by month, so you can see direction of travel"],
          ["Status breakdown", "How many invoices/jobs sit in each status — your work-in-progress pipeline"],
          ["Approval velocity", "How quickly invoices move through the approval stages"],
          ["Recent activity", "The latest workflow transitions across tenders, jobs, bills and invoices"],
        ],
      },
      {
        type: "steps",
        title: "How to use it",
        items: [
          { title: "Start the day here", detail: "Scan the KPI cards for the outstanding figure and collection efficiency." },
          { title: "Drill into the numbers", detail: "Every figure traces back to a module: Invoices for money-in, Contractor Bills for money-out, Jobs for pipeline." },
          { title: "Use it with filters", detail: "The trend and breakdown charts respond to the data in the system — filter the underlying pages (status, customer, date) and the dashboard follows." },
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Regional formatting is respected",
        text: "All amounts and dates on the dashboard follow your currency and date-format preferences set in Settings → Regional.",
      },
    ],
  },

  // ── 3. Customers ────────────────────────────────────────────
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    title: "Customers (Master Data)",
    summary:
      "Your client master data. Every tender, job and invoice points at a customer record, so this is set up first.",
    blocks: [
      {
        type: "steps",
        title: "Creating a customer",
        items: [
          { title: "Open Customers from the sidebar", detail: "The register lists all customers with their contact and tax details." },
          { title: "Click 'New Customer'", detail: "The creation form opens." },
          { title: "Fill in the details", detail: "Name is the only mandatory field — add as much as you have (see the field reference below)." },
          { title: "Save", detail: "The customer is immediately selectable in tenders, jobs and invoices." },
        ],
      },
      {
        type: "fields",
        title: "Customer fields",
        rows: [
          { name: "Name", required: true, desc: "Customer / client company name, e.g. Dialog Axiata" },
          { name: "Email", desc: "Billing or accounts contact email" },
          { name: "Phone", desc: "Contact number" },
          { name: "Billing Address", desc: "Address used on invoices and tax invoices" },
          { name: "Tax Number", desc: "Customer TIN, printed on tax invoices" },
          { name: "Contact Person", desc: "Named person at the customer" },
        ],
      },
      {
        type: "steps",
        title: "Managing existing customers",
        items: [
          { title: "Edit", detail: "Open a customer row and update any field — changes flow through to new tenders, jobs and invoices." },
          { title: "Search", detail: "Use the search box to filter by name or contact details." },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Where customers appear",
        text: "Customer records feed the customer dropdown in Tenders, Jobs and the invoice creation wizard. Keeping names consistent makes reporting and exports clean.",
      },
    ],
  },

  // ── 4. Contractors ──────────────────────────────────────────
  {
    id: "contractors",
    label: "Contractors",
    icon: Building2,
    title: "Contractors (Master Data)",
    summary:
      "The contractors who bid on your jobs and get paid through the bill workflow. Bank details are mandatory in practice because payments are made to them.",
    blocks: [
      {
        type: "steps",
        title: "Adding a contractor",
        items: [
          { title: "Open Contractors from the sidebar", detail: "The register shows every contractor with status and rating." },
          { title: "Click 'Add Contractor'", detail: "The creation form opens." },
          { title: "Fill in company and contact details", detail: "Company name, contact person, email, phone and address." },
          { title: "Enter tax ID and banking details", detail: "Bank name and account number are needed before you can record payments to this contractor." },
          { title: "Set status and rating", detail: "Status Active or Blacklisted; rating is a manual 1–5 star score used for vendor performance tracking." },
          { title: "Save", detail: "The contractor becomes selectable when entering quotations and creating bills." },
        ],
      },
      {
        type: "fields",
        title: "Contractor fields",
        rows: [
          { name: "Company Name", required: true, desc: "Legal/trading name of the contractor" },
          { name: "Contact Person", desc: "Named contact" },
          { name: "Email / Phone", desc: "Contact channels" },
          { name: "Address", desc: "Registered or site address" },
          { name: "Tax ID", desc: "Contractor tax identification number" },
          { name: "Bank Name", desc: "Bank the contractor is paid through" },
          { name: "Bank Account Number", desc: "Account used for bill payments" },
          { name: "Status", desc: "Active or Blacklisted" },
          { name: "Rating", desc: "Manual 1–5 star vendor performance rating" },
        ],
      },
      { type: "flow", title: "Contractor statuses", steps: ["Active", "Blacklisted"], note: "Blacklisted contractors cannot be selected for new bills or jobs — use it when a contractor is suspended for compliance reasons." },
      {
        type: "callout",
        tone: "warning",
        title: "Blacklisting is deliberate",
        text: "Blacklisting hides the contractor from new selections but keeps history intact. Existing bills and quotations remain visible for audit.",
      },
    ],
  },

  // ── 5. Tenders ──────────────────────────────────────────────
  {
    id: "tenders",
    label: "Tenders",
    icon: Gavel,
    title: "Tenders",
    summary:
      "The tender pipeline. Register every bid opportunity, mark it awarded when you win, and issue the customer award letter.",
    blocks: [
      {
        type: "steps",
        title: "Creating a tender",
        items: [
          { title: "Open Tenders from the sidebar", detail: "The pipeline lists every tender with customer, value and status." },
          { title: "Click 'New Tender'", detail: "The creation form opens." },
          { title: "Enter the tender number and title", detail: "Tender number (e.g. TND-2026-001) and a descriptive name." },
          { title: "Select the customer", detail: "Pick from the customer master data." },
          { title: "Enter the money and dates", detail: "Budget, awarded amount, start and end dates." },
          { title: "Describe the scope", detail: "Scope description covering project terms and conditions." },
          { title: "Save with status Open", detail: "New tenders start as Open." },
        ],
      },
      {
        type: "fields",
        title: "Tender fields",
        rows: [
          { name: "Tender Number", required: true, desc: "Your unique tender reference, e.g. TND-2026-001" },
          { name: "Customer / Client", desc: "The customer the tender belongs to" },
          { name: "Title / Name", required: true, desc: "Short name of the tender, e.g. FTTH Western Province" },
          { name: "Budget (LKR)", desc: "Estimated / budgetary cost" },
          { name: "Awarded Amount (LKR)", desc: "The value you actually won — required for the award letter" },
          { name: "Status", desc: "Open, In Progress, Awarded or Closed" },
          { name: "Start / End Date", desc: "Tender validity or project window" },
          { name: "Scope Description", desc: "Project terms and conditions" },
        ],
      },
      {
        type: "flow",
        title: "Tender lifecycle",
        steps: ["Open", "In Progress", "Awarded", "Closed"],
        note: "Closed is used when the tender is fully billed. Only the Next valid status is offered when editing.",
      },
      {
        type: "steps",
        title: "Awarding a tender and issuing the letter",
        items: [
          { title: "Edit the tender", detail: "Change the status to Awarded." },
          { title: "Enter the awarded amount", detail: "The value you won at." },
          { title: "Download the award letter", detail: "As soon as the awarded amount is greater than zero, the row shows a Download action — click it to generate the tender award letter PDF addressed to the customer." },
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Download only appears when it should",
        text: "No awarded amount, no letter — the Download action is shown only for tenders with an awarded amount greater than zero, so you can never issue an empty letter.",
      },
    ],
  },

  // ── 6. Jobs ─────────────────────────────────────────────────
  {
    id: "jobs",
    label: "Jobs & Projects",
    icon: Briefcase,
    title: "Jobs & Projects",
    summary:
      "Jobs are where delivery happens. A job links a tender to the contractors who bid on it, the purchase order, the bills and finally the invoice.",
    blocks: [
      {
        type: "steps",
        title: "Creating a job",
        items: [
          { title: "Open Jobs from the sidebar", detail: "The portfolio lists every job with status, customer and value." },
          { title: "Click 'New Job'", detail: "The creation form opens." },
          { title: "Pick the tender and customer", detail: "The customer is auto-linked from the selected tender." },
          { title: "Enter the job details", detail: "Name, project value, scope description and the work start / completion dates." },
          { title: "Save", detail: "The job is created as Pending — no contractor attached yet." },
        ],
      },
      {
        type: "fields",
        title: "Job fields",
        rows: [
          { name: "Tender", required: true, desc: "The tender this job belongs to" },
          { name: "Customer", desc: "Auto-filled from the tender" },
          { name: "Name", required: true, desc: "Job name, e.g. RTU Replacement – Substations 1–5" },
          { name: "Project Value", desc: "Contract value for the job" },
          { name: "Scope Description", desc: "What the job covers" },
          { name: "Work Start / Completion Date", desc: "Planned execution window" },
          { name: "Status", desc: "Pending on creation, moves to In Progress when awarded" },
        ],
      },
      {
        type: "flow",
        title: "Job lifecycle",
        steps: ["Pending", "In Progress", "Completed"],
        note: "A job is Pending until a winning bid is selected, then In Progress, then Completed when the work is finished and billed.",
      },
      {
        type: "steps",
        title: "Working with the jobs list",
        items: [
          { title: "Switch views", detail: "Grid view shows cards with more detail; List view is a compact table. Toggle with the view buttons in the header." },
          { title: "Filter", detail: "Filter by status, customer or tender, and search by job name." },
          { title: "Export", detail: "Click 'Export CSV' to download the register — your active filters are applied to the export." },
          { title: "Open a job", detail: "Click a job to open its detail page: overview, contractor quotations panel, award letter and linked activity." },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "The job detail page is the bidding room",
        text: "Quotations are entered, compared and awarded on the job detail page — see the Contractor Quotations section for the full walkthrough.",
      },
    ],
  },

  // ── 7. Contractor Quotations ────────────────────────────────
  {
    id: "quotations",
    label: "Contractor Quotations",
    icon: FileSignature,
    title: "Contractor Quotations & Job Award",
    summary:
      "The bidding stage. Contractors submit quotations for a Pending job; you compare them side by side and select the winning bid.",
    blocks: [
      {
        type: "steps",
        title: "Entering bids — step by step",
        items: [
          { title: "Open a Pending job", detail: "Go to Jobs and open a job with status Pending. The Contractor Quotations panel shows 'No quotations yet' until bids are entered." },
          { title: "Click 'Add'", detail: "The Add button is visible only while the job is Pending." },
          { title: "Select the contractor", detail: "Choose from the contractor master data — every bid must come from a different contractor for a fair comparison." },
          { title: "Enter the amount", detail: "The quoted amount in LKR (decimals allowed)." },
          { title: "Set the quotation date", detail: "The date the quote was received." },
          { title: "Enter the duration", detail: "Estimated days to complete the work — this is compared alongside price." },
          { title: "Describe the work scope", detail: "Notes on what the contractor will deliver for that price." },
          { title: "Submit the quote", detail: "The bid is saved with status Submitted." },
          { title: "Repeat for at least 3 contractors", detail: "The Next Steps card on the job page recommends a minimum of 3 competitive bids." },
          { title: "Review the bid comparison table", detail: "Once bids exist, the panel shows all quotations side by side: contractor, date, duration, amount and a Select button on each bid." },
        ],
      },
      {
        type: "fields",
        title: "Quotation fields",
        rows: [
          { name: "Contractor", required: true, desc: "The bidding contractor" },
          { name: "Amount (LKR)", required: true, desc: "Quoted price for the job" },
          { name: "Date", required: true, desc: "Quotation date" },
          { name: "Duration (Days)", desc: "Estimated days to complete" },
          { name: "Work Scope / Notes", desc: "What the quote covers" },
        ],
      },
      {
        type: "steps",
        title: "Awarding the job",
        items: [
          { title: "Compare the bids", detail: "Look at contractor, date, duration and amount in the comparison table." },
          { title: "Click 'Select' on the winning bid", detail: "A confirmation appears: 'Select this contractor and award the job? This will reject other bids.'" },
          { title: "Confirm", detail: "The selected quotation becomes Selected, all other bids become Rejected." },
          { title: "The job updates automatically", detail: "Status moves to In Progress and the selected contractor, quoted amount and quote date are written onto the job." },
          { title: "Download the award letter", detail: "An Award Letter button appears in the job header — click it to download the award letter PDF for the selected contractor." },
          { title: "Bidding closes", detail: "The Add button disappears and the quotations panel becomes read-only. The full bid history stays visible for comparison and audit." },
        ],
      },
      {
        type: "flow",
        title: "Bid and job statuses",
        steps: ["Bid: Submitted", "Bid: Selected", "Bid: Rejected"],
        note: "Job: Pending → In Progress the moment a bid is selected.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Worked example",
        text: "Job #4 'RTU Replacement – Substations 1–5' has three bids: PowerLink 13,500,000 · Sigma Engineering 13,850,000 · TechBuild 14,100,000. Selecting the PowerLink bid rejects the other two, flips the job to In Progress, and unlocks the Award Letter download.",
      },
      {
        type: "table",
        title: "Who can do what",
        head: ["Action", "Permission needed", "Typical roles"],
        rows: [
          ["Enter quotations", "enter-quotations", "Procurement, Admin, Super Admin"],
          ["Select contractor / award job", "select-contractor", "Procurement, Admin, Super Admin"],
          ["View job and bids", "sign in", "All roles"],
        ],
      },
    ],
  },

  // ── 8. Purchase Orders ──────────────────────────────────────
  {
    id: "purchase-orders",
    label: "Purchase Orders",
    icon: ClipboardList,
    title: "Purchase Orders",
    summary:
      "The PO register. After awarding a job you issue the purchase order and walk it through its lifecycle to receipt, with PDFs and a full audit trail.",
    blocks: [
      {
        type: "steps",
        title: "Issuing a PO",
        items: [
          { title: "Open Purchase Orders from the sidebar", detail: "The register shows every PO with status and value, plus a stats strip at the top." },
          { title: "Click 'New PO'", detail: "The creation form opens." },
          { title: "Enter the PO number and amount", detail: "Your PO reference (e.g. PO-2026-0042) and the order value." },
          { title: "Select job, tender and vendor", detail: "All three link the PO into the delivery chain." },
          { title: "Set the order date", detail: "When the PO is issued." },
          { title: "Describe the scope and billing address", detail: "Order description and the billing / delivery address." },
          { title: "Save as Draft", detail: "The PO enters the register with status Draft." },
        ],
      },
      {
        type: "fields",
        title: "PO fields",
        rows: [
          { name: "PO Number", required: true, desc: "Unique purchase order reference" },
          { name: "Amount (LKR)", desc: "Order value" },
          { name: "Job", required: true, desc: "The job the PO belongs to" },
          { name: "Tender", required: true, desc: "The tender the job belongs to" },
          { name: "Vendor", required: true, desc: "The contractor / vendor being ordered" },
          { name: "Order Date", required: true, desc: "Issue date of the PO" },
          { name: "Status", desc: "Draft on creation; lifecycle moves are made when editing an existing PO" },
          { name: "Scope / Description", desc: "What is being ordered" },
          { name: "Billing / Delivery Address", required: true, desc: "Where goods/services are billed or delivered" },
          { name: "Change Note", desc: "Required when you move the status — explains the transition in the audit trail" },
        ],
      },
      {
        type: "flow",
        title: "PO lifecycle",
        steps: ["Draft", "Approved", "Sent", "Received"],
        note: "Cancelled is possible at any point. Steps must run in order — skipping a step (for example Draft straight to Sent) is rejected by design.",
      },
      {
        type: "steps",
        title: "Working the register",
        items: [
          { title: "Move a PO through its lifecycle", detail: "Edit the PO, pick the next valid status and enter a change note — every move is recorded in the audit trail." },
          { title: "Download the PO PDF", detail: "Click the download icon on any row — the PDF contains all order details and terms, ready for the vendor." },
          { title: "Open the audit trail", detail: "The audit trail shows the complete status history: who moved the PO, when and why (needs the view-audit-trail permission — Admin and Finance)." },
          { title: "Filter and export", detail: "Filter by status or search, and use Export CSV to download the register with your filters applied." },
          { title: "Read the stats strip", detail: "The header summarises the register: total POs, committed value and counts by status." },
        ],
      },
    ],
  },

  // ── 9. Contractor Bills ─────────────────────────────────────
  {
    id: "contractor-bills",
    label: "Contractor Bills",
    icon: Receipt,
    title: "Contractor Bills (Money Out)",
    summary:
      "The payables workflow. Bills move from draft to paid through verification and finance approval, with documents required at every step and milestone payments supported.",
    blocks: [
      {
        type: "flow",
        title: "Bill workflow",
        steps: ["Draft", "Verified", "Submitted", "Approved", "Paid"],
        note: "Finance can reject a Submitted or Approved bill with a mandatory reason — the bill returns to Draft for correction and resubmission.",
      },
      {
        type: "steps",
        title: "Creating and verifying a bill",
        items: [
          { title: "Open Contractor Bills", detail: "The register lists bills with their workflow status." },
          { title: "Create the bill", detail: "Enter the bill number, amount and date, select the job / PO, and add milestone notes. The bill is saved as Draft." },
          { title: "Upload the supporting document", detail: "Attach the contractor bill, completion certificate or site photo. A bill cannot be verified without at least one document." },
          { title: "Verify the bill", detail: "Verification moves the bill to Verified and notifies procurement that it is ready to submit." },
          { title: "Submit to finance", detail: "Submitting moves the bill to Submitted and notifies the finance team." },
        ],
      },
      {
        type: "steps",
        title: "Finance approval and payment",
        items: [
          { title: "Approve", detail: "Finance approves the bill — status becomes Approved." },
          { title: "Or reject with a reason", detail: "A Submitted or Approved bill can be rejected with a mandatory reason; it returns to Draft so the requester can correct and resubmit." },
          { title: "Record the payment", detail: "On an Approved bill, click 'Pay Bill' and enter the milestone name, payment amount, retention amount, bank reference, bank name and payment date." },
          { title: "Partial payments and retention", detail: "Payments can be partial — retention money can be held back and settled later. Each payment is recorded against the bill until it is fully Paid." },
        ],
      },
      {
        type: "fields",
        title: "Payment fields (Pay Bill)",
        rows: [
          { name: "Milestone Name", desc: "Which milestone this payment covers, e.g. Progress Milestone" },
          { name: "Payment Amount", desc: "Amount paid in this instalment (partial amounts supported)" },
          { name: "Retention Amount", desc: "Money held back from the payment" },
          { name: "Payment Reference", desc: "Bank / transaction reference" },
          { name: "Bank Name", desc: "Paying bank" },
          { name: "Paid At", desc: "Payment date" },
        ],
      },
      {
        type: "table",
        title: "Who can do what",
        head: ["Action", "Permission needed", "Typical roles"],
        rows: [
          ["Create bill / upload document", "submit-contractor-bill", "Procurement, Admin, Super Admin"],
          ["Verify bill", "verify-contractor-bill", "Procurement, Admin, Super Admin"],
          ["Approve / reject bill", "approve-contractor-payment", "Admin, Super Admin"],
          ["Record payment (mark paid)", "mark-contractor-paid", "Finance, Admin, Super Admin"],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "No document, no verification",
        text: "The Verify action is blocked until at least one supporting document is attached — the contractor bill, completion certificate or a site photo.",
      },
      {
        type: "callout",
        tone: "info",
        title: "Every step notifies",
        text: "Each transition notifies the next actor in-app: verification notifies procurement, submission notifies finance, and rejection tells the requester to correct and resubmit.",
      },
    ],
  },

  // ── 10. Invoices ────────────────────────────────────────────
  {
    id: "invoices",
    label: "Invoices & Payments",
    icon: FileSpreadsheet,
    title: "Invoices, Tax Invoices & Banking (Money In)",
    summary:
      "The receivables workflow. Create the invoice, generate the statutory tax invoice, submit to finance, then record the payment and bank it. Cheques are tracked in the cheque register.",
    blocks: [
      {
        type: "flow",
        title: "Invoice lifecycle",
        steps: ["Draft", "Tax Generated", "Submitted", "Approved", "Payment Received", "Banked"],
        note: "Finance can reject at the Submitted stage — the approval data is cleared and the invoice returns to the creator.",
      },
      {
        type: "steps",
        title: "Creating an invoice (the wizard)",
        items: [
          { title: "Open Invoices and click 'Create Invoice'", detail: "The invoice ledger is the money-in register." },
          { title: "Select the tender", detail: "The tender drives everything below it." },
          { title: "Select the job", detail: "The job list is filtered to jobs under the selected tender." },
          { title: "Select the PO", detail: "The PO list is filtered to purchase orders under the selected job." },
          { title: "Enter the invoice number and amount", detail: "Your invoice reference (e.g. INV-001) and the invoice value." },
          { title: "Enter dates, address and references", detail: "Invoice and due dates, the customer billing address, the customer PO reference and any invoice details or terms." },
          { title: "Create the draft", detail: "The invoice is saved as Draft." },
        ],
      },
      {
        type: "fields",
        title: "Invoice creation fields",
        rows: [
          { name: "Tender", required: true, desc: "The tender being billed" },
          { name: "Job", required: true, desc: "Filtered to jobs under the selected tender" },
          { name: "PO", desc: "Filtered to POs under the selected job" },
          { name: "Invoice Number", required: true, desc: "Your invoice reference" },
          { name: "Amount (LKR)", required: true, desc: "Invoice value" },
          { name: "Invoice Date / Due Date", desc: "Billing and payment dates" },
          { name: "Billing Address", desc: "Customer billing address" },
          { name: "Customer PO Reference", desc: "The customer's own PO number" },
          { name: "Details / Terms", desc: "Invoice notes and terms" },
        ],
      },
      {
        type: "steps",
        title: "Generating the statutory tax invoice",
        items: [
          { title: "Open the Draft invoice", detail: "Go to the invoice detail page." },
          { title: "Open the Tax Invoice tab", detail: "The tab shows the tax invoice view." },
          { title: "Click 'Generate Tax Invoice'", detail: "This locks the 18% VAT schedule and moves the invoice to Tax Generated. The button is only visible on Draft invoices." },
        ],
      },
      {
        type: "steps",
        title: "Submitting, approval and rejection",
        items: [
          { title: "Submit to finance", detail: "From the invoice detail page, submit the invoice — status becomes Submitted and finance is notified." },
          { title: "Finance approves", detail: "Approval moves the invoice to Approved. The Record Payment button becomes available." },
          { title: "Or finance rejects", detail: "A rejection with a mandatory reason clears the approval data and returns the invoice to the creator for correction." },
        ],
      },
      {
        type: "steps",
        title: "Recording the payment (milestone instalments)",
        items: [
          { title: "Click 'Record Payment'", detail: "Available on Approved invoices." },
          { title: "Check the balance overview", detail: "The modal shows the total invoice, amount received so far and the balance due, plus any previous instalments." },
          { title: "Enter the milestone name", detail: "e.g. 30% Advance, 2nd Milestone, Final Settlement." },
          { title: "Enter the amount and retention", detail: "The instalment amount (defaults to the balance due) and any retention money held back." },
          { title: "Enter the cheque / transaction reference and bank", detail: "e.g. CHQ-9281 through BOC, or a transfer reference. Cheque payments are automatically registered in the cheque register." },
          { title: "Set the received date", detail: "When the payment was received." },
          { title: "Record the instalment", detail: "The invoice moves to Payment Received and an internal receipt is generated automatically." },
        ],
      },
      {
        type: "fields",
        title: "Record Payment fields",
        rows: [
          { name: "Milestone / Installment Name", desc: "Which instalment this payment is" },
          { name: "Payment Amount (LKR)", required: true, desc: "Amount received in this instalment" },
          { name: "Retention Money (LKR)", desc: "Optional retention held back" },
          { name: "Cheque No. / Transaction Ref", desc: "Cheque number or bank transfer reference" },
          { name: "Bank Name", desc: "Paying bank" },
          { name: "Received Date", required: true, desc: "Date the payment was received" },
        ],
      },
      {
        type: "steps",
        title: "Marking the invoice banked",
        items: [
          { title: "Click 'Mark Banked'", detail: "Available once the payment is recorded (Approved or Payment Received status)." },
          { title: "Enter the banking details", detail: "Bank deposit reference and the bank cleared date." },
          { title: "Confirm", detail: "The invoice moves to Banked — the terminal state of the money-in cycle." },
        ],
      },
      {
        type: "table",
        title: "Who can do what",
        head: ["Action", "Permission needed", "Typical roles"],
        rows: [
          ["Create invoice", "create-invoice", "Procurement, Admin, Super Admin"],
          ["Generate tax invoice", "create-invoice", "Procurement, Admin, Super Admin"],
          ["Submit to finance", "submit-invoice", "Procurement, Admin, Super Admin"],
          ["Approve / reject invoice", "approve-payment / reject-invoice", "Finance, Admin, Super Admin"],
          ["Record payment", "record-payment", "Finance, Admin, Super Admin"],
          ["Mark banked", "mark-banked", "Finance, Admin, Super Admin"],
          ["View invoices", "view-invoice", "All roles"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Cheques are tracked automatically",
        text: "Recording a cheque payment registers it in the cheque transaction register with the cheque number, date, amount and payer details — so clearing and bounce follow-up has a single home.",
      },
    ],
  },

  // ── 11. Notifications ───────────────────────────────────────
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    title: "Notifications",
    summary:
      "Every workflow transition notifies the next actor's role group in-app, so work never stalls waiting for someone to check.",
    blocks: [
      {
        type: "steps",
        title: "Using the bell",
        items: [
          { title: "Watch the badge", detail: "The bell in the navbar shows your unread count and refreshes automatically every 30 seconds." },
          { title: "Open the dropdown", detail: "The newest alerts are listed with their source module." },
          { title: "Mark as read", detail: "Hover an item and click the check button — the badge decrements immediately and the item moves to the Earlier section." },
          { title: "Jump to the record", detail: "Each notification links to the entity it came from — a job, a bill or an invoice." },
        ],
      },
      {
        type: "steps",
        title: "Using the Notifications page",
        items: [
          { title: "Open Notifications from the sidebar", detail: "The full history of your alerts." },
          { title: "Filter unread", detail: "Use the Unread filter to focus on what still needs attention." },
          { title: "Mark all read", detail: "One click clears the unread state everywhere — the badge, dropdown and page stay in sync instantly." },
          { title: "Delete", detail: "Remove notifications you no longer need." },
        ],
      },
      {
        type: "table",
        title: "What triggers a notification",
        head: ["Event", "Who is notified"],
        rows: [
          ["Quotation selected / job awarded", "Procurement"],
          ["Contractor bill verified", "Procurement (ready to submit)"],
          ["Contractor bill submitted", "Finance (awaiting approval)"],
          ["Contractor bill rejected", "The bill creator"],
          ["Contractor bill paid", "The bill creator"],
          ["Invoice submitted / rejected", "Finance / the invoice creator"],
          ["Invoice payment recorded", "The invoice creator"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Control your alerts",
        text: "Settings → Notifications lets each user choose how alerts reach them. Critical workflow alerts are always delivered because they drive the approval chain.",
      },
    ],
  },

  // ── 12. Settings ────────────────────────────────────────────
  {
    id: "settings",
    label: "Settings",
    icon: SlidersHorizontal,
    title: "Settings",
    summary:
      "Personal and system configuration. Settings use a draft model — nothing is applied until you save.",
    blocks: [
      {
        type: "steps",
        title: "The draft model",
        items: [
          { title: "Make a change", detail: "Edit any field on any tab." },
          { title: "Watch for the unsaved banner", detail: "An amber banner appears while you have unsaved changes, with a per-tab dot marker." },
          { title: "Discard or Save", detail: "Discard reverts the draft; Save Changes commits only the active tab and shows a Saved confirmation." },
        ],
      },
      {
        type: "table",
        title: "Tabs and what they control",
        head: ["Tab", "What it does"],
        rows: [
          ["Account", "Your profile information — name, contact details, company and job title"],
          ["Notifications", "How workflow alerts reach you (email / browser, with critical alerts always on)"],
          ["Appearance", "Theme (light / dark) and compact density mode, which tightens spacing app-wide"],
          ["Regional", "Language, timezone, date format and currency — with a live preview; amounts and dates update across the dashboard, jobs, tenders, POs, invoices and bills"],
          ["Security", "Your account security options and sign-in activity"],
          ["System", "Debug mode (developer request logging) and, for Super Admins, maintenance mode"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Maintenance mode (Super Admin only)",
        text: "When switched on, write operations are blocked system-wide for other users (reads stay open) and an amber banner is shown to everyone — use it during planned maintenance windows.",
      },
    ],
  },

  // ── 13. Administration ──────────────────────────────────────
  {
    id: "administration",
    label: "Administration",
    icon: ShieldCheck,
    title: "Administration",
    summary:
      "User, role and audit management for administrators, plus system telemetry for Super Admins.",
    blocks: [
      {
        type: "steps",
        title: "Users",
        items: [
          { title: "Open Admin → Users", detail: "The user directory with roles and status." },
          { title: "Assign roles", detail: "Change a user's role to grant the matching permissions." },
          { title: "Deactivate / reactivate", detail: "Deactivate a user to block access without deleting their history; reactivate to restore." },
          { title: "Permanent delete", detail: "Remove a user entirely when required." },
        ],
      },
      {
        type: "steps",
        title: "Roles & Permissions",
        items: [
          { title: "Open Admin → Roles", detail: "The role designer listing every role and its permissions." },
          { title: "Review permissions", detail: "The full permission catalogue is shown per role — this is exactly what gates the buttons and endpoints across the system." },
        ],
      },
      {
        type: "steps",
        title: "Audit Logs",
        items: [
          { title: "Open Admin → Audit Logs", detail: "Who did what, when, across the system (Admin and Finance roles)." },
          { title: "Filter", detail: "Narrow by module, action, user or date to trace a specific record's history." },
        ],
      },
      {
        type: "steps",
        title: "System Logs (Super Admin only)",
        items: [
          { title: "Open System Logs", detail: "Live telemetry: server load, database latency, memory usage and active sessions." },
          { title: "Read the log stream", detail: "Recent application events for diagnosing platform issues." },
        ],
      },
    ],
  },

  // ── 14. Downloads ───────────────────────────────────────────
  {
    id: "downloads",
    label: "Downloads & Exports",
    icon: Download,
    title: "Downloads & Exports — Complete Reference",
    summary:
      "Every document and export the system can produce, where to find it and who can use it.",
    blocks: [
      {
        type: "table",
        title: "PDF documents",
        head: ["Document", "Where", "Available when"],
        rows: [
          ["Tender award letter", "Tenders → row Download action", "The tender is Awarded with an awarded amount greater than zero"],
          ["Job award letter", "Job detail → Award Letter button", "The job has been awarded (winning bid selected)"],
          ["Purchase order PDF", "Purchase Orders → row download icon", "Any PO in the register"],
          ["Invoice PDF", "Invoice detail → PDF action", "Any invoice"],
          ["Internal receipt", "Invoice detail → receipt action", "A payment has been recorded (receipt number required)"],
        ],
      },
      {
        type: "table",
        title: "CSV / Excel exports",
        head: ["Export", "Where", "Notes"],
        rows: [
          ["Jobs register", "Jobs → Export CSV", "Active filters (status, customer, tender, search) are applied"],
          ["Purchase orders register", "Purchase Orders → Export CSV", "Filtered register export"],
          ["Invoices ledger", "Invoices → Export CSV", "Invoice list export"],
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Documents attached to records",
        text: "Contractor bills and invoices keep their uploaded documents (contractor bills, completion certificates, site photos, BOQs) attached to the record — they are managed from the record's document section and stay with the audit history.",
      },
    ],
  },

  // ── 15. Troubleshooting ─────────────────────────────────────
  {
    id: "troubleshooting",
    label: "Troubleshooting",
    icon: LifeBuoy,
    title: "Troubleshooting",
    summary:
      "The common issues, their causes and the fix. If your issue is not here, raise a support ticket from the Help Center.",
    blocks: [
      {
        type: "table",
        title: "Symptoms and fixes",
        head: ["Symptom", "Cause & fix"],
        rows: [
          ["A page or section is empty", "The underlying data may not exist yet — create the records or ask an administrator to re-seed the demo dataset"],
          ["An action button is missing", "Your role does not hold the permission for that step — see the permission matrix in the Overview"],
          ["An action is refused after clicking", "Same as above, enforced on the server — contact an administrator to adjust your role"],
          ["A status transition is rejected", "Workflow steps must run in order (e.g. a PO cannot jump from Draft to Sent) — move it through the intermediate statuses"],
          ["A PDF fails to download", "The storage link may be missing — an administrator can restore it; other PDFs working means only that generator is affected"],
          ["You are signed out unexpectedly", "Sessions expire — sign in again and continue; unsaved drafts in Settings can be safely discarded and re-entered"],
          ["A verification is blocked", "A bill cannot be verified without at least one supporting document — upload the document first"],
          ["The award letter download is missing", "The tender needs a status of Awarded with an awarded amount greater than zero"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Still stuck?",
        text: "Open the Help Center and submit a support ticket. Include the tender, job, PO, bill or invoice number, what you expected to happen and what actually happened — the IT team responds within 2 business hours.",
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

function FieldsTable({ block }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{block.title}</p>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Field</th>
              <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {block.rows.map((row) => (
              <tr key={row.name}>
                <td className="px-3 py-2 align-top w-2/5">
                  <span className="text-xs font-medium text-foreground">{row.name}</span>
                  {row.required && (
                    <span className="ml-1.5 text-[9px] font-medium text-destructive uppercase">required</span>
                  )}
                </td>
                <td className="px-3 py-2 align-top text-[11px] text-muted-foreground leading-relaxed">{row.desc}</td>
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
                  <td key={j} className={`px-3 py-2 align-top text-[11px] leading-relaxed ${j === 0 ? "font-medium text-foreground" : "text-muted-foreground"} ${cell === "✓" ? "text-emerald-500 font-medium" : ""} ${cell === "—" ? "text-muted-foreground/50" : ""}`}>
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
    case "fields": return <FieldsTable block={block} />;
    case "flow": return <FlowChips block={block} />;
    case "table": return <DataTable block={block} />;
    case "callout": return <Callout block={block} />;
    default: return null;
  }
}

export default function GuidesPage() {
  const [activeId, setActiveId] = useState(guideSections[0].id);
  const sectionRefs = useRef({});

  // The app scrolls inside a ScrollArea viewport — listen on that element so
  // the category rail always highlights the section currently in view.
  useEffect(() => {
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const updateActive = () => {
      let current = guideSections[0].id;
      for (const section of guideSections) {
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
              System Walkthrough Guide
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step-by-step documentation for every module, workflow, status and download in the system
            </p>
          </div>
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Help Center
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
          {/* Category navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-2">
                Categories
              </p>
              <nav className="space-y-0.5">
                {guideSections.map((section) => {
                  const Icon = section.icon;
                  const active = activeId === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors text-left ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
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

          {/* Mobile category pills */}
          <div className="lg:hidden -mx-4 px-4">
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {guideSections.map((section) => {
                const Icon = section.icon;
                const active = activeId === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors whitespace-nowrap ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guide content */}
          <div className="space-y-4 min-w-0">
            {guideSections.map((section) => {
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

            {/* Footer help card */}
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/15 shrink-0">
                    <LifeBuoy className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Could not find what you need?</p>
                    <p className="text-[11px] text-primary-foreground/80 leading-relaxed mt-0.5">
                      The Help Center has more FAQs and a support ticket form — our IT team responds within 2 business hours.
                    </p>
                  </div>
                </div>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-white text-primary text-xs font-medium hover:bg-white/90 transition-colors shrink-0"
                >
                  Go to Help Center
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
