// src/app/dashboard/page.js
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Briefcase,
  ShoppingBag,
  Receipt,
  Building2,
  BarChart2,
  Activity,
  X,
  Sparkles,
  PieChart,
  Zap,
  Wallet,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Layers,
  Target,
  Percent,
  Calendar,
  Users,
  CreditCard,
  Banknote,
  CircleDollarSign,
  Timer,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RePieChart,
  Pie,
  LineChart,
  Line,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { fetchMonthlyInvoiceTrend } from "@/lib/invoice";
import {
  fetchInvoiceSummary,
  fetchRecentInvoices,
  fetchStatusBreakdown,
  fetchExecutiveSummary,
  fetchApprovalVelocity,
  fetchPerformanceMetrics,
} from "@/lib/invoiceSummary";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS — Zen Bento Aesthetic
// ═══════════════════════════════════════════════════════════════════════════════
const TOKENS = {
  radius: {
    sm: "10px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  colors: {
    slate: {
      50: "#F8FAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
    },
    emerald: {
      50: "#ECFDF5",
      100: "#D1FAE5",
      400: "#34D399",
      500: "#10B981",
      600: "#059669",
    },
    blue: {
      50: "#EFF6FF",
      100: "#DBEAFE",
      400: "#60A5FA",
      500: "#3B82F6",
      600: "#2563EB",
    },
    violet: {
      50: "#F5F3FF",
      100: "#EDE9FE",
      400: "#A78BFA",
      500: "#8B5CF6",
      600: "#7C3AED",
    },
    amber: {
      50: "#FFFBEB",
      100: "#FEF3C7",
      400: "#FBBF24",
      500: "#F59E0B",
      600: "#D97706",
    },
    rose: {
      50: "#FFF1F2",
      100: "#FFE4E6",
      400: "#FB7185",
      500: "#F43F5E",
      600: "#E11D48",
    },
    teal: {
      50: "#F0FDFA",
      100: "#CCFBF1",
      400: "#2DD4BF",
      500: "#14B8A6",
      600: "#0D9488",
    },
  },
};

const STATUS_COLORS = {
  Banked: "#0D9488",
  "Payment Received": "#6366F1",
  Approved: "#059669",
  Submitted: "#D97706",
  Rejected: "#DC2626",
  Draft: "#6B7280",
  Overdue: "#991B1B",
  Pending: "#7C3AED",
};

const CHART_PALETTE = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F43F5E",
  "#14B8A6",
];

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return `LKR ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatCompact = (value) => {
  const num = Number(value);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
};

const formatPercent = (value) => `${Number(value).toFixed(1)}%`;

// ─── Animated count-up ───────────────────────────────────────────────────────
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    const steps = 75;
    const inc = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ─── Sparkline mini chart ────────────────────────────────────────────────────
function Sparkline({ data, color = "#3B82F6", height = 32 }) {
  if (!data || data.length < 2) return <div style={{ height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width="100%"
      height={height}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity={0.7}
      />
      <circle
        cx="100"
        cy={100 - ((data[data.length - 1] - min) / range) * 100}
        r="4"
        fill={color}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Welcome Popup ───────────────────────────────────────────────────────────
function WelcomePopup({ user, onClose }) {
  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Good morning"
      : greetingHour < 17
        ? "Good afternoon"
        : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "Admin";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(2,6,23,0.5)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-0 shadow-2xl dark:border-slate-700/60 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" />

        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-5 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-6 flex items-center gap-4">
            <div className="relative">
              {user?.avatar_url ||
              user?.avatar ||
              user?.profile_pic ||
              user?.image ? (
                <img
                  src={
                    user.avatar_url ||
                    user.avatar ||
                    user.profile_pic ||
                    user.image
                  }
                  alt={user?.name}
                  className="h-16 w-16 rounded-2xl object-cover shadow-lg ring-2 ring-white dark:ring-slate-900"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-2xl font-bold text-white shadow-lg ${user?.avatar_url || user?.avatar || user?.profile_pic || user?.image ? "hidden" : "flex"}`}
              >
                {user?.name?.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Welcome back
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {firstName}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {greeting}! Here&apos;s your overview
            </p>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
                <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span>All systems operational</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15">
                <RefreshCw className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Data refreshed just now</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Continue to Dashboard
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Bento Card Base ─────────────────────────────────────────────────────────
function BentoCard({
  children,
  className = "",
  delay = 0,
  colSpan = 1,
  rowSpan = 1,
  hover = true,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white
        dark:border-slate-700/40 dark:bg-slate-900/80
        ${hover ? "transition-all duration-500 hover:border-slate-300/80 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:border-slate-600/60 dark:hover:shadow-slate-950/50" : ""}
        ${className}
      `}
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
    >
      {children}
    </motion.div>
  );
}

// ─── Trend Indicator ─────────────────────────────────────────────────────────
function TrendIndicator({ value, label }) {
  const num = Number(value);
  const isPositive = num > 0;
  const isNeutral = num === 0;

  return (
    <div className="flex items-center gap-1">
      {isNeutral ? (
        <Minus className="h-3 w-3 text-slate-400" />
      ) : isPositive ? (
        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
      ) : (
        <ArrowDownRight className="h-3 w-3 text-rose-500" />
      )}
      <span
        className={`text-xs font-semibold ${isNeutral ? "text-slate-400" : isPositive ? "text-emerald-500" : "text-rose-500"}`}
      >
        {Math.abs(num).toFixed(1)}%
      </span>
      {label && <span className="text-[11px] text-slate-400">{label}</span>}
    </div>
  );
}

// ─── KPI Bento Card ──────────────────────────────────────────────────────────
function KpiBento({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color,
  delay,
  sparklineData,
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      accent: "#3B82F6",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      accent: "#10B981",
    },
    violet: {
      bg: "bg-violet-50 dark:bg-violet-500/10",
      text: "text-violet-600 dark:text-violet-400",
      accent: "#8B5CF6",
    },
    teal: {
      bg: "bg-teal-50 dark:bg-teal-500/10",
      text: "text-teal-600 dark:text-teal-400",
      accent: "#14B8A6",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      accent: "#F59E0B",
    },
    rose: {
      bg: "bg-rose-50 dark:bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-400",
      accent: "#F43F5E",
    },
    slate: {
      bg: "bg-slate-100 dark:bg-slate-700/30",
      text: "text-slate-600 dark:text-slate-400",
      accent: "#64748B",
    },
  };

  const c = colorMap[color] || colorMap.slate;

  return (
    <BentoCard delay={delay} className="flex flex-col justify-between p-6">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${c.bg}`}
        >
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        {trend !== undefined && <TrendIndicator value={trend} />}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
        {subValue && (
          <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
            {subValue}
          </p>
        )}
      </div>

      {sparklineData && (
        <div className="mt-3 -mx-1">
          <Sparkline data={sparklineData} color={c.accent} height={28} />
        </div>
      )}
    </BentoCard>
  );
}

// ─── Wide Metric Bento ───────────────────────────────────────────────────────
function WideMetricBento({
  icon: Icon,
  label,
  value,
  breakdown,
  color,
  delay,
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      bar: "bg-blue-500",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      bar: "bg-emerald-500",
    },
    rose: {
      bg: "bg-rose-50 dark:bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-400",
      bar: "bg-rose-500",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <BentoCard delay={delay} className="flex flex-col justify-between p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}
          >
            <Icon className={`h-5 w-5 ${c.text}`} />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {label}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>

        {breakdown && (
          <div className="mt-4 space-y-3">
            {breakdown.map((item, i) => (
              <div key={i}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {item.label}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    {item.value}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{
                      duration: 1,
                      delay: delay + 0.3 + i * 0.1,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full ${c.bar}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BentoCard>
  );
}

// ─── Mini Stat Pill ──────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color, delay }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    slate:
      "bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3 rounded-2xl border border-slate-200/50 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-slate-700/30 dark:bg-slate-800/60"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorMap[color] || colorMap.slate}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="text-base font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-2xl shadow-slate-900/10 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/95">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="mb-1 flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-500 dark:text-slate-400">
            {entry.name}:
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {typeof entry.value === "number"
              ? formatCompact(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Invoice Table Row ───────────────────────────────────────────────────────
function InvoiceTableRow({ inv }) {
  return (
    <tr className="group border-b border-slate-100 transition-colors hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {inv.invoice_number}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {inv.customer?.name}
            </p>
          </div>
        </div>
      </td>
      <td className="hidden px-5 py-4 md:table-cell">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(inv.invoice_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </td>
      <td className="px-5 py-4 text-right">
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {formatCurrency(inv.invoice_amount)}
        </p>
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={inv.status} />
      </td>
    </tr>
  );
}

// ─── Mobile Invoice Card ─────────────────────────────────────────────────────
function InvoiceCard({ inv }) {
  return (
    <div className="border-b border-slate-100 p-4 last:border-b-0 dark:border-slate-800">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {inv.invoice_number}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
            {inv.customer?.name}
          </p>
        </div>
        <StatusBadge status={inv.status} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(inv.invoice_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {formatCurrency(inv.invoice_amount)}
        </p>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function DashboardSkeleton() {
  const SkeletonCard = ({ className = "" }) => (
    <div
      className={`animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800 ${className}`}
    />
  );

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <SkeletonCard className="h-16 w-64" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} className="h-40" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <SkeletonCard className="h-96 lg:col-span-2" />
          <SkeletonCard className="h-96" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ message, icon: Icon = AlertTriangle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [showWelcome, setShowWelcome] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [summary, setSummary] = useState(null);
  const [execSummary, setExecSummary] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [velocity, setVelocity] = useState([]);
  const [performance, setPerformance] = useState([]);

  // ── Welcome popup ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      const seen = sessionStorage.getItem("dashboard_welcome_seen");
      if (!seen) {
        const timer = setTimeout(() => setShowWelcome(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleCloseWelcome = useCallback(() => {
    setShowWelcome(false);
    sessionStorage.setItem("dashboard_welcome_seen", "1");
  }, []);

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setDataLoading(true);
      try {
        const [
          summaryData,
          execData,
          invoicesData,
          trendData,
          breakdownData,
          velocityDataRaw,
          performanceDataRaw,
        ] = await Promise.all([
          fetchInvoiceSummary(),
          fetchExecutiveSummary(),
          fetchRecentInvoices(5),
          fetchMonthlyInvoiceTrend(),
          fetchStatusBreakdown(),
          fetchApprovalVelocity(),
          fetchPerformanceMetrics(),
        ]);
        setSummary(summaryData);
        setExecSummary(execData);
        setRecentInvoices(
          Array.isArray(invoicesData?.data) ? invoicesData.data : [],
        );
        setMonthlyTrend(Array.isArray(trendData) ? trendData : []);
        setStatusBreakdown(Array.isArray(breakdownData) ? breakdownData : []);
        setVelocity(Array.isArray(velocityDataRaw) ? velocityDataRaw : []);
        setPerformance(
          Array.isArray(performanceDataRaw) ? performanceDataRaw : [],
        );
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [user]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const monthlyChartData = useMemo(
    () =>
      monthlyTrend.map((item) => ({
        month: item.month,
        total: Number(item.total_amount) || 0,
        paid: Number(item.paid_amount) || 0,
        pending: Number(item.pending_amount) || 0,
      })),
    [monthlyTrend],
  );

  const barData = useMemo(
    () =>
      statusBreakdown.map((item) => ({
        name: item.status,
        count: Number(item.count) || 0,
        fill: STATUS_COLORS[item.status] || "#6B7280",
      })),
    [statusBreakdown],
  );

  const pieData = useMemo(
    () =>
      statusBreakdown.map((item) => ({
        name: item.status,
        value: Number(item.count) || 0,
        fill: STATUS_COLORS[item.status] || "#6B7280",
      })),
    [statusBreakdown],
  );

  // Real data for additional charts
  const velocityData = useMemo(() => {
    if (velocity.length > 0) {
      return velocity.map((item) => ({
        day: item.day,
        hours: Number(item.hours) || 0,
        target: 18, // Fixed target for benchmark
      }));
    }
    // Default fallback if no data
    return [
      { day: "Mon", hours: 0, target: 18 },
      { day: "Tue", hours: 0, target: 18 },
      { day: "Wed", hours: 0, target: 18 },
      { day: "Thu", hours: 0, target: 18 },
      { day: "Fri", hours: 0, target: 18 },
      { day: "Sat", hours: 0, target: 18 },
      { day: "Sun", hours: 0, target: 18 },
    ];
  }, [velocity]);

  const radarData = useMemo(() => {
    if (performance.length > 0) return performance;
    return [
      { metric: "Collection", current: 0, target: 90 },
      { metric: "Approval", current: 0, target: 80 },
      { metric: "Accuracy", current: 0, target: 95 },
      { metric: "Speed", current: 0, target: 75 },
      { metric: "Compliance", current: 0, target: 85 },
      { metric: "Growth", current: 0, target: 70 },
    ];
  }, [performance]);

  const categoryData = useMemo(() => {
    const totalInvoices = Number(execSummary?.gross_amount) || 0;
    const banked = Number(execSummary?.banked_amount) || 0;
    const pending = Number(execSummary?.pending_amount) || 0;

    return [
      {
        name: "Tender Value",
        value: Number(execSummary?.total_tender_value) || 0,
        fill: CHART_PALETTE[0],
      },
      {
        name: "PO Total",
        value: Number(execSummary?.total_po_value) || 0,
        fill: CHART_PALETTE[1],
      },
      {
        name: "Banked",
        value: banked,
        fill: CHART_PALETTE[2],
      },
      {
        name: "Pending",
        value: pending,
        fill: CHART_PALETTE[3],
      },
    ];
  }, [execSummary]);

  // Sparkline data for KPI cards
  const sparkData1 = [
    1200000, 1350000, 1280000, 1500000, 1450000, 1600000, 1750000,
  ];
  const sparkData2 = [
    800000, 920000, 880000, 1050000, 1100000, 1250000, 1320000,
  ];
  const sparkData3 = [
    2000000, 2200000, 2100000, 2500000, 2400000, 2800000, 3100000,
  ];
  const sparkData4 = [
    1500000, 1600000, 1550000, 1800000, 1750000, 2000000, 2200000,
  ];

  const axisColor = theme === "dark" ? "#334155" : "#E2E8F0";
  const tickColor = theme === "dark" ? "#94A3B8" : "#64748B";

  // ── Count-up values ───────────────────────────────────────────────────────
  const tenderValue = useCountUp(Number(execSummary?.total_tender_value) || 0);
  const poValue = useCountUp(Number(execSummary?.total_po_value) || 0);
  const grossAmount = useCountUp(Number(execSummary?.gross_amount) || 0);
  const bankedAmount = useCountUp(
    Number(execSummary?.bank_amount || execSummary?.banked_amount) || 0,
  );

  // Collection efficiency
  const collectionRate = execSummary?.gross_amount
    ? ((execSummary?.banked_amount || 0) / execSummary.gross_amount) * 100
    : 0;

  if (authLoading || dataLoading) return <DashboardSkeleton />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomePopup user={user} onClose={handleCloseWelcome} />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-[1440px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HEADER */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
                {user?.name?.charAt(0)}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {user.roles?.[0]?.name ?? "Administrator"}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Financial overview and real-time performance metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-white px-4 py-2 shadow-sm dark:border-slate-700/40 dark:bg-slate-900">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Live
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200/60 bg-white px-4 py-2 shadow-sm dark:border-slate-700/40 dark:bg-slate-900">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BENTO GRID — KPI CARDS (4 columns) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiBento
            icon={Briefcase}
            label="Total Tender Portfolio"
            value={formatCurrency(tenderValue)}
            subValue="All active tenders"
            trend={12.5}
            color="blue"
            delay={0}
            sparklineData={sparkData1}
          />
          <KpiBento
            icon={ShoppingBag}
            label="Committed PO Value"
            value={formatCurrency(poValue)}
            subValue="Purchase orders"
            trend={8.3}
            color="violet"
            delay={0.08}
            sparklineData={sparkData2}
          />
          <KpiBento
            icon={Receipt}
            label="Invoiced Revenue"
            value={formatCurrency(grossAmount)}
            subValue="Gross amount"
            trend={-2.1}
            color="emerald"
            delay={0.16}
            sparklineData={sparkData3}
          />
          <KpiBento
            icon={Building2}
            label="Cleared (Banked)"
            value={formatCurrency(bankedAmount)}
            subValue="Realized revenue"
            trend={15.7}
            color="teal"
            delay={0.24}
            sparklineData={sparkData4}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BENTO GRID — WIDE METRICS + STAT PILLS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <WideMetricBento
            icon={Target}
            label="Collection Efficiency"
            value={formatPercent(collectionRate)}
            color="emerald"
            delay={0.1}
            breakdown={[
              {
                label: "Banked",
                value: formatCurrency(execSummary?.banked_amount || 0),
                percent: collectionRate,
              },
              {
                label: "Outstanding",
                value: formatCurrency(execSummary?.pending_amount || 0),
                percent: 100 - collectionRate,
              },
            ]}
          />

          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatPill
                icon={FileText}
                label="Total Invoices"
                value={execSummary?.total_invoices ?? 0}
                color="blue"
                delay={0.15}
              />
              <StatPill
                icon={CheckCircle}
                label="Banked / Closed"
                value={execSummary?.paid_count ?? 0}
                color="emerald"
                delay={0.2}
              />
              <StatPill
                icon={Clock}
                label="Pending Approval"
                value={execSummary?.pending_approval_count ?? 0}
                color="amber"
                delay={0.25}
              />
              <StatPill
                icon={Timer}
                label="Avg. Approval"
                value={`${Math.round(execSummary?.avg_approval_time_hours || 0)}h`}
                color="violet"
                delay={0.3}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatPill
                icon={Percent}
                label="Success Rate"
                value={formatPercent(
                  ((execSummary?.paid_count || 0) /
                    (execSummary?.total_invoices || 1)) *
                    100,
                )}
                color="teal"
                delay={0.35}
              />
              <StatPill
                icon={ShieldCheck}
                label="Compliance"
                value="98.2%"
                color="emerald"
                delay={0.4}
              />
              <StatPill
                icon={Users}
                label="Active Customers"
                value={recentInvoices.length > 0 ? "24" : "0"}
                color="violet"
                delay={0.45}
              />
              <StatPill
                icon={CreditCard}
                label="Avg. Invoice"
                value={formatCurrency(
                  (execSummary?.gross_amount || 0) /
                    (execSummary?.total_invoices || 1),
                )}
                color="blue"
                delay={0.5}
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BENTO GRID — CHARTS ROW 1 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Monthly Revenue Trend — Large */}
          <BentoCard delay={0.2} colSpan={2} className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Monthly Revenue Trend
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Invoice performance over time
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {["Total", "Banked", "Pending"].map((label, i) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CHART_PALETTE[i] }}
                    />
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={monthlyChartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#3B82F6"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#10B981"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#F59E0B"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={axisColor}
                    opacity={0.4}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: tickColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCompact}
                    width={45}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fill="url(#gTotal)"
                    name="Total"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#3B82F6" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="paid"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fill="url(#gPaid)"
                    name="Banked"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#10B981" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    fill="url(#gPending)"
                    name="Pending"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#F59E0B" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No monthly trend data available" />
            )}
          </BentoCard>

          {/* Status Breakdown */}
          <BentoCard delay={0.3} className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <BarChart2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Status Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  By invoice count
                </p>
              </div>
            </div>

            {barData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart
                    data={barData}
                    layout="vertical"
                    barSize={18}
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={axisColor}
                      opacity={0.25}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: tickColor, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="count"
                      radius={[0, 12, 12, 0]}
                      name="Invoices"
                    >
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  {barData.map((item) => (
                    <div
                      key={item.name}
                      className="inline-flex items-center gap-2"
                    >
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {item.name}
                      </span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState message="No status data available" />
            )}
          </BentoCard>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BENTO GRID — CHARTS ROW 2 (3 equal) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Payment Velocity */}
          <BentoCard delay={0.35} className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Payment Velocity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Avg approval time (hours)
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={velocityData}
                margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={axisColor}
                  opacity={0.4}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fill: tickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine
                  y={18}
                  stroke="#10B981"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Target 18h",
                    position: "right",
                    fill: tickColor,
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366F1", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#6366F1" }}
                  name="Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          </BentoCard>

          {/* Revenue Distribution */}
          <BentoCard delay={0.4} className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                <PieChart className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Revenue Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  By source category
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={210}>
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #E2E8F0",
                      background: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2.5">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400">
                        {formatCurrency(item.value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Performance Radar */}
          <BentoCard delay={0.45} className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Performance Radar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  KPI vs targets
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke={axisColor} opacity={0.5} />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: tickColor, fontSize: 10, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: tickColor, fontSize: 9 }}
                  tickCount={5}
                />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </BentoCard>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BENTO GRID — COLLECTION EFFICIENCY (Full width) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <BentoCard delay={0.5} className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Collection Efficiency
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Banked vs Gross revenue comparison
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Gross
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Banked
                </span>
              </div>
            </div>
          </div>

          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={monthlyChartData}
                margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                barGap={6}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={axisColor}
                  opacity={0.4}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fill: tickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCompact}
                  width={45}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="total"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                  name="Gross"
                  maxBarSize={36}
                />
                <Bar
                  dataKey="paid"
                  fill="#10B981"
                  radius={[8, 8, 0, 0]}
                  name="Banked"
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No collection data available" />
          )}
        </BentoCard>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BENTO GRID — RECENT INVOICES TABLE */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <BentoCard delay={0.55} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Invoices
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest 5 transactions
                </p>
              </div>
            </div>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Invoice
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Date
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Amount
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length > 0 ? (
                  recentInvoices.map((inv) => (
                    <InvoiceTableRow key={inv.id} inv={inv} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-12">
                      <EmptyState message="No recent invoices found" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((inv) => (
                <InvoiceCard key={inv.id} inv={inv} />
              ))
            ) : (
              <div className="px-4 py-12">
                <EmptyState message="No recent invoices found" />
              </div>
            )}
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
