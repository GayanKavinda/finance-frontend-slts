//app/dashboard/page.js

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Wallet,
  TrendingDown,
  Plus,
  MoreVertical,
  Download,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import StatCard from "@/components/StatCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import Breadcrumb from "@/components/Breadcrumb";
import { fetchMonthlyInvoiceTrend } from "@/lib/invoice";
import { fetchInvoiceSummary, fetchRecentInvoices } from "@/lib/invoiceSummary";

const COLORS = {
  primary: "#14b8a6",
  danger: "#f43f5e",
};

const ChartCard = ({ title, subtitle, children, delay, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`premium-card p-6 h-full flex flex-col ${className}`}
  >
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-sm font-bold text-card-foreground uppercase tracking-wider">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground cursor-pointer">
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
    <div className="flex-1 min-h-[280px]">{children}</div>
  </motion.div>
);

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  const [summary, setSummary] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, invoicesData] = await Promise.all([
          fetchInvoiceSummary(),
          fetchRecentInvoices(5),
        ]);
        setSummary(summaryData);
        setRecentInvoices(
          Array.isArray(invoicesData?.data) ? invoicesData.data : [],
        );
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading || !user)
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );

  // Detect color for chart labels based on theme
  const chartLabelColor = theme === "dark" ? "#94a3b8" : "#64748b";

  const invoiceChartData = summary
    ? [
        { name: "Paid", value: Number(summary.paid_invoices) },
        { name: "Pending", value: Number(summary.pending_invoices) },
      ]
    : [];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }]} />
        <div className="space-y-8">
          {/* HEADER SECTION - Modern Welcome Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="premium-card flex flex-col sm:flex-row items-center gap-6 !p-6 border-l-4 border-l-primary relative overflow-hidden flex-1"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20 p-1.5 bg-card shadow-2xl transition-transform hover:scale-105 duration-500">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.name}
                      fill
                      className="object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-black">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-card rounded-full shadow-lg" />
              </div>

              <div className="text-center sm:text-left relative z-10">
                <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                  {getTimeGreeting()},{" "}
                  <span className="gradient-text">{user.name}</span>
                </h1>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Active Account
                    </span>
                  </div>
                  <div className="h-4 w-px bg-border hidden sm:block" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    Finance Controller • SLT Digital
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Removed Export and Deposit buttons as per user request */}
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <StatCard
              icon={<Wallet className="w-4 h-4 text-primary" />}
              title="Total Invoices"
              value={summary?.total_invoices ?? 0}
              decimals={0}
              delay={0.1}
            />

            <StatCard
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              title="Paid Invoices"
              value={summary?.paid_invoices ?? 0}
              decimals={0}
              delay={0.2}
            />

            <StatCard
              icon={<TrendingDown className="w-4 h-4 text-blue-500" />}
              title="Gross Amount"
              value={summary?.gross_amount ?? 0}
              prefix="LKR "
              decimals={2}
              delay={0.3}
            />

            <StatCard
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              title="Paid Amount"
              value={summary?.paid_amount ?? 0}
              prefix="LKR "
              decimals={2}
              delay={0.4}
            />

            <StatCard
              icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
              title="Pending Amount"
              value={summary?.pending_amount ?? 0}
              prefix="LKR "
              decimals={2}
              delay={0.5}
            />
          </div>

          {/* MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12">
              <ChartCard
                title="Invoice Status Overview"
                subtitle="Paid vs pending invoices"
                delay={0.6}
              >
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={invoiceChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: chartLabelColor, fontSize: 11 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: chartLabelColor, fontSize: 11 }}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={COLORS.primary}
                        fillOpacity={0.15}
                        fill={COLORS.primary}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </div>

          {/* RECENT INVOICES SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="premium-card overflow-hidden"
          >
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Recent Invoices
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Latest invoice transactions across the system
                </p>
              </div>
              <button className="text-xs font-bold text-primary hover:underline cursor-pointer">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Inv Number
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentInvoices.length > 0 ? (
                    recentInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-bold">
                          {inv.invoice_number}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {inv.customer?.name}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {new Date(inv.invoice_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold">
                          LKR {Number(inv.invoice_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter shadow-sm
                            ${inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
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
                        className="px-6 py-12 text-center text-xs text-muted-foreground"
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
