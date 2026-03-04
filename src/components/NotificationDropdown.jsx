// src/components/NotificationDropdown.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Inbox,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

// Notification type configuration with refined colors
const getNotificationConfig = (action) => {
  switch (action) {
    case "approved":
    case "completed":
    case "success":
      return {
        icon: CheckCircle2,
        bgClass: "bg-emerald-50 dark:bg-emerald-500/15",
        iconClass: "text-emerald-600 dark:text-emerald-400",
        borderClass: "border-emerald-100 dark:border-emerald-500/20",
      };
    case "rejected":
    case "error":
    case "failed":
      return {
        icon: AlertCircle,
        bgClass: "bg-red-50 dark:bg-red-500/15",
        iconClass: "text-red-500 dark:text-red-400",
        borderClass: "border-red-100 dark:border-red-500/20",
      };
    case "warning":
    case "pending":
      return {
        icon: AlertTriangle,
        bgClass: "bg-amber-50 dark:bg-amber-500/15",
        iconClass: "text-amber-500 dark:text-amber-400",
        borderClass: "border-amber-100 dark:border-amber-500/20",
      };
    case "info":
    case "created":
    case "updated":
    default:
      return {
        icon: Info,
        bgClass: "bg-sky-50 dark:bg-sky-500/15",
        iconClass: "text-sky-500 dark:text-sky-400",
        borderClass: "border-sky-100 dark:border-sky-500/20",
      };
  }
};

// Notification item component
const NotificationItem = ({ notif, onMarkRead, onClose }) => {
  const config = getNotificationConfig(notif.data?.action);
  const Icon = config.icon;
  const isUnread = !notif.read_at;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`group relative py-3 px-4 transition-colors ${
        isUnread
          ? "bg-slate-50/80 dark:bg-slate-800/40"
          : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`shrink-0 w-9 h-9 rounded-lg ${config.bgClass} border ${config.borderClass} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${config.iconClass}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-[13px] leading-[1.5] text-slate-700 dark:text-slate-300 ${
              isUnread ? "font-medium" : "font-normal"
            }`}
          >
            {notif.data?.message}
          </p>

          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
            </span>

            {/* Action link */}
            {(notif.data?.invoice_id || notif.data?.entity_type) && (
              <Link
                href={
                  notif.data?.entity_type === "quotation"
                    ? `/jobs/${notif.data.entity_id}`
                    : notif.data?.entity_type === "bill"
                    ? "/contractor-bills"
                    : `/invoices/${notif.data.invoice_id}`
                }
                onClick={() => {
                  onClose();
                  if (isUnread) onMarkRead(notif.id);
                }}
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                View
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Unread dot indicator */}
        {isUnread && (
          <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-3" />
        )}
      </div>
    </motion.div>
  );
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.data?.filter((n) => !n.read_at).length || 0);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const unread = notifications.filter((n) => !n.read_at);
  const read = notifications.filter((n) => n.read_at);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          isOpen
            ? "bg-slate-100 dark:bg-slate-800 text-primary"
            : "text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <Bell className="w-5 h-5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1.5 w-[340px] sm:w-[380px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-slate-800 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-primary transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-4/5" />
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Inbox className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No notifications
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    You&apos;re all caught up
                  </p>
                </div>
              ) : (
                <>
                  {/* Unread */}
                  {unread.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30">
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          New
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {unread.map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            notif={notif}
                            onMarkRead={markAsRead}
                            onClose={() => setIsOpen(false)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Earlier */}
                  {read.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30">
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Earlier
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {read.slice(0, 5).map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            notif={notif}
                            onMarkRead={markAsRead}
                            onClose={() => setIsOpen(false)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1 px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              View all notifications
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}