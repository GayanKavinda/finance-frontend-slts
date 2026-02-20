// src/constants/navigation.js
import {
  LayoutDashboard,
  Receipt,
  Shield,
  History,
  Settings,
  Bell,
  Activity,
  Users,
  Briefcase,
  Target,
  FileText,
  FileBarChart, // Added from new import snippet
  HelpCircle, // Added from new import snippet
  UserCircle, // Added as it's used in navLinks but not in original imports
} from "lucide-react";

export const navLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
    requiredPermission: "manage-customers",
  },
  {
    label: "Tenders",
    href: "/tenders",
    icon: Briefcase,
    requiredPermission: "manage-tenders",
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: Target,
    requiredPermission: "manage-jobs",
  },
  {
    label: "Purchase Orders",
    href: "/purchase-orders",
    icon: FileText,
    requiredPermission: "manage-pos",
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: Receipt,
    requiredPermission: "view-invoice",
  },
  {
    label: "Access Control",
    href: "/admin/roles",
    icon: Shield,
    requiredPermission: "manage-roles",
  },
  {
    href: "/admin/users",
    label: "User Management",
    icon: UserCircle,
    requiredPermission: "manage-users",
  },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/system-logs", label: "System Logs", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help Center", href: "/help", icon: HelpCircle },
];

export const AUTH_PATHS = [
  "/signup",
  "/signin",
  "/forgot-password",
  "/reset-password",
  "/account-success",
];
