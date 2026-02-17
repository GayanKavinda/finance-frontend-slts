// src/lib/permissions.js
// Central permission helpers — pass the `permissions` array from auth context.
// Every component that shows/hides a button should call one of these.

// ─── Invoice Permissions ──────────────────────────────────────────

export const canCreateInvoice = (permissions = []) =>
  permissions.includes("create-invoice");

export const canEditInvoice = (permissions = []) =>
  permissions.includes("edit-invoice");

export const canSubmitInvoice = (permissions = []) =>
  permissions.includes("submit-invoice");

export const canApproveInvoice = (permissions = []) =>
  permissions.includes("approve-payment");

export const canRejectInvoice = (permissions = []) =>
  permissions.includes("reject-invoice");

export const canMarkPaid = (permissions = []) =>
  permissions.includes("approve-payment");

export const canViewAuditTrail = (permissions = []) =>
  permissions.includes("view-audit-trail");

// ─── Admin Permissions ────────────────────────────────────────────

export const canManageUsers = (permissions = []) =>
  permissions.includes("manage-users");

// ─── Role Shortcuts ───────────────────────────────────────────────
// Use these when you need to check the role itself rather than a
// specific permission (e.g., showing an "Admin" sidebar section).

export const isAdmin = (roles = []) => roles.includes("Admin");

export const isProcurement = (roles = []) => roles.includes("Procurement");

export const isFinance = (roles = []) => roles.includes("Finance");

export const isViewer = (roles = []) => roles.includes("Viewer");

// ─── Compound Checks ──────────────────────────────────────────────
// Convenience helpers for common multi-permission checks.

/** Can this user take any write action on invoices? */
export const canWriteInvoices = (permissions = []) =>
  canCreateInvoice(permissions) ||
  canEditInvoice(permissions) ||
  canSubmitInvoice(permissions) ||
  canApproveInvoice(permissions);

/** Which action buttons should show on an invoice given its status? */
export const invoiceActions = (invoice, permissions = []) => {
  const actions = [];

  if (!invoice?.status) return actions;

  switch (invoice.status) {
    case "Draft":
      if (canEditInvoice(permissions)) actions.push("edit");
      // Submit button only appears after tax is generated
      break;

    case "Tax Generated":
      if (canEditInvoice(permissions)) actions.push("edit");
      if (canSubmitInvoice(permissions)) actions.push("submit");
      break;

    case "Submitted":
      if (canApproveInvoice(permissions)) actions.push("approve");
      if (canRejectInvoice(permissions)) actions.push("reject");
      break;

    case "Approved":
      if (canMarkPaid(permissions)) actions.push("mark-paid");
      if (canRejectInvoice(permissions)) actions.push("reject");
      break;

    case "Rejected":
      // Procurement can re-edit and resubmit — backend resets to Draft
      if (canEditInvoice(permissions)) actions.push("edit");
      break;

    case "Paid":
      // Terminal state — no actions
      break;
  }

  return actions;
};

// ─── Status Metadata ──────────────────────────────────────────────
// Color and label for each status — use in badges and timeline.

export const STATUS_META = {
  Draft: { label: "Draft", color: "gray" },
  "Tax Generated": { label: "Tax Generated", color: "blue" },
  Submitted: { label: "Submitted", color: "yellow" },
  Approved: { label: "Approved", color: "green" },
  Rejected: { label: "Rejected", color: "red" },
  Paid: { label: "Paid", color: "teal" },
};

export const getStatusMeta = (status) =>
  STATUS_META[status] ?? { label: status, color: "gray" };
