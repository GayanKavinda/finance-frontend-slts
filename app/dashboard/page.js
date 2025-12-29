// app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, TrendingDown, Target, Plus, BarChart3, Goal, 
  Calculator, Sparkles, TrendingUp, ArrowUpRight, ArrowDownRight,
  DollarSign, CreditCard, PiggyBank, Receipt, MoreVertical,
  ChevronRight, Filter, Download, Eye
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/StatCard';
import ActionCard from '@/components/ActionCard';
import { useTheme } from 'next-themes';

// Helper to get CSS variable value
const getCssVariable = (variable) => {
  if (typeof window === 'undefined') return '#000000';
  const styles = getComputedStyle(document.documentElement);
  // This is a simplification; for Recharts we might need explicit hex values or
  // we can rely on opacity if Chart.js/Recharts supports it.
  // For now, let's stick to a safe palette that adapts well.
  return styles.getPropertyValue(variable).trim();
};

const COLORS = {
  primary: '#14b8a6', // Fallback
  secondary: '#06b6d4',
  tertiary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
};

const monthlyExpenses = [
  { month: 'Jul', income: 4200, expenses: 2800, savings: 1400 },
  { month: 'Aug', income: 4500, expenses: 3100, savings: 1400 },
  { month: 'Sep', income: 4300, expenses: 2900, savings: 1400 },
  { month: 'Oct', income: 4600, expenses: 3200, savings: 1400 },
  { month: 'Nov', income: 4800, expenses: 3400, savings: 1400 },
  { month: 'Dec', income: 5200, expenses: 3600, savings: 1600 },
];

const categoryData = [
  { name: 'Housing', value: 920, color: COLORS.tertiary },
  { name: 'Food', value: 850, color: COLORS.primary },
  { name: 'Transport', value: 420, color: COLORS.secondary },
  { name: 'Shopping', value: 680, color: COLORS.success },
  { name: 'Entertainment', value: 340, color: COLORS.warning },
];

const dailySpending = [
  { day: 'Mon', amount: 45 },
  { day: 'Tue', amount: 125 },
  { day: 'Wed', amount: 78 },
  { day: 'Thu', amount: 165 },
  { day: 'Fri', amount: 210 },
  { day: 'Sat', amount: 95 },
  { day: 'Sun', amount: 60 },
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
          <h3 className="text-lg font-bold text-card-foreground tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action && (
          <button className="p-2 hover:bg-muted rounded-lg transition-colors group">
            <MoreVertical className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  </motion.div>
);

// Clean Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-semibold text-popover-foreground">{entry.name}</span>
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
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
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
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
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
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Personal Dashboard</span>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Hello, <span className="text-primary">{user.name.split(' ')[0]}</span>
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
            value={12450.00}
            change={5.2}
            changeLabel="vs last month"
            delay={0.1}
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5 text-indigo-500" />}
            title="Monthly Expenses"
            value={3210.00}
            change={-2.4}
            changeLabel="vs last month"
            delay={0.2}
          />
          <StatCard
            icon={<PiggyBank className="w-5 h-5 text-emerald-500" />}
            title="Total Savings"
            value={6000.00}
            change={8.5}
            changeLabel="vs last month"
            delay={0.3}
          />
          <StatCard
            icon={<Target className="w-5 h-5 text-amber-500" />}
            title="Savings Goal"
            value={8000.00}
            delay={0.4}
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
                  <AreaChart data={monthlyExpenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
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

          {/* Categories */}
          <div className="lg:col-span-4">
            <ChartCard
              title="Spending Breakdown"
              subtitle="By Category"
              delay={0.6}
            >
              <div className="h-72 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ bottom: 0, fontSize: '11px', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Weekly Spending */}
          <div className="lg:col-span-7">
            <ChartCard
              title="Weekly Trends"
              subtitle="Daily Transaction Volume"
              delay={0.7}
            >
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySpending} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 500 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.1, radius: 8 }} />
                    <Bar 
                      dataKey="amount" 
                      fill={COLORS.primary} 
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Goals */}
          <div className="lg:col-span-5">
            <ChartCard
              title="Financial Goals"
              subtitle="Progress Tracking"
              delay={0.8}
            >
              <div className="space-y-6 py-2">
                <ProgressBar
                  label="Emergency Fund"
                  percentage={75}
                  current={6000}
                  target={8000}
                  color={COLORS.primary}
                  delay={0.1}
                />
                <ProgressBar
                  label="Travel Fund"
                  percentage={45}
                  current={2250}
                  target={5000}
                  color={COLORS.danger}
                  delay={0.3}
                />
                <ProgressBar
                  label="Investment"
                  percentage={30}
                  current={6000}
                  target={20000}
                  color={COLORS.tertiary}
                  delay={0.5}
                />
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Bottom - Transactions & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-card-foreground">Recent Transactions</h3>
                </div>
                <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              
              <div className="space-y-3">
                {[
                  { name: 'Apple Store', amount: -185.42, date: 'Today', time: '2:30 PM', icon: <Receipt size={16} />, category: 'Tech' },
                  { name: 'Direct Deposit', amount: 4500.0, date: 'Yesterday', time: '9:30 AM', icon: <DollarSign size={16} />, category: 'Income' },
                  { name: 'Netflix', amount: -15.99, date: 'Dec 15', time: '6:45 PM', icon: <CreditCard size={16} />, category: 'Sub' },
                  { name: 'Electric Bill', amount: -120.0, date: 'Dec 14', time: '11:30 AM', icon: <Receipt size={16} />, category: 'Utilities' },
                ].map((transaction, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer border border-transparent hover:border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transaction.amount > 0 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {transaction.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-card-foreground">{transaction.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{transaction.date}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-medium uppercase tracking-wide">
                            {transaction.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${transaction.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-card-foreground'}`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                        Completed
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="premium-card p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-bold text-card-foreground">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-1 gap-3 flex-1">
                {[
                  { icon: <Plus />, label: 'Transfer', desc: 'Send funds securely', color: 'primary' },
                  { icon: <BarChart3 />, label: 'Analytics', desc: 'View detailed reports', color: 'accent' },
                  { icon: <Goal />, label: 'Goals', desc: 'Track your targets', color: 'primary' },
                  { icon: <Target />, label: 'Budget', desc: 'Manage spending', color: 'accent' },
                ].map((action, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <ActionCard
                      icon={action.icon}
                      label={action.label}
                      description={action.desc}
                      delay={i * 0.1}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Promo Card */}
              <div className="mt-6 p-5 rounded-2xl bg-linear-to-br from-primary to-accent relative overflow-hidden group">
                <div className="relative z-10 text-primary-foreground">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Pro Feature</p>
                  <h3 className="text-sm font-heavy mt-1 leading-tight mb-3">AI Financial Insights</h3>
                  <button className="px-4 py-2 bg-background/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-background/30 transition-all text-white">
                    Unlock Now
                  </button>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white/20 rounded-full w-24 h-24 blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
