import { LayoutDashboard, ReceiptText, Target, PieChart } from "lucide-react";

export const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/reports", label: "Reports", icon: PieChart },
];

export const AUTH_PATHS = [
  "/signup",
  "/signin",
  "/forgot-password",
  "/reset-password",
];
