// src/components/NotificationDropdown.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Inbox,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { getNotificationIcon } from "@/lib/notificationMeta";
import { useTranslation } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationsContext";

// Notification item component
const NotificationItem = ({ notif, onMarkRead, onClose }) => {
  const { t } = useTranslation();
  const config = getNotificationIcon(notif.data?.action);
  const Icon = config.icon;
  const isUnread = !notif.read_at;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`group relative py-2.5 px-4 transition-colors ${
        isUnread ? "bg-primary/[0.04]" : "hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`shrink-0 w-8 h-8 rounded-lg ${config.bgClass} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${config.iconClass}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-[12px] leading-[1.5] text-foreground ${
              isUnread ? "font-medium" : "font-normal text-muted-foreground"
            }`}
          >
            {notif.data?.message}
          </p>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
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
                className="inline-flex items-center gap-0.5 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {t("View")}
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Trailing: unread dot + per-item "mark as read" (OK) control */}
        <div className="shrink-0 flex items-center gap-1.5 mt-2">
          {isUnread && (
            <div className="w-2 h-2 rounded-full bg-primary" />
          )}
          {isUnread && (
            <button
              onClick={() => onMarkRead(notif.id)}
              title={t("Mark as read")}
              aria-label={t("Mark as read")}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-muted"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function NotificationDropdown() {
  const { t } = useTranslation();
  const { unreadCount, markAsRead, markAllAsRead, reloadKey } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [freshArrival, setFreshArrival] = useState(false);
  const dropdownRef = useRef(null);
  const prevCountRef = useRef(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Pulse the bell when the shared count grows (new notification arrived).
  useEffect(() => {
    if (unreadCount <= prevCountRef.current) return;
    prevCountRef.current = unreadCount;
    const show = setTimeout(() => setFreshArrival(true), 0);
    const hide = setTimeout(() => setFreshArrival(false), 5000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [unreadCount]);

  // Keep the panel list in sync with the shared store (opens + mutations).
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchNotifications();
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [isOpen, fetchNotifications, reloadKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
  };

  const unread = notifications.filter((n) => !n.read_at);
  const read = notifications.filter((n) => n.read_at);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={
          unreadCount > 0
            ? `${t("Notifications")} (${unreadCount} ${t("Unread")})`
            : t("Notifications")
        }
        className={`relative p-2 rounded-md transition-colors ${
          isOpen
            ? "bg-muted text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-foreground" : ""}`} />

        {/* Unread badge — visible without opening the panel */}
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-[10px] font-medium text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}

        {/* Pulse ring when a new notification arrives */}
        {freshArrival && unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
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
            className="absolute right-0 mt-1.5 w-[340px] sm:w-[380px] bg-popover rounded-xl border border-border shadow-strong z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-foreground">
                  {t("Notifications")}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium">
                    {unreadCount} {t("new")}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {t("Mark all read")}
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 bg-muted rounded w-4/5" />
                        <div className="h-2.5 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Inbox className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("No notifications")}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                    {t("You&apos;re all caught up")}
                  </p>
                </div>
              ) : (
                <>
                  {/* Unread */}
                  {unread.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 bg-muted/50">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {t("New")}
                        </span>
                      </div>
                      <div className="divide-y divide-border">
                        {unread.map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            notif={notif}
                            onMarkRead={handleMarkRead}
                            onClose={() => setIsOpen(false)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Earlier */}
                  {read.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 bg-muted/50">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {t("Earlier")}
                        </span>
                      </div>
                      <div className="divide-y divide-border">
                        {read.slice(0, 5).map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            notif={notif}
                            onMarkRead={handleMarkRead}
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
              className="flex items-center justify-center gap-1 px-4 py-2.5 border-t border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {t("View all notifications")}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
