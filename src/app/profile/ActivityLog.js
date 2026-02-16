import { useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import { ShieldCheck, XCircle, Trash2, Activity, History } from "lucide-react";

function SectionHeader({ icon: Icon, title, iconColor = "text-primary" }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-2">
        {Icon && (
          <div
            className={`p-1.5 rounded-lg ${iconColor.replace("text-", "bg-")}/10`}
          >
            <Icon size={18} className={iconColor} />
          </div>
        )}
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div
        className={`h-0.5 w-16 bg-gradient-to-r ${iconColor.replace("text-", "from-").split(" ")[0]} to-transparent rounded-full`}
      ></div>
    </div>
  );
}

export default function ActivityLog() {
  const { enqueueSnackbar } = useSnackbar();

  const [loginHistory, setLoginHistory] = useState([]);
  const [loginPagination, setLoginPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [activeSessions, setActiveSessions] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchSecurityData = useCallback(async (page = 1) => {
    try {
      const [historyRes, sessionsRes] = await Promise.all([
        axios.get(`/api/login-history?page=${page}`),
        axios.get("/api/active-sessions"),
      ]);

      if (page === 1) {
        setLoginHistory(historyRes.data.data);
      } else {
        setLoginHistory((prev) => [...prev, ...historyRes.data.data]);
      }

      setLoginPagination({
        current_page: historyRes.data.current_page,
        last_page: historyRes.data.last_page,
        total: historyRes.data.total || historyRes.data.data?.length || 0,
      });
      setActiveSessions(sessionsRes.data);
    } catch (err) {
      console.error("Failed to fetch security data", err);
    }
  }, []);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  const filterLoginHistory = (history, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return history.filter((login) => {
      const loginDate = new Date(login.created_at);

      // Custom date range filter
      if (filter === "custom" && dateRange.start && dateRange.end) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        end.setHours(23, 59, 59, 999); // Include entire end day
        return loginDate >= start && loginDate <= end;
      }

      switch (filter) {
        case "today":
          return loginDate >= today;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return loginDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return loginDate >= monthAgo;
        case "all":
        default:
          return true;
      }
    });
  };

  const loadMoreHistory = () => {
    const nextPage = loginPagination.current_page + 1;
    if (nextPage <= loginPagination.last_page) {
      fetchSecurityData(nextPage);
    }
  };

  const onDeleteHistoryEntry = async (id) => {
    try {
      await axios.delete(`/api/login-history/${id}`);
      enqueueSnackbar("History entry removed", { variant: "success" });
      setLoginHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      enqueueSnackbar("Failed to remove history entry", { variant: "error" });
    }
  };

  const onRevokeSession = async (id) => {
    try {
      await axios.delete(`/api/revoke-session/${id}`);
      enqueueSnackbar("Session revoked successfully", { variant: "success" });
      fetchSecurityData();
    } catch (err) {
      enqueueSnackbar("Failed to revoke session", { variant: "error" });
    }
  };

  const getActivityStatusMessage = () => {
    const totalLoaded = loginHistory.length;
    const totalCount = loginPagination.total || totalLoaded;

    if (timeFilter === "all") {
      const baseMsg = `Total: ${totalCount} ${
        totalCount === 1 ? "activity" : "activities"
      }`;
      const suffix =
        loginPagination.current_page < loginPagination.last_page
          ? ` (Loaded: ${totalLoaded})`
          : "";
      return baseMsg + suffix;
    }

    const filteredCount = filterLoginHistory(loginHistory, timeFilter).length;
    const countStr = `${filteredCount} ${
      filteredCount === 1 ? "activity" : "activities"
    }`;

    if (timeFilter === "custom" && dateRange.start && dateRange.end) {
      const startStr = new Date(dateRange.start).toLocaleDateString();
      const endStr = new Date(dateRange.end).toLocaleDateString();
      return `${startStr} - ${endStr}: ${countStr}`;
    }

    return `Showing ${countStr} of ${totalLoaded} loaded`;
  };

  return (
    <motion.div
      key="activity"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-6"
    >
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
        {/* Glow effect for dark mode */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 blur-2xl opacity-0 dark:opacity-60"></div>

        <div className="flex items-center justify-between mb-2">
          <SectionHeader
            icon={Activity}
            title="Active Sessions"
            iconColor="text-primary"
          />
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase tracking-wider -mt-6">
            {activeSessions.length} active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeSessions.length > 0 ? (
            activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm group">
                    <ShieldCheck
                      size={18}
                      className="text-emerald-500 transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-200">
                      <span className="truncate max-w-[120px] font-mono text-[11px]">
                        {session.ip_address}
                      </span>
                      {session.is_current && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
                          Active Now
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Last active:{" "}
                      {new Date(session.last_active).toLocaleString()}
                    </div>
                  </div>
                </div>
                {!session.is_current && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onRevokeSession(session.id)}
                    className="group px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-950/20 backdrop-blur-md rounded-xl transition-all duration-300 border border-red-200 dark:border-red-800 hover:bg-red-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Revoke</span>
                  </motion.button>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
              No active sessions found
            </div>
          )}
        </div>
      </div>

      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
        {/* Glow effect for dark mode */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 blur-2xl opacity-0 dark:opacity-60"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <SectionHeader
              icon={History}
              title="Login History"
              iconColor="text-blue-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-4 mb-4">
              {getActivityStatusMessage()}
            </p>
          </div>

          {/* Time Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            {[
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
            ].map((filter) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={filter.value}
                onClick={() => {
                  setTimeFilter(filter.value);
                  setShowDatePicker(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-md ${
                  timeFilter === filter.value
                    ? "bg-primary/20 text-primary border border-primary/40 shadow-lg"
                    : "bg-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-white/20"
                }`}
              >
                {filter.label}
              </motion.button>
            ))}

            {/* Custom Date Range Button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                  if (!showDatePicker) {
                    setTimeFilter("custom");
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-md ${
                  timeFilter === "custom"
                    ? "bg-secondary/20 text-secondary border border-secondary/40 shadow-lg"
                    : "bg-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-white/20"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Custom Range
              </motion.button>

              {/* Date Range Picker Dropdown */}
              {showDatePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 min-w-[280px]"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.start || ""}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, start: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateRange.end || ""}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, end: e.target.value })
                        }
                        min={dateRange.start || ""}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setDateRange({ start: null, end: null });
                          setTimeFilter("all");
                          setShowDatePicker(false);
                        }}
                        className="flex-1 px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      >
                        Clear
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (dateRange.start && dateRange.end) {
                            setTimeFilter("custom");
                            setShowDatePicker(false);
                          }
                        }}
                        disabled={!dateRange.start || !dateRange.end}
                        className="flex-1 px-3 py-2 text-xs font-bold bg-secondary/20 text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="pb-4 pr-4 uppercase text-[10px] tracking-wider whitespace-nowrap">
                  Device / OS
                </th>
                <th className="pb-4 pr-4 uppercase text-[10px] tracking-wider whitespace-nowrap">
                  IP Address
                </th>
                <th className="pb-4 pr-4 uppercase text-[10px] tracking-wider whitespace-nowrap">
                  Date & Time
                </th>
                <th className="pb-4 pr-4 uppercase text-[10px] tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="pb-4 uppercase text-[10px] tracking-wider text-right whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filterLoginHistory(loginHistory, timeFilter).length > 0 ? (
                filterLoginHistory(loginHistory, timeFilter).map((login) => (
                  <tr key={login.id} className="group">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                          {login.platform} ({login.browser})
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      {login.ip_address}
                    </td>
                    <td className="py-4 pr-4 text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(login.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          login.status === "failed"
                            ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {login.status === "failed" ? "Failed" : "Success"}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => onDeleteHistoryEntry(login.id)}
                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm"
                  >
                    No login history found for this time period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Load More Button - Only show when filtering "all" and there are more pages */}
        {timeFilter === "all" &&
          loginPagination.current_page < loginPagination.last_page && (
            <div className="mt-6 text-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadMoreHistory}
                className="group px-6 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white/20 transition-all uppercase tracking-wider cursor-pointer active:shadow-inner"
              >
                <span className="flex items-center gap-2">
                  Load More History
                  <span className="text-xs opacity-60">
                    (Page {loginPagination.current_page} of{" "}
                    {loginPagination.last_page})
                  </span>
                </span>
              </motion.button>
            </div>
          )}

        {/* Message when filtering shows all available results */}
        {timeFilter !== "all" &&
          filterLoginHistory(loginHistory, timeFilter).length > 0 &&
          loginPagination.current_page < loginPagination.last_page && (
            <div className="mt-6 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    Filtering {loginHistory.length} of {loginPagination.total}{" "}
                    activities.
                    <button
                      onClick={() => setTimeFilter("all")}
                      className="ml-1 underline hover:no-underline cursor-pointer font-bold"
                    >
                      Load all
                    </button>{" "}
                    to see complete history.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Success message when all data is loaded and filtered */}
        {timeFilter !== "all" &&
          filterLoginHistory(loginHistory, timeFilter).length > 0 &&
          loginPagination.current_page >= loginPagination.last_page && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg">
                <svg
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Showing all matching activities
                </p>
              </div>
            </div>
          )}
      </div>
    </motion.div>
  );
}
