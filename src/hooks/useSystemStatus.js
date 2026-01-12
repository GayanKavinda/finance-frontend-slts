"use client";

import { useState, useEffect } from "react";

export default function useSystemStatus() {
  const [state, setState] = useState({
    metrics: {
      serverLoad: 24, // Percentage
      dbLatency: 12, // ms
      memoryUsage: 45, // Percentage
      activeSessions: 128, // Count
      status: "operational", // operational, degraded, critical
    },
    alerts: [],
  });

  useEffect(() => {
    const generateMetrics = () => {
      setState((prev) => {
        // Simulate random fluctuations
        const loadChange = Math.random() > 0.5 ? 2 : -2;
        const latencyChange = Math.random() > 0.5 ? 5 : -3;
        const memoryChange = Math.random() > 0.5 ? 1 : -1;

        let newLoad = Math.max(
          10,
          Math.min(95, prev.metrics.serverLoad + loadChange)
        );
        let newLatency = Math.max(
          5,
          Math.min(200, prev.metrics.dbLatency + latencyChange)
        );
        let newMemory = Math.max(
          20,
          Math.min(90, prev.metrics.memoryUsage + memoryChange)
        );

        // Determine System Status
        let status = "operational";
        let newAlerts = [];

        if (newLoad > 80) {
          status = "critical";
          newAlerts.push({
            id: "load-high-" + Date.now(),
            title: "High Server Load",
            description: `CPU usage is running high at ${newLoad}%.`,
            type: "error",
            time: "Just now",
            latency: Math.floor(Math.random() * 40) + 10, // Generate it here!
          });
        } else if (newLoad > 60) {
          status = "degraded";
        }

        if (newLatency > 100) {
          if (status !== "critical") status = "degraded";
          newAlerts.push({
            id: "latency-high",
            title: "Database Latency",
            description: `Query response time increased to ${newLatency}ms.`,
            type: "warning",
            time: "Just now",
          });
        }

        if (newMemory > 85) {
          status = "critical";
          newAlerts.push({
            id: "mem-high",
            title: "Memory Warning",
            description: `Server memory usage at ${newMemory}%.`,
            type: "warning",
            time: "Just now",
          });
        }

        // Always keep a default "System OK" if no alerts
        if (newAlerts.length === 0) {
          // Random operational messages occasionally
          if (Math.random() > 0.95) {
            newAlerts.push({
              id: "sys-ok-" + Date.now(),
              title: "System Optimized",
              description: "Maintenance tasks completed successfully.",
              type: "success",
              time: "1m ago",
            });
          }
        }

        // Preserve previous alerts if no new ones, unless we want to clear them.
        // Logic: If we have new critical alerts, show them. If we have nothing, maybe show "System OK" or keep old ones?
        // Let's stick to the previous logic: "keep alive" if newAlerts is empty, but be careful not to keep stale "high load" alerts if load is now low.
        // ACTUALLY, for a real-time status, if there are NO issues, the alerts list should essentially be empty or show "All Systems Operational".
        // The previous bug attempt tried to keep `prev.alerts`.
        // Let's simply use newAlerts. If it's empty, the UI handles "All systems operational".
        // BUT, if we want to be less "flickery", we might want to keep alerts for at least a few seconds.
        // For simplicity and fixing the crash, let's just return `newAlerts`.
        // If we want random "System Optimized" messages to persist, we can rely on the probability check.
        // However, to replicate the INTENTION of the previous buggy code (keeping previous alerts if no new ones?):
        // The previous code `newAlerts.length > 0 ? newAlerts : prev.alerts` meant: if we generated alerts this tick, use them. If not, keep showing the old ones.
        // This is safe NOW because 'prev' contains 'alerts'.

        const finalAlerts = newAlerts.length > 0 ? newAlerts : prev.alerts;

        return {
          metrics: {
            serverLoad: newLoad,
            dbLatency: newLatency,
            memoryUsage: newMemory,
            activeSessions:
              prev.metrics.activeSessions + (Math.random() > 0.5 ? 1 : -1),
            status,
          },
          alerts: finalAlerts,
        };
      });
    };

    const interval = setInterval(generateMetrics, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return state;
}
