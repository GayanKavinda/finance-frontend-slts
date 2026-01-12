// app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingDown,
  Target,
  Plus,
  BarChart3,
  Goal,
  Calculator,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  PiggyBank,
  Receipt,
  MoreVertical,
  ChevronRight,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import StatCard from "@/components/StatCard";
import ActionCard from "@/components/ActionCard";
import { useTheme } from "next-themes";
import ProtectedRoute from "@/components/ProtectedRoute";

const COLORS = {
  primary: "#14b8a6", // Fallback
  secondary: "#06b6d4",
  tertiary: "#6366f1",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#f43f5e",
};

const monthlyExpenses = [
  { month: "Jul", income: 4200, expenses: 2800, savings: 1400 },
  { month: "Aug", income: 4500, expenses: 3100, savings: 1400 },
  { month: "Sep", income: 4300, expenses: 2900, savings: 1400 },
  { month: "Oct", income: 4600, expenses: 3200, savings: 1400 },
  { month: "Nov", income: 4800, expenses: 3400, savings: 1400 },
  { month: "Dec", income: 5200, expenses: 3600, savings: 1600 },
];

// Simplified Chart Card
const ChartCard = ({ title, subtitle, children, delay, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="h-full"
  >
    <div className="premium-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-card-foreground tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && (
          <button className="p-2 hover:bg-muted rounded-lg transition-colors group">
            <MoreVertical className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  </motion.div>
);

// Clean Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs font-semibold text-popover-foreground">
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-bold text-foreground">
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Progress Bar
const ProgressBar = ({ label, percentage, current, target, color, delay }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className="text-right">
        <span className="text-sm font-bold text-foreground">{percentage}%</span>
      </div>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, delay, ease: "circOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
    <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
      <span>${current.toLocaleString()}</span>
      <span>${target.toLocaleString()}</span>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    console.log("[Dashboard] Page mounted, authentication state:", {
      loading,
      hasUser: !!user,
    });
  }, [loading, user]);

  if (loading || !user) {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-2"
              >
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Personal Dashboard
                </span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                Hello,{" "}
                <span className="text-primary">{user.name.split(" ")[0]}</span>
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Here is your financial overview for today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 text-xs font-bold text-foreground bg-card border border-border rounded-xl hover:bg-muted/50 transition-all flex items-center gap-2 active:scale-95 shadow-sm">
                <Download className="w-4 h-4 text-muted-foreground" />
                Export
              </button>
              <button className="px-5 py-2.5 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Deposit
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Wallet className="w-5 h-5 text-primary" />}
              title="Total Balance"
              value={12450.0}
              change={5.2}
              changeLabel="vs last month"
              delay={0.1}
            />
            <StatCard
              icon={<TrendingDown className="w-5 h-5 text-indigo-500" />}
              title="Monthly Expenses"
              value={3210.0}
              change={-2.4}
              changeLabel="vs last month"
              delay={0.2}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Income vs Expenses - WIDER */}
            <div className="lg:col-span-8">
              <ChartCard
                title="Financial Performance"
                subtitle="Income vs Expenses"
                delay={0.5}
              >
                <div className="h-72 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthlyExpenses}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorIncome"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={COLORS.primary}
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor={COLORS.primary}
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorExpenses"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={COLORS.danger}
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor={COLORS.danger}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                        opacity={0.4}
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "var(--muted-foreground)",
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "var(--muted-foreground)",
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke={COLORS.primary}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        strokeWidth={3}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke={COLORS.danger}
                        fillOpacity={1}
                        fill="url(#colorExpenses)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </div>

          
        </div>
      </div>
    </ProtectedRoute>
  );
}
