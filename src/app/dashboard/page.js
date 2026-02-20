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
import Breadcrumb from "@/components/Breadcrumb";
import { fetchMonthlyInvoiceTrend } from "@/lib/invoice";
import { fetchInvoiceSummary, fetchRecentInvoices } from "@/lib/invoiceSummary";
import { fetchStatusBreakdown } from "@/lib/invoiceSummary";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";

const STATUS_COLORS = {
  Paid: "#10B981",
  Pending: "#F59E0B",
  Rejected: "#EF4444",
  Draft: "#6B7280",
  Overdue: "#DC2626",
  "Pending Approval": "#8B5CF6",
};

const formatCurrency = (value) =>
  `LKR ${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatCompact = (value) => {
  const num = Number(value);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
};

// Count stat cards - grid on mobile
function CountStat({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className={`p-2 rounded-lg ${color} shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none mb-1 truncate">
          {label}
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// Revenue card
function RevenueCard({ label, amount, icon: Icon, color, delay }) {
  const [count, setCount] = useState(0);
  const target = Number(amount) || 0;

  useEffect(() => {
    if (!target) return;
    const duration = 1200;
    const steps = 50;
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
  }, [target]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <div className={`p-1.5 rounded-md ${color}`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-all">
        LKR{" "}
        {count.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </motion.div>
  );
}

// Custom chart tooltip
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 px-3 py-2.5 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-[200px]">
      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
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
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatCompact(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Mobile invoice card
function InvoiceCard({ inv }) {
  return (
    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60 last:border-b-0">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {inv.invoice_number}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {inv.customer?.name}
          </p>
        </div>
        <StatusBadge status={inv.status} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(inv.invoice_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {formatCurrency(inv.invoice_amount)}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  const [summary, setSummary] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, invoicesData, trendData, breakdownData] =
          await Promise.all([
            fetchInvoiceSummary(),
            fetchRecentInvoices(5),
            fetchMonthlyInvoiceTrend(),
            fetchStatusBreakdown(),
          ]);
        setSummary(summaryData);
        setRecentInvoices(
          Array.isArray(invoicesData?.data) ? invoicesData.data : []
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

  const axisColor = theme === "dark" ? "#4B5563" : "#D1D5DB";
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 max-w-[1440px] mx-auto">
        <div className="hidden sm:block">
          <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }]} />
        </div>

        {/* Header */}
        <div className="mt-2 sm:mt-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Welcome back,{" "}
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {user.name}
            </span>
          </p>
        </div>

        {/* Count Stats - 2x2 grid on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
          <CountStat
            icon={FileText}
            label="Total Invoices"
            value={summary?.total_invoices ?? 0}
            color="bg-blue-500"
            delay={0}
          />
          <CountStat
            icon={CheckCircle}
            label="Paid"
            value={summary?.paid_invoices ?? 0}
            color="bg-green-500"
            delay={0.05}
          />
          <CountStat
            icon={Clock}
            label="Pending"
            value={summary?.pending_approval_count ?? 0}
            color="bg-amber-500"
            delay={0.1}
          />
          <CountStat
            icon={AlertCircle}
            label="Rejected"
            value={summary?.rejected_count ?? 0}
            color="bg-red-500"
            delay={0.15}
          />
        </div>

        {/* Revenue Cards - stack on mobile, 3 cols on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
          <RevenueCard
            label="Total Revenue"
            amount={summary?.gross_amount ?? 0}
            icon={DollarSign}
            color="bg-purple-500"
            delay={0.1}
          />
          <RevenueCard
            label="Paid Amount"
            amount={summary?.paid_amount ?? 0}
            icon={CheckCircle}
            color="bg-emerald-500"
            delay={0.15}
          />
          <RevenueCard
            label="Pending Amount"
            amount={summary?.pending_amount ?? 0}
            icon={Clock}
            color="bg-amber-500"
            delay={0.2}
          />
        </div>

        {/* Charts - stack on mobile, 2:1 on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                Monthly Revenue Trend
              </h3>
            </div>
            <div className="-ml-2 sm:ml-0">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={monthlyChartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop
                        offset="100%"
                        stopColor="#3B82F6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop
                        offset="100%"
                        stopColor="#10B981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
                      <stop
                        offset="100%"
                        stopColor="#F59E0B"
                        stopOpacity={0}
                      />
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
                    tick={{ fill: tickColor, fontSize: 10 }}
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
                    wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    strokeWidth={1.5}
                    fill="url(#gTotal)"
                    name="Total"
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="paid"
                    stroke="#10B981"
                    strokeWidth={1.5}
                    fill="url(#gPaid)"
                    name="Paid"
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    fill="url(#gPending)"
                    name="Pending"
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Status Breakdown
            </h3>
            <div className="-ml-2 sm:ml-0">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  barSize={12}
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={axisColor}
                    opacity={0.4}
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
                    tick={{ fill: tickColor, fontSize: 10 }}
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
            </div>

            {/* Legend pills */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
              {barData.map((item) => (
                <span
                  key={item.name}
                  className="inline-flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400"
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

        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                Recent Invoices
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                Latest 5 transactions
              </p>
            </div>
            <Link
              href="/invoices"
              className="text-[11px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40">
                  {[
                    "Invoice No.",
                    "Customer",
                    "Date",
                    "Amount",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {recentInvoices.length > 0 ? (
                  recentInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {inv.invoice_number}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {inv.customer?.name}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(inv.invoice_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(inv.invoice_amount)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500"
                    >
                      No recent invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((inv) => (
                <InvoiceCard key={inv.id} inv={inv} />
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                No recent invoices found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}