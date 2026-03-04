// src/app/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Briefcase,
  ShoppingBag,
  Receipt,
  Building2,
  Sparkles,
  BarChart2,
  Activity,
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
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { fetchMonthlyInvoiceTrend } from "@/lib/invoice";
import {
  fetchInvoiceSummary,
  fetchRecentInvoices,
  fetchStatusBreakdown,
  fetchExecutiveSummary,
} from "@/lib/invoiceSummary";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";

const STATUS_COLORS = {
  Banked: "#2DD4BF",
  "Payment Received": "#6366F1",
  Approved: "#10B981",
  Submitted: "#F59E0B",
  Rejected: "#EF4444",
  Draft: "#6B7280",
  Overdue: "#B91C1C",
  Pending: "#8B5CF6",
};

const formatCurrency = (value) =>
  `LKR ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatCompact = (value) => {
  const num = Number(value);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
};

// ─── Animated count-up ───────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const steps = 50;
    const inc = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(current);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 px-3 py-2.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-[200px]">
      <p className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs mb-0.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 dark:text-gray-300 truncate">
            {entry.name}:
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {formatCompact(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Procurement "impact" card ────────────────────────────────────────────────
function ImpactCard({ icon: Icon, label, value, iconColor, delay }) {
  const count = useCountUp(Number(value) || 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-md ${iconColor} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold text-foreground">
        LKR {formatCompact(count)}
      </p>
    </motion.div>
  );
}

// ─── Clean stat chip ──────────────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, iconColor, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 bg-card rounded-lg px-4 py-3 border hover:shadow-sm transition-shadow"
    >
      <div className={`p-2 rounded-md ${iconColor} shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground leading-none mb-1 truncate">
          {label}
        </p>
        <p className="text-lg font-semibold text-foreground leading-none">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Clean revenue card ───────────────────────────────────────────────────────
function RevenueMetric({ label, amount, icon: Icon, iconColor, delay }) {
  const count = useCountUp(Number(amount) || 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-card rounded-lg border p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className={`p-2 rounded-md ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-lg font-semibold text-foreground">
        LKR{" "}
        {count.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </motion.div>
  );
}

// ─── Clean table row ──────────────────────────────────────────────────────────
function InvoiceTableRow({ inv }) {
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {inv.invoice_number}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {inv.customer?.name}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <p className="text-sm text-muted-foreground">
          {new Date(inv.invoice_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </td>
      <td className="px-4 py-3 text-right">
        <p className="text-sm font-medium text-foreground">
          {formatCurrency(inv.invoice_amount)}
        </p>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={inv.status} />
      </td>
    </tr>
  );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────
function InvoiceCard({ inv }) {
  return (
    <div className="p-4 border-b border-border last:border-b-0">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {inv.invoice_number}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {inv.customer?.name}
          </p>
        </div>
        <StatusBadge status={inv.status} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted-foreground">
          {new Date(inv.invoice_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="text-sm font-medium text-foreground">
          {formatCurrency(inv.invoice_amount)}
        </p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  const [summary, setSummary] = useState(null);
  const [execSummary, setExecSummary] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, execData, invoicesData, trendData, breakdownData] =
          await Promise.all([
            fetchInvoiceSummary(),
            fetchExecutiveSummary(),
            fetchRecentInvoices(5),
            fetchMonthlyInvoiceTrend(),
            fetchStatusBreakdown(),
          ]);
        setSummary(summaryData);
        setExecSummary(execData);
        setRecentInvoices(
          Array.isArray(invoicesData?.data) ? invoicesData.data : [],
        );
        setMonthlyTrend(Array.isArray(trendData) ? trendData : []);
        setStatusBreakdown(Array.isArray(breakdownData) ? breakdownData : []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    if (user) loadData();
  }, [user]);

  if (loading || !user) return <div />;

  const axisColor = theme === "dark" ? "#374151" : "#E5E7EB";
  const tickColor = theme === "dark" ? "#9CA3AF" : "#6B7280";

  const monthlyChartData = monthlyTrend.map((item) => ({
    month: item.month,
    total: Number(item.total_amount),
    paid: Number(item.paid_amount),
    pending: Number(item.pending_amount),
  }));

  const barData = statusBreakdown.map((item) => ({
    name: item.status,
    count: Number(item.count),
    fill: STATUS_COLORS[item.status] || "#6B7280",
  }));

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Good morning"
      : greetingHour < 17
        ? "Good afternoon"
        : "Good evening";
  const firstName = user.name?.split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1440px] mx-auto space-y-6">
        {/* ── Hero Banner ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-xl border shadow-sm p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {user.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {firstName}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {greeting}! Here's your financial overview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-foreground">
                {user.roles?.[0]?.name ?? "User"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Procurement Impact Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ImpactCard
            icon={Briefcase}
            label="Total Tender Portfolio"
            value={execSummary?.total_tender_value || 0}
            iconColor="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20"
            delay={0}
          />
          <ImpactCard
            icon={ShoppingBag}
            label="Committed PO Value"
            value={execSummary?.total_po_value || 0}
            iconColor="bg-violet-500/10 text-violet-600 dark:bg-violet-500/20"
            delay={0.06}
          />
          <ImpactCard
            icon={Receipt}
            label="Invoiced Revenue"
            value={execSummary?.gross_amount || 0}
            iconColor="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20"
            delay={0.12}
          />
          <ImpactCard
            icon={Building2}
            label="Cleared (Banked)"
            value={execSummary?.bank_amount || execSummary?.banked_amount || 0}
            iconColor="bg-teal-500/10 text-teal-600 dark:bg-teal-500/20"
            delay={0.18}
          />
        </div>

        {/* ── Count Stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatChip
            icon={FileText}
            label="Volume of Invoices"
            value={execSummary?.total_invoices ?? 0}
            iconColor="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20"
            delay={0}
          />
          <StatChip
            icon={CheckCircle}
            label="Banked / Closed"
            value={execSummary?.paid_count ?? 0}
            iconColor="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20"
            delay={0.05}
          />
          <StatChip
            icon={Clock}
            label="Pending Approval"
            value={execSummary?.pending_approval_count ?? 0}
            iconColor="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20"
            delay={0.1}
          />
          <StatChip
            icon={TrendingUp}
            label="Avg. Approval Time"
            value={`${Math.round(execSummary?.avg_approval_time_hours || 0)}h`}
            iconColor="bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20"
            delay={0.15}
          />
        </div>

        {/* ── Financial Metrics Row ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RevenueMetric
            label="Total Gross Amount"
            amount={execSummary?.gross_amount ?? 0}
            icon={DollarSign}
            iconColor="bg-blue-500/10 text-blue-600"
            delay={0.1}
          />
          <RevenueMetric
            label="Banked Amount"
            amount={execSummary?.banked_amount ?? 0}
            icon={CheckCircle}
            iconColor="bg-teal-500/10 text-teal-600"
            delay={0.15}
          />
          <RevenueMetric
            label="Outstanding / Transit"
            amount={execSummary?.pending_amount ?? 0}
            icon={Clock}
            iconColor="bg-rose-500/10 text-rose-600"
            delay={0.2}
          />
        </div>

        {/* ── Charts Row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="lg:col-span-2 bg-card rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Monthly Revenue Trend
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Invoice performance over time
                  </p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={monthlyChartData}
                margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={axisColor}
                  opacity={0.6}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: tickColor, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCompact}
                  width={38}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{
                    fontSize: 11,
                    paddingTop: 8,
                    fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#gTotal)"
                  name="Total"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="paid"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#gPaid)"
                  name="Paid"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="url(#gPending)"
                  name="Pending"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="bg-card rounded-xl border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Status Breakdown
                </h3>
                <p className="text-xs text-muted-foreground">
                  By invoice count
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={barData}
                layout="vertical"
                barSize={14}
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={axisColor}
                  opacity={0.3}
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
                  tick={{ fill: tickColor, fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} name="Invoices">
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t">
              {barData.map((item) => (
                <div key={item.name} className="inline-flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Recent Invoices Table ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="bg-card rounded-xl border shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Recent Invoices
                </h3>
                <p className="text-xs text-muted-foreground">
                  Latest 5 transactions
                </p>
              </div>
            </div>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                    <td
                      colSpan="4"
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No recent invoices found.
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
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No recent invoices found.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
