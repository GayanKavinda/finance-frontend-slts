import React from "react";

export default function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();

  const variant =
    normalized.includes("approved") ||
    normalized.includes("banked") ||
    normalized.includes("paid") ||
    normalized.includes("completed")
      ? "default"
      : normalized.includes("rejected") ||
          normalized.includes("overdue")
        ? "destructive"
        : normalized.includes("pending") ||
            normalized.includes("submitted") ||
            normalized.includes("draft")
          ? "secondary"
          : "outline";

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium ${
        variant === "default"
          ? "bg-primary text-primary-foreground"
          : variant === "destructive"
            ? "bg-destructive text-white"
            : variant === "secondary"
              ? "bg-secondary text-secondary-foreground"
              : "border border-border bg-background text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}
