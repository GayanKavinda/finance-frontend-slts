// src/lib/notificationMeta.js
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

/**
 * Maps a notification action to its icon + design-token classes.
 * Shared by the navbar dropdown and the notifications center so both
 * surfaces render identical, theme-aware styling.
 */
export const getNotificationIcon = (action) => {
  switch (action) {
    case "approved":
    case "completed":
    case "success":
      return {
        icon: CheckCircle2,
        bgClass: "bg-emerald-500/10",
        iconClass: "text-emerald-600 dark:text-emerald-400",
      };
    case "rejected":
    case "error":
    case "failed":
      return {
        icon: AlertCircle,
        bgClass: "bg-destructive/10",
        iconClass: "text-destructive",
      };
    case "warning":
    case "pending":
      return {
        icon: AlertTriangle,
        bgClass: "bg-amber-500/10",
        iconClass: "text-amber-600 dark:text-amber-400",
      };
    case "info":
    case "created":
    case "updated":
    default:
      return {
        icon: Info,
        bgClass: "bg-primary/10",
        iconClass: "text-primary",
      };
  }
};
