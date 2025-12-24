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

// Color Palette Constants
const COLORS = {
  primary: {
    DEFAULT: '#14b8a6', // Teal 500
    glow: 'rgba(20, 184, 166, 0.4)',
  },
  secondary: {
    DEFAULT: '#06b6d4', // Cyan 500
    glow: 'rgba(6, 182, 212, 0.3)',
  },
  tertiary: {
    DEFAULT: '#6366f1', // Indigo 500
    glow: 'rgba(99, 102, 241, 0.3)',
  },
  accent: {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
    info: '#06b6d4',
  }
};

// Mock data for charts
const monthlyExpenses = [
  { month: 'Jul', income: 4200, expenses: 2800, savings: 1400 },
  { month: 'Aug', income: 4500, expenses: 3100, savings: 1400 },
  { month: 'Sep', income: 4300, expenses: 2900, savings: 1400 },
  { month: 'Oct', income: 4600, expenses: 3200, savings: 1400 },
  { month: 'Nov', income: 4800, expenses: 3400, savings: 1400 },
  { month: 'Dec', income: 5200, expenses: 3600, savings: 1600 },
];

const categoryData = [
  { name: 'Housing', value: 920, color: COLORS.tertiary.DEFAULT },
  { name: 'Food', value: 850, color: COLORS.primary.DEFAULT },
  { name: 'Transport', value: 420, color: COLORS.secondary.DEFAULT },
  { name: 'Shopping', value: 680, color: COLORS.accent.success },
  { name: 'Entertainment', value: 340, color: COLORS.accent.warning },
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

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 1500, prefix = '$' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <span>
      {prefix}{count.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
};


// Chart Card Component
const ChartCard = ({ title, subtitle, children, delay, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative"
  >
    <div className="premium-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {action && (
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
            <MoreVertical className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          </button>
        )}
      </div>
      {children}
    </div>
  </motion.div>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0c0e12]/90 backdrop-blur-xl border border-primary/20 p-4 rounded-2xl shadow-2xl shadow-primary/10">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }} />
                <span className="text-sm font-semibold text-foreground/80">{entry.name}</span>
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


// Progress Bar Component
const ProgressBar = ({ label, percentage, current, target, color, delay }) => (
  <div className="space-y-2.5">
    <div className="flex justify-between items-end">
      <div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-lg font-bold text-foreground">${current.toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground font-medium">/ ${target.toLocaleString()}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm font-black italic tracking-tighter" style={{ color, textShadow: `0 0 10px ${color}40` }}>
          {percentage}%
        </span>
      </div>
    </div>
    <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, delay, ease: "circOut" }}
        className="absolute inset-y-0 left-0 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        style={{ 
          background: `linear-gradient(90deg, ${color}40, ${color})`,
          boxShadow: `0 0 15px ${color}40`
        }}
      />
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </div>
  </div>
);

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground animate-pulse">Syncing your data...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5 mb-3"
            >
              <div className="p-2 rounded-xl brand-gradient shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Personal Dashboard</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Welcome back, <span className="gradient-text italic">
                {user.name.split(' ')[0]}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mt-3 max-w-xl leading-relaxed">
              Your finances are looking <span className="text-emerald-400 font-bold">solid</span>. You saved 12% more than last month.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 text-sm font-bold text-foreground bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-md active:scale-95 shadow-xl">
              <Download className="w-4 h-4 text-muted-foreground" />
              Reporting
            </button>
            <button className="px-6 py-3 text-sm font-bold text-white brand-gradient rounded-2xl hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all flex items-center gap-3 active:scale-95 shadow-2xl shadow-primary/20">
              <Plus className="w-4 h-4" />
              Quick Deposit
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Wallet className="w-5 h-5" />}
            title="Total Balance"
            value={12450.00}
            change={5.2}
            changeLabel="vs last month"
            delay={0.1}
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5" />}
            title="Monthly Expenses"
            value={3210.00}
            change={-2.4}
            changeLabel="vs last month"
            delay={0.2}
          />
          <StatCard
            icon={<PiggyBank className="w-5 h-5" />}
            title="Total Savings"
            value={6000.00}
            change={8.5}
            changeLabel="vs last month"
            delay={0.3}
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            title="Savings Goal"
            value={8000.00}
            delay={0.4}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expenses Area Chart */}
          <ChartCard
            title="Financial Performance"
            subtitle="Income & expenses over time"
            delay={0.5}
            action
          >
            <div className="h-72 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyExpenses}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#14b8a6" 
                    fillOpacity={1} 
                    fill="url(#colorIncome)"
                    strokeWidth={4}
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#f43f5e" 
                    fillOpacity={1} 
                    fill="url(#colorExpenses)"
                    strokeWidth={4}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Spending by Category Pie Chart */}
          <ChartCard
            title="Spending Breakdown"
            subtitle="Distribution by category"
            delay={0.6}
            action
          >
            <div className="h-72 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        style={{ filter: `drop-shadow(0 0 8px ${entry.color}40)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingLeft: '30px', fontSize: '13px', color: '#f8fafc', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Weekly Spending Bar Chart */}
          <ChartCard
            title="Weekly Activity"
            subtitle="Daily spending habits"
            delay={0.7}
            action
          >
            <div className="h-72 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySpending}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    fill="url(#barGradient)" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={50}
                    animationDuration={1500}
                  >
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Savings Progress */}
          <ChartCard
            title="Financial Targets"
            subtitle="Track your progress"
            delay={0.8}
            action
          >
            <div className="space-y-7 py-4">
              <ProgressBar
                label="Emergency Fund"
                percentage={75}
                current={6000}
                target={8000}
                color="#14b8a6"
                delay={0.1}
              />
              <ProgressBar
                label="Vacation 2026"
                percentage={45}
                current={2250}
                target={5000}
                color="#f43f5e"
                delay={0.3}
              />
              <ProgressBar
                label="Retirement"
                percentage={30}
                current={6000}
                target={20000}
                color="#6366f1"
                delay={0.5}
              />
            </div>
          </ChartCard>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-4">
            <div className="glass-card p-6 h-full">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4">
                <ActionCard
                  icon={<Plus className="w-5 h-5" />}
                  label="New Transaction"
                  description="Add a manual entry"
                  delay={0.1}
                />
                <ActionCard
                  icon={<BarChart3 className="w-5 h-5" />}
                  label="Reports"
                  description="Analyze your spending"
                  delay={0.2}
                />
                <ActionCard
                  icon={<Goal className="w-5 h-5" />}
                  label="Set Goals"
                  description="Plan your future"
                  delay={0.3}
                />
                <ActionCard
                  icon={<Calculator className="w-5 h-5" />}
                  label="Budgeting"
                  description="Plan your month"
                  delay={0.4}
                />
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-8">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Recent Activity</h2>
                </div>
                <button className="flex items-center gap-1 text-xs font-bold text-primary hover:opacity-80 transition-opacity">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {[
                  { name: 'Grocery Store', amount: -85.42, date: 'Today', time: '2:30 PM', icon: <Receipt size={18} />, category: 'Food' },
                  { name: 'Salary Deposit', amount: 4500.0, date: 'Yesterday', time: '9:00 AM', icon: <DollarSign size={18} />, category: 'Income' },
                  { name: 'Netflix', amount: -15.99, date: 'Dec 15', time: '6:45 PM', icon: <CreditCard size={18} />, category: 'Entertainment' },
                  { name: 'Electric Bill', amount: -120.0, date: 'Dec 14', time: '11:30 AM', icon: <Receipt size={18} />, category: 'Utilities' },
                ].map((transaction, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                        transaction.amount > 0 ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10' : 'bg-red-500/10 text-red-500 shadow-red-500/10'
                      }`}>
                        {transaction.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{transaction.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[12px] text-muted-foreground">{transaction.date} • {transaction.time}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 text-muted-foreground uppercase font-bold tracking-tight">
                            {transaction.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-bold ${transaction.amount > 0 ? 'text-emerald-500' : ''}`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-widest mt-0.5">
                        {transaction.amount > 0 ? 'Credit' : 'Debit'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
