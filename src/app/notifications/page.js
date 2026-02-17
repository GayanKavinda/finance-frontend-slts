// src/app/notifications/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  Trash2,
  Clock,
  Inbox,
  Filter,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all, unread

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Notifications", href: "/notifications" },
          ]}
        />

        <div className="mt-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <Bell className="text-primary" />
              Notifications
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Stay updated with your invoice workflow and system alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              <CheckCheck size={18} />
              Mark all as read
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
              <button
                onClick={() => {
                  setFilter("all");
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === "all"
                    ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setFilter("unread");
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === "unread"
                    ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Unread
              </button>
            </div>

            <div className="text-xs text-slate-400">
              {meta
                ? `Showing ${notifications.length} of ${meta.total}`
                : `Showing ${notifications.length} unread`}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="p-6 flex gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                    </div>
                  </div>
                ))
            ) : notifications.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  No notifications
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={notif.id}
                  className={`p-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group relative ${!notif.read_at ? "bg-blue-50/30 dark:bg-blue-900/10 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"}`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                        notif.data.action === "rejected"
                          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          : notif.data.action === "approved"
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      <Clock size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p
                          className={`text-sm leading-relaxed ${!notif.read_at ? "font-bold text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}
                        >
                          {notif.data.message}
                        </p>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notif.read_at && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete notification"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDistanceToNow(new Date(notif.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {notif.data.invoice_id && (
                          <Link
                            href={`/invoices/${notif.data.invoice_id}`}
                            className="text-xs font-bold text-primary hover:underline underline-offset-4"
                          >
                            Go to Invoice →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
              <p className="text-xs text-slate-500">
                Page {meta.current_page} of {meta.last_page}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page === meta.last_page}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
