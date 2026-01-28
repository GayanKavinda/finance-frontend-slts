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
import { fetchInvoiceSummary } from "@/lib/invoiceSummary";

const COLORS = {
  primary: "#14b8a6",
  danger: "#f43f5e",
};

const systemStable = true;
const monthlyExpenses = [
  { month: "Jul", income: 4200, expenses: 2800 },
  { month: "Aug", income: 4500, expenses: 3100 },
  { month: "Sep", income: 4300, expenses: 2900 },
  { month: "Oct", income: 4600, expenses: 3200 },
  { month: "Nov", income: 4800, expenses: 3400 },
  { month: "Dec", income: 5200, expenses: 3600 },
];

const ChartCard = ({ title, subtitle, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="premium-card p-6 h-full flex flex-col"
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

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await fetchInvoiceSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load invoice summary", err);
      }
    };

    if (user) {
      loadSummary();
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
              delay={0.1}
            />

            <StatCard
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              title="Paid Invoices"
              value={summary?.paid_invoices ?? 0}
              delay={0.2}
            />

            <StatCard
              icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
              title="Pending Invoices"
              value={summary?.pending_invoices ?? 0}
              delay={0.3}
            />

            <StatCard
              icon={<TrendingDown className="w-4 h-4 text-rose-500" />}
              title="Paid Amount"
              value={`LKR ${Number(summary?.paid_amount ?? 0).toLocaleString()}`}
              delay={0.4}
            />
          </div>

          {/* CHARTS & HEALTH SIDEBAR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Reduced Chart size by making it col-span-8 */}
            <div className="lg:col-span-8">
              <ChartCard
                title="Invoice Status Overview"
                subtitle="Paid vs pending invoices"
                delay={0.3}
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

            {/* NEW: System Health Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="premium-card p-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Live Health
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Server Load",
                      val: "24%",
                      icon: Activity,
                      color: "text-blue-500",
                    },
                    {
                      label: "DB Latency",
                      val: "12ms",
                      icon: Zap,
                      color: "text-amber-500",
                    },
                    {
                      label: "Security",
                      val: "Active",
                      icon: ShieldCheck,
                      color: "text-emerald-500",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-sm font-bold">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
