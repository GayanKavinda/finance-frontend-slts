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
function ImpactCard({
  icon: Icon,
  label,
  value,
  gradient,
  bgGradient,
  barWidth,
  delay,
}) {
  const count = useCountUp(Number(value) || 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`group relative ${bgGradient} rounded-2xl p-6 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300`}
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`}
        />
      </div>
      {/* Large ghost icon */}
      <div className="absolute -bottom-3 -right-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p
          className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          LKR {formatCompact(count)}
        </p>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: barWidth }}
            transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Count stat chip ─────────────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, iconBg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className={`p-2 rounded-xl ${iconBg} shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 truncate">
          {label}
        </p>
        <p
          className="text-lg font-black text-gray-900 dark:text-white leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Revenue metric card ──────────────────────────────────────────────────────
function RevenueMetric({ label, amount, icon: Icon, accent, delay }) {
  const count = useCountUp(Number(amount) || 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <div className={`p-1.5 rounded-lg ${accent}`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <p
        className="text-lg font-black text-gray-900 dark:text-white break-all"
        style={{ fontFamily: "var(--font-display)" }}
      >
        LKR{" "}
        {count.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </motion.div>
  );
}

// ─── Recent invoice row ───────────────────────────────────────────────────────
function InvoiceRow({ inv }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-blue-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {inv.invoice_number}
          </p>
          <p className="text-xs text-gray-400 truncate">{inv.customer?.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <p className="text-xs text-gray-400 hidden sm:block">
          {new Date(inv.invoice_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {formatCurrency(inv.invoice_amount)}
        </p>
        <StatusBadge status={inv.status} />
      </div>
    </div>
  );
}

// ─── Mobile invoice card ──────────────────────────────────────────────────────
function InvoiceCard({ inv }) {
  return (
    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60 last:border-b-0">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {inv.invoice_number}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {inv.customer?.name}
          </p>
        </div>
        <StatusBadge status={inv.status} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {new Date(inv.invoice_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="text-sm font-bold text-gray-900 dark:text-white">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 max-w-[1440px] mx-auto space-y-6">
        {/* ── Hero Banner ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-8 overflow-hidden"
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Glow orbs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-40 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <p className="text-blue-300/80 text-xs font-bold uppercase tracking-widest">
                  Executive Overview
                </p>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-black text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {greeting}, {firstName} 👋
              </h1>
              <p className="text-blue-200/50 text-sm mt-1">
                Here's your financial health &amp; procurement metrics
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2.5 rounded-2xl flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-black">
                {user.name?.charAt(0)}
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-none">
                  {user.name}
                </p>
                <p className="text-blue-300/60 text-[10px] font-medium mt-0.5">
                  {user.roles?.[0]?.name ?? "User"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Procurement Impact Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <ImpactCard
            icon={Briefcase}
            label="Total Tender Portfolio"
            value={execSummary?.total_tender_value || 0}
            gradient="from-blue-500 to-blue-400"
            bgGradient="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            barWidth="75%"
            delay={0}
          />
          <ImpactCard
            icon={ShoppingBag}
            label="Committed PO Value"
            value={execSummary?.total_po_value || 0}
            gradient="from-violet-500 to-purple-400"
            bgGradient="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            barWidth="50%"
            delay={0.06}
          />
          <ImpactCard
            icon={Receipt}
            label="Invoiced Revenue"
            value={execSummary?.gross_amount || 0}
            gradient="from-emerald-500 to-teal-400"
            bgGradient="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            barWidth="65%"
            delay={0.12}
          />
          <ImpactCard
            icon={Building2}
            label="Cleared (Banked)"
            value={execSummary?.bank_amount || execSummary?.banked_amount || 0}
            gradient="from-teal-500 to-cyan-400"
            bgGradient="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            barWidth="33%"
            delay={0.18}
          />
        </div>

        {/* ── Count Stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatChip
            icon={FileText}
            label="Volume of Invoices"
            value={execSummary?.total_invoices ?? 0}
            iconBg="bg-blue-500"
            delay={0}
          />
          <StatChip
            icon={CheckCircle}
            label="Banked / Closed"
            value={execSummary?.paid_count ?? 0}
            iconBg="bg-emerald-500"
            delay={0.05}
          />
          <StatChip
            icon={Clock}
            label="Pending Approval"
            value={execSummary?.pending_approval_count ?? 0}
            iconBg="bg-amber-500"
            delay={0.1}
          />
          <StatChip
            icon={TrendingUp}
            label="Avg. Approval Time"
            value={`${Math.round(execSummary?.avg_approval_time_hours || 0)}h`}
            iconBg="bg-indigo-500"
            delay={0.15}
          />
        </div>

        {/* ── Financial Metrics Row ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RevenueMetric
            label="Total Gross Amount"
            amount={execSummary?.gross_amount ?? 0}
            icon={DollarSign}
            accent="bg-blue-600"
            delay={0.1}
          />
          <RevenueMetric
            label="Banked Amount"
            amount={execSummary?.banked_amount ?? 0}
            icon={CheckCircle}
            accent="bg-teal-600"
            delay={0.15}
          />
          <RevenueMetric
            label="Outstanding / Transit"
            amount={execSummary?.pending_amount ?? 0}
            icon={Clock}
            accent="bg-rose-600"
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
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h3
                    className="text-sm font-black text-gray-900 dark:text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Monthly Revenue Trend
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
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
            transition={{ duration: 0.35, delay: 0.25 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <h3
                  className="text-sm font-black text-gray-900 dark:text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Status Breakdown
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  By invoice count
                </p>
              </div>
            </div>
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
                  opacity={0.6}
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
                  tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Invoices">
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
              {barData.map((item) => (
                <span
                  key={item.name}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.name} ({item.count})
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Recent Invoices ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3
                  className="text-sm font-black text-gray-900 dark:text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Recent Invoices
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">
                  Latest 5 transactions
                </p>
              </div>
            </div>
            <Link
              href="/invoices"
              className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Desktop rows */}
          <div className="hidden md:block divide-y divide-gray-50 dark:divide-gray-700/40">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((inv) => <InvoiceRow key={inv.id} inv={inv} />)
            ) : (
              <p className="px-5 py-10 text-center text-sm text-gray-400">
                No recent invoices found.
              </p>
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((inv) => (
                <InvoiceCard key={inv.id} inv={inv} />
              ))
            ) : (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                No recent invoices found.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
