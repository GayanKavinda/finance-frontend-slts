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
        setRecentInvoices(invoicesData.data || []);
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
        { name: "Paid", value: summary.paid_invoices },
        { name: "Pending", value: summary.pending_invoices },
      ]
    : [];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }]} />
        <div className="space-y-8">
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative p-1 rounded-full border-2 border-primary/20 bg-background shadow-lg"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden relative">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full" />
              </motion.div>

              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  {getTimeGreeting()},{" "}
                  <span className="gradient-text">
                    {user.name.split(" ")[0]}
                  </span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                    System Status:{" "}
                    <span className="text-emerald-500">Operational</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-xs font-bold bg-card border border-border rounded-lg hover:bg-muted transition-all flex items-center gap-2 cursor-pointer">
                <Download className="w-4 h-4" /> Export
              </button>
              <button className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer">
                <Plus className="w-4 h-4" /> Deposit
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Wallet className="w-4 h-4 text-primary" />}
              title="Total Invoices"
              value={summary?.total_invoices ?? 0}
              decimals={0}
              delay={0.1}
            />

            <StatCard
              icon={<TrendingDown className="w-4 h-4 text-blue-500" />}
              title="Gross Amount"
              value={summary?.gross_amount ?? 0}
              prefix="LKR "
              decimals={2}
              delay={0.2}
            />

            <StatCard
              icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
              title="Pending Invoices"
              value={summary?.pending_invoices ?? 0}
              decimals={0}
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
          </div>

          {/* MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <ChartCard
                title="Invoice Status Overview"
                subtitle="Paid vs pending invoices"
                delay={0.5}
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

            <div className="lg:col-span-4 space-y-4">
              <div className="premium-card p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Live Health
                  </h3>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  {[
                    {
                      label: "Server Load",
                      val: "18%",
                      icon: Activity,
                      color: "text-blue-500",
                    },
                    {
                      label: "DB Latency",
                      val: "08ms",
                      icon: Zap,
                      color: "text-amber-500",
                    },
                    {
                      label: "Encryption",
                      val: "AES-256",
                      icon: ShieldCheck,
                      color: "text-emerald-500",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border/50 group hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background shadow-sm group-hover:scale-110 transition-transform">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xs font-black text-muted-foreground">
                        {item.val}
                      </span>
                    </div>
                  ))}

                  <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
                      Last Update
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      System check completed 2 mins ago. No issues detected.
                    </p>
                  </div>
                </div>
              </div>
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
