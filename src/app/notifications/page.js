"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  Trash2,
  Clock,
  Inbox,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(
    async (pageNumber = 1, currentFilter = filter) => {
      try {
        setLoading(true);
        const endpoint =
          currentFilter === "unread"
            ? "/notifications/unread"
            : "/notifications";
        const res = await api.get(`${endpoint}?page=${pageNumber}`);

        if (currentFilter === "unread") {
          setNotifications(res.data || []);
          setMeta(null);
        } else {
          setNotifications(res.data.data || []);
          setMeta({
            current_page: res.data.current_page,
            last_page: res.data.last_page,
            total: res.data.total,
          });
        }
      } catch (e) {
        console.error("Failed to fetch notifications", e);
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    fetchNotifications(page, filter);
  }, [page, filter, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#020617] transition-colors duration-500">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        {/* Header - Compact & Professional */}
        <header className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Notifications
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            </h1>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Real-time activity stream
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary/50 transition-all shadow-sm active:scale-95"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Clear All
          </button>
        </header>

        {/* Filters - High Density */}
        <div className="flex items-center justify-between mb-6 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
          <div className="flex gap-1">
            <button
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              className={`px-5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                filter === "all"
                  ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => {
                setFilter("unread");
                setPage(1);
              }}
              className={`px-5 py-1.5 rounded-xl text-[11px] font-bold transition-all relative ${
                filter === "unread"
                  ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Unread
              {notifications.some((n) => !n.read_at) && (
                <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </button>
          </div>
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {meta ? `${meta.total} Total` : `${notifications.length} Priority`}
          </div>
        </div>

        {/* Notification Stream */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 pointer-events-none" />

          <div className="space-y-4 relative">
            {loading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse px-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                    </div>
                  </div>
                ))
            ) : notifications.length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Inbox
                    className="text-slate-300 dark:text-slate-600"
                    size={24}
                  />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No New Activity
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  You're caught up with all tasks.
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {notifications.map((notif) => {
                  const isUnread = !notif.read_at;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={notif.id}
                      className={`group relative pl-12 pr-4 py-1 transition-all duration-300`}
                    >
                      {/* Timeline Dot/Icon */}
                      <div
                        className={`absolute left-0 top-1.5 w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 border-white dark:border-[#020617] transition-all duration-300 ${
                          isUnread
                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                        }`}
                      >
                        <Bell
                          size={14}
                          className={isUnread ? "animate-pulse" : ""}
                        />
                      </div>

                      <div
                        className={`p-4 rounded-2xl transition-all duration-300 border ${
                          isUnread
                            ? "bg-white dark:bg-slate-900 border-primary/10 shadow-[0_8px_20px_rgba(0,180,235,0.06)] ring-1 ring-primary/5"
                            : "bg-transparent border-transparent hover:bg-white dark:hover:bg-slate-900/40"
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-4">
                            <p
                              className={`text-[13px] leading-snug break-words ${
                                isUnread
                                  ? "font-bold text-slate-800 dark:text-white"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {notif.data.message}
                            </p>

                            {/* Inline Actions - Hover Reveal */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                              {isUnread && (
                                <button
                                  onClick={() => markAsRead(notif.id)}
                                  className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                  title="Mark Read"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notif.id)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                title="Dismiss"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                              <Clock size={10} />
                              {formatDistanceToNow(new Date(notif.created_at), {
                                addSuffix: true,
                              })}
                            </div>

                            {notif.data.invoice_id && (
                              <Link
                                href={`/invoices/${notif.data.invoice_id}`}
                                className="inline-flex items-center gap-1 text-[10px] font-black text-primary hover:underline underline-offset-2 uppercase tracking-wide"
                              >
                                INV-REF <ExternalLink size={10} />
                              </Link>
                            )}

                            {notif.data.entity_type === "quotation" && (
                              <Link
                                href={`/jobs/${notif.data.entity_id}`}
                                className="inline-flex items-center gap-1 text-[10px] font-black text-[#6366f1] hover:underline underline-offset-2 uppercase tracking-wide"
                              >
                                JOB-REF <ExternalLink size={10} />
                              </Link>
                            )}

                            {notif.data.entity_type === "bill" && (
                              <Link
                                href={`/contractor-bills`}
                                className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500 hover:underline underline-offset-2 uppercase tracking-wide"
                              >
                                BILL-REF <ExternalLink size={10} />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Pagination - Minimal */}
        {meta && meta.last_page > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:text-primary transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {meta.current_page} / {meta.last_page}
            </span>
            <button
              disabled={page === meta.last_page}
              onClick={() => setPage((prev) => prev + 1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:text-primary transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
