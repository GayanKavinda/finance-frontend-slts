// src/app/dashboard/page.js
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
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
  Calendar,
  Users,
  CreditCard,
  CircleDollarSign,
  Timer,
  ShieldCheck,
  RefreshCw,
  Target,
  Percent,
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
import { useTheme } from "@/contexts/ThemeContext";
import {
  fetchMonthlyInvoiceTrend,
} from "@/lib/invoice";
import {
  fetchInvoiceSummary,
  fetchRecentInvoices,
  fetchStatusBreakdown,
  fetchExecutiveSummary,
  fetchApprovalVelocity,
  fetchPerformanceMetrics,
} from "@/lib/invoiceSummary";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Separator } from "@/components/ui/Separator";
import Link from "next/link";

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

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    const steps = 60;
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
function Sparkline({ data, color = "hsl(var(--primary))", height = 32 }) {
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
        opacity="0.6"
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

// ─── Trend Indicator ─────────────────────────────────────────────────────────
function TrendIndicator({ value, label }) {
  const num = Number(value);
  const isPositive = num > 0;
  const isNeutral = num === 0;

  return (
    <div className="flex items-center gap-1">
      {isNeutral ? (
        <Minus className="h-3 w-3 text-muted-foreground" />
      ) : isPositive ? (
        <ArrowUpRight className="h-3 w-3 text-primary" />
      ) : (
        <ArrowDownRight className="h-3 w-3 text-destructive" />
      )}
      <span
        className={`text-xs font-medium ${
          isNeutral ? "text-muted-foreground" : isPositive ? "text-primary" : "text-destructive"
        }`}
      >
        {Math.abs(num).toFixed(1)}%
      </span>
      {label && <span className="text-[11px] text-muted-foreground">{label}</span>}
    </div>
  );
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-soft">
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="mb-0.5 flex items-center gap-2 text-xs">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">
            {typeof entry.value === "number"
              ? formatCompact(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

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
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.3)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 24, stiffness: 300 }}
        className="relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background shadow-strong"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-5 flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <span className="text-lg font-medium text-primary">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-base font-medium text-foreground">
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground">
                {firstName}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-foreground">
              {greeting}. Heres your overview.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
              <span>All systems operational</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5 text-primary" />
              <span>Data refreshed just now</span>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="mt-5 w-full"
            variant="default"
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-muted ${className}`}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] space-y-8">
        <SkeletonCard className="h-16 w-48" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <SkeletonCard className="h-80 lg:col-span-2" />
          <SkeletonCard className="h-80" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ message, icon: Icon = AlertTriangle }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 rounded-lg bg-muted p-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
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

  useEffect(() => {
    if (user) {
      const seen = sessionStorage.getItem("dashboard_welcome_seen");
      if (!seen) {
        const timer = setTimeout(() => setShowWelcome(true), 400);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleCloseWelcome = useCallback(() => {
    setShowWelcome(false);
    sessionStorage.setItem("dashboard_welcome_seen", "1");
  }, []);

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

  // Derived data
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
      })),
    [statusBreakdown],
  );

  const pieData = useMemo(
    () =>
      statusBreakdown.map((item) => ({
        name: item.status,
        value: Number(item.count) || 0,
      })),
    [statusBreakdown],
  );

  const velocityData = useMemo(() => {
    if (velocity.length > 0) {
      return velocity.map((item) => ({
        day: item.day,
        hours: Number(item.hours) || 0,
        target: 18,
      }));
    }
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
      { name: "Tender Value", value: Number(execSummary?.total_tender_value) || 0 },
      { name: "PO Total", value: Number(execSummary?.total_po_value) || 0 },
      { name: "Banked", value: banked },
      { name: "Pending", value: pending },
    ];
  }, [execSummary]);

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

  const axisColor = theme === "dark" ? "hsl(var(--border))" : "hsl(var(--border))";
  const tickColor = theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))";

  const primaryColor = "hsl(var(--primary))";
  const primaryFill = "hsl(var(--primary))";
  const mutedColor = "hsl(var(--muted-foreground))";
  const foregroundColor = "hsl(var(--foreground))";

  // Count-up values
  const tenderValue = useCountUp(Number(execSummary?.total_tender_value) || 0);
  const poValue = useCountUp(Number(execSummary?.total_po_value) || 0);
  const grossAmount = useCountUp(Number(execSummary?.gross_amount) || 0);
  const bankedAmount = useCountUp(
    Number(execSummary?.bank_amount || execSummary?.banked_amount) || 0,
  );

  const collectionRate = execSummary?.gross_amount
    ? ((execSummary?.banked_amount || 0) / execSummary.gross_amount) * 100
    : 0;

  if (authLoading || dataLoading) return <DashboardSkeleton />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {showWelcome && (
          <WelcomePopup user={user} onClose={handleCloseWelcome} />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-[1280px] space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-1.5 flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-medium text-primary">
                {user?.name?.charAt(0)}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {user.roles?.[0]?.name ?? "Administrator"}
              </span>
            </div>
            <h1 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
              Dashboard
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Financial overview and performance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-[11px] font-medium text-muted-foreground">
                Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* BENTO ROW 1 — Primary KPIs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Briefcase,
              label: "Total Tender Portfolio",
              value: formatCurrency(tenderValue),
              trend: 12.5,
              sparkData: sparkData1,
              delay: 0,
            },
            {
              icon: ShoppingBag,
              label: "Committed PO Value",
              value: formatCurrency(poValue),
              trend: 8.3,
              sparkData: sparkData2,
              delay: 0.04,
            },
            {
              icon: Receipt,
              label: "Invoiced Revenue",
              value: formatCurrency(grossAmount),
              trend: -2.1,
              sparkData: sparkData3,
              delay: 0.08,
            },
            {
              icon: Building2,
              label: "Cleared (Banked)",
              value: formatCurrency(bankedAmount),
              trend: 15.7,
              sparkData: sparkData4,
              delay: 0.12,
            },
          ].map((kpi) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: kpi.delay, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <kpi.icon className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    {kpi.trend !== undefined && <TrendIndicator value={kpi.trend} />}
                  </div>
                  <p className="mt-3 text-[11px] font-medium text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className="mt-0.5 text-lg font-medium tracking-tight text-foreground">
                    {kpi.value}
                  </p>
                  {kpi.sparkData && (
                    <div className="mt-2 -mx-1">
                      <Sparkline data={kpi.sparkData} color={primaryColor} height={20} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* BENTO ROW 2 — Health + Action */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          {/* Collection Efficiency — wide */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <Card>
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Target className="h-3.5 w-3.5 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-foreground">
                      Collection Efficiency
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">
                      Banked vs outstanding
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mb-4">
                  <p className="text-2xl font-medium tracking-tight text-foreground">
                    {formatPercent(collectionRate)}
                  </p>
                  <div className="flex gap-4 text-[11px] text-muted-foreground">
                    <span>Banked {formatCurrency(execSummary?.banked_amount || 0)}</span>
                    <span>Outstanding {formatCurrency(execSummary?.pending_amount || 0)}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${collectionRate}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Invoices — compact */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="h-full">
              <CardHeader className="pb-2 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                      <FileText className="h-3 w-3 text-foreground" />
                    </div>
                    <CardTitle className="text-xs font-medium text-foreground">
                      Recent
                    </CardTitle>
                  </div>
                  <Link
                    href="/invoices"
                    className="text-[10px] font-medium text-primary hover:text-primary/80"
                  >
                    All
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {recentInvoices.slice(0, 4).map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-foreground">
                          {inv.invoice_number}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {inv.customer?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-medium text-foreground">
                          {formatCurrency(inv.invoice_amount)}
                        </p>
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* BENTO ROW 3 — Revenue Trend (full) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Activity className="h-3.5 w-3.5 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-foreground">
                      Monthly Revenue Trend
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">
                      Invoice performance over time
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {["Total", "Banked", "Pending"].map((label, i) => (
                    <div key={label} className="flex items-center gap-1">
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: i === 0 ? primaryColor : i === 1 ? "hsl(var(--primary)/0.6)" : mutedColor }}
                      />
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {monthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={monthlyChartData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={primaryColor} stopOpacity="0.08" />
                        <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary)/0.5)" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="hsl(var(--primary)/0.5)" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={mutedColor} stopOpacity="0.06" />
                        <stop offset="100%" stopColor={mutedColor} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={axisColor}
                      opacity="0.4"
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
                      stroke={primaryColor}
                      strokeWidth={2}
                      fill="url(#gTotal)"
                      name="Total"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0, fill: primaryColor }}
                    />
                    <Area
                      type="monotone"
                      dataKey="paid"
                      stroke="hsl(var(--primary)/0.6)"
                      strokeWidth={2}
                      fill="url(#gPaid)"
                      name="Banked"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(var(--primary)/0.6)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stroke={mutedColor}
                      strokeWidth={2}
                      fill="url(#gPending)"
                      name="Pending"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0, fill: mutedColor }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No monthly trend data available" />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* BENTO ROW 4 — Analytics */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {/* Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <BarChart2 className="h-3.5 w-3.5 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-foreground">
                      Status Breakdown
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">
                      By invoice count
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {barData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart
                        data={barData}
                        layout="vertical"
                        barSize={10}
                        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={axisColor}
                          opacity="0.25"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fill: tickColor, fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: tickColor, fontSize: 10, fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          width={90}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar
                          dataKey="count"
                          radius={[0, 6, 6, 0]}
                          name="Invoices"
                          fill={primaryColor}
                        >
                          {barData.map((entry, i) => (
                            <Cell key={i} fill={i % 2 === 0 ? primaryColor : mutedColor} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <Separator className="my-3" />
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                      {barData.map((item) => (
                        <div
                          key={item.name}
                          className="inline-flex items-center gap-1.5"
                        >
                          <div
                            className="h-1.5 w-1.5 shrink-0 rounded-sm"
                            style={{ backgroundColor: "hsl(var(--primary))" }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {item.name}
                          </span>
                          <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-foreground">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState message="No status data" />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <PieChart className="h-3.5 w-3.5 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-foreground">
                      Revenue Distribution
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">
                      By source category
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={180}>
                    <RePieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={i === 0 ? primaryColor : i === 1 ? "hsl(var(--primary)/0.6)" : i === 2 ? mutedColor : "hsl(var(--muted-foreground)/0.3)"} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--popover))",
                          fontSize: "11px",
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2">
                    {categoryData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: i === 0 ? primaryColor : i === 1 ? "hsl(var(--primary)/0.6)" : i === 2 ? mutedColor : "hsl(var(--muted-foreground)/0.3)"}}
                        />
                        <div>
                          <p className="text-[11px] font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatCurrency(item.value)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Radar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
          >
            <Card>
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Target className="h-3.5 w-3.5 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-foreground">
                      Performance Radar
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">
                      KPI vs targets
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke={axisColor} opacity="0.4" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: tickColor, fontSize: 9, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: tickColor, fontSize: 8 }}
                      tickCount={5}
                    />
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke={primaryColor}
                      fill={primaryColor}
                      fillOpacity="0.1"
                      strokeWidth={2}
                    />
                    <Radar
                      name="Target"
                      dataKey="target"
                      stroke={mutedColor}
                      fill={mutedColor}
                      fillOpacity="0.05"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={5}
                      wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
