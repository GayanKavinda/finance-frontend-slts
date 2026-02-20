"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";

export default function useSystemStatus(paused = false) {
  const [state, setState] = useState({
    metrics: {
      serverLoad: 0,
      dbLatency: 0,
      memoryUsage: 0,
      activeSessions: 0,
      status: "operational",
    },
    alerts: [],
    history: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (paused) return;
      try {
        const [metricsRes, logsRes] = await Promise.all([
          axios.get("/system/metrics"),
          axios.get("/system/logs"),
        ]);
        // ... (rest of the logic inside setState)

        setState((prev) => {
          const newMetrics = metricsRes.data;
          const newEntry = {
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            load: newMetrics.serverLoad,
            latency: newMetrics.dbLatency,
            memory: newMetrics.memoryUsage,
          };

          return {
            metrics: newMetrics,
            alerts: logsRes.data,
            history: [...(prev.history || []), newEntry].slice(-20),
          };
        });
      } catch (error) {
        console.error("Failed to fetch system status:", error);
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [paused]);

  return state;
}
