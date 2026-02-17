"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Database,
  Server,
  Cpu,
  Search,
  Filter,
  Download,
  Pause,
  Play,
  Terminal,
  Clock,
  ChevronRight,
  ShieldCheck,
  RefreshCcw,
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
import useSystemStatus from "@/hooks/useSystemStatus";
import Breadcrumb from "@/components/Breadcrumb";

export default function SystemLogsPage() {
  const { metrics, alerts } = useSystemStatus();
  const [isLive, setIsLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated historical data for the mini-charts
  const chartData = useMemo(
    () => [
      { time: "14:00", load: 20, latency: 15 },
      { time: "14:05", load: 35, latency: 22 },
      { time: "14:10", load: metrics.serverLoad, latency: metrics.dbLatency },
    ],
    [metrics],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* TOP BAR: Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "System Monitor" },
            ]}
          />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Terminal size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              System Infrastructure
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
              <div
                className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${
                  isLive ? "animate-pulse" : ""
                }`}
              />
              Live
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border border-border bg-card hover:bg-muted transition-colors cursor-pointer"
          >
            {isLive ? <Pause size={14} /> : <Play size={14} />}
            {isLive ? "Pause Stream" : "Resume Stream"}
          </button>
          <button className="p-2 rounded-lg border border-border bg-card hover:bg-muted cursor-pointer">
            <Download size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* METRICS GRID: High Density Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="CPU Utilization"
          value={`${metrics.serverLoad}%`}
          icon={Cpu}
          color="text-blue-500"
          data={chartData}
          dataKey="load"
        />
        <MetricCard
          label="Database Latency"
          value={`${metrics.dbLatency}ms`}
          icon={Database}
          color="text-amber-500"
          data={chartData}
          dataKey="latency"
        />
        <MetricCard
          label="Memory Usage"
          value={`${metrics.memoryUsage}%`}
          icon={Server}
          color="text-purple-500"
          progress={metrics.memoryUsage}
        />
        <MetricCard
          label="Active Sessions"
          value={metrics.activeSessions}
          icon={Activity}
          color="text-emerald-500"
          status="Stable"
        />
      </div>

      {/* MAIN CONTENT: Logs & Search */}
      <div className="premium-card overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Search logs (e.g. database, high load)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border border-border bg-background hover:bg-muted transition-colors cursor-pointer">
              <Filter size={14} /> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:opacity-90 transition-all cursor-pointer">
              <RefreshCcw size={14} /> Clear Logs
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border">
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Level</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Message</th>
                <th className="px-6 py-3">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <ShieldCheck
                      size={40}
                      className="mx-auto text-emerald-500/20 mb-3"
                    />
                    <p className="text-sm text-muted-foreground italic">
                      No anomalies detected in the current stream.
                    </p>
                  </td>
                </tr>
              ) : (
                alerts.map((alert, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={alert.id + idx}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={12} /> {alert.time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          alert.type === "error"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : alert.type === "warning"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        }`}
                      >
                        {alert.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-foreground/80">
                      {alert.title.split(" ")[0]}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground group-hover:text-foreground transition-colors max-w-md">
                      {alert.description}
                    </td>
                    <td className="px-6 py-4 text-xs text-right font-bold text-muted-foreground">
                      {alert.latency ? `${alert.latency}ms` : "--"}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sub-component for Metric Cards
function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  data,
  dataKey,
  progress,
  status,
}) {
  return (
    <div className="premium-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-card border border-border ${color}`}>
          <Icon size={18} />
        </div>
        {status && (
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
            {status}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </p>
        <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
      </div>

      {/* Small visualization based on type */}
      {data ? (
        <div className="h-10 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="currentColor"
                fill="currentColor"
                fillOpacity={0.1}
                className={color}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : progress ? (
        <div className="h-1 w-full bg-muted rounded-full mt-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full ${color.replace("text", "bg")}`}
          />
        </div>
      ) : null}
    </div>
  );
}
