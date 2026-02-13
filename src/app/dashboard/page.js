"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import ProtectedRoute from "@/components/ProtectedRoute";
import Breadcrumb from "@/components/Breadcrumb";
import { fetchMonthlyInvoiceTrend } from "@/lib/invoice";
import { fetchInvoiceSummary, fetchRecentInvoices } from "@/lib/invoiceSummary";
import { fetchStatusBreakdown } from "@/lib/invoiceSummary";

const MetricCard = ({ icon: Icon, label, value, trend, color, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numValue =
      typeof value === "number"
        ? value
        : parseFloat(value?.toString().replace(/[^0-9.-]+/g, "")) || 0;
    const duration = 1500;
    const steps = 60;
    const increment = numValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setCount(numValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatDisplayValue = () => {
    if (typeof value === "string" && value.includes("LKR")) {
      return `LKR ${count.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return count.toLocaleString("en-US", { maximumFractionDigits: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`inline-flex p-3 rounded-lg ${color} mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {formatDisplayValue()}
          </p>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend > 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">+{trend}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                  <span className="text-red-500 font-medium">{trend}%</span>
                </>
              )}
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

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
          Array.isArray(invoicesData?.data) ? invoicesData.data : [],
        );
        setMonthlyTrend(Array.isArray(trendData) ? trendData : []);
        setStatusBreakdown(Array.isArray(breakdownData) ? breakdownData : []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  if (loading || !user)
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );

  const chartLabelColor = theme === "dark" ? "#9CA3AF" : "#6B7280";

  const monthlyChartData = monthlyTrend.map((item) => ({
    month: item.month,
    total: Number(item.total_amount),
    paid: Number(item.paid_amount),
    pending: Number(item.pending_amount),
  }));

  const formatCurrency = (value) => {
    return `LKR ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-8 lg:px-12 py-8 max-w-[1600px] mx-auto">
          <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }]} />

          {/* Header */}
          <div className="mb-8 mt-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back,{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {user.name}
              </span>
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <MetricCard
              icon={FileText}
              label="Total Invoices"
              value={summary?.total_invoices ?? 0}
              trend={8}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              delay={0}
            />
            <MetricCard
              icon={CheckCircle}
              label="Paid Invoices"
              value={summary?.paid_invoices ?? 0}
              trend={12}
              color="bg-gradient-to-br from-green-500 to-green-600"
              delay={0.1}
            />
            <MetricCard
              icon={DollarSign}
              label="Total Revenue"
              value={formatCurrency(summary?.gross_amount ?? 0)}
              trend={15}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              delay={0.2}
            />
            <MetricCard
              icon={CheckCircle}
              label="Paid Amount"
              value={formatCurrency(summary?.paid_amount ?? 0)}
              trend={10}
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
              delay={0.3}
            />
            <MetricCard
              icon={Clock}
              label="Pending Amount"
              value={formatCurrency(summary?.pending_amount ?? 0)}
              trend={-5}
              color="bg-gradient-to-br from-amber-500 to-amber-600"
              delay={0.4}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Monthly Revenue Trend
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Track your revenue performance
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorPending"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartLabelColor}
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: chartLabelColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: chartLabelColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#colorTotal)"
                    name="Total"
                  />
                  <Area
                    type="monotone"
                    dataKey="paid"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#colorPaid)"
                    name="Paid"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fill="url(#colorPending)"
                    name="Pending"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Invoice Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Invoice Status Distribution
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Paid vs pending comparison
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={statusBreakdown.map((item) => ({
                    name: item.status,
                    count: Number(item.count),
                  }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartLabelColor}
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: chartLabelColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: chartLabelColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {[
                      { name: "Paid", fill: "#10B981" },
                      { name: "Pending", fill: "#F59E0B" },
                    ].map((entry, index) => (
                      <Bar
                        key={`bar-${index}`}
                        dataKey="count"
                        fill={entry.fill}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Recent Invoices Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Recent Invoices
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your latest transactions
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Invoice No.
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentInvoices.length > 0 ? (
                    recentInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {inv.invoice_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {inv.customer?.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {new Date(inv.invoice_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(inv.invoice_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              inv.status === "Paid"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No recent invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
