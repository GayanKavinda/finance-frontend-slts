// src/constants/navigation.js
import {
  LayoutDashboard,
  FileText,
  UserCircle,
  HelpCircle,
  Activity,
  Settings,
  Users,
} from "lucide-react";

export const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  {
    href: "/admin/users",
    label: "User Management",
    icon: UserCircle,
    requiredPermission: "manage-users",
  },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/system-logs", label: "System Logs", icon: Activity },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
];

export const AUTH_PATHS = [
  "/signup",
  "/signin",
  "/forgot-password",
  "/reset-password",
  "/account-success",
];
