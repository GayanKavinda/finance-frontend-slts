"use client";

import { useState, useEffect } from "react";
import {
  Inbox,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Check,
  Trash2,
  Clock,
} from "lucide-react";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/Card";
import { getNotificationIcon } from "@/lib/notificationMeta";
import { useTranslation } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationsContext";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { markAsRead, markAllAsRead, remove, reloadKey } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const endpoint =
          filter === "unread"
            ? "/notifications/unread"
            : "/notifications";
        const res = await api.get(`${endpoint}?page=${page}`);

        if (!cancelled) {
          if (filter === "unread") {
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
        }
      } catch {
        console.error("Failed to fetch notifications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page, filter, reloadKey]);

  // Shared-store actions — every surface (navbar badge, this page) updates instantly.
  const handleMarkAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
    );
    await markAllAsRead();
  };

  const handleDelete = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await remove(id);
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const getHref = (notif) => {
    const d = notif.data || {};
    if (d.entity_type === "quotation") return `/jobs/${d.entity_id}`;
    if (d.entity_type === "bill") return "/contractor-bills";
    if (d.invoice_id) return `/invoices/${d.invoice_id}`;
    return null;
  };

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
      {/* Zen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-widest mb-2">
            {t("Activity Feed")}
          </div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {t("Notifications")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} ${t("unread updates in your workflow feed")}`
              : t("You are all caught up with workflow updates")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 gap-1.5 text-xs shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {t("Mark all read")}
            </Button>
          )}
        </div>
      </div>

      {/* Compact filter pills */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={`px-2.5 py-1 text-[10px] rounded-md font-medium transition-colors whitespace-nowrap ${
                filter === f.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t(f.label)}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {meta ? `${meta.total} ${t("total")}` : `${notifications.length} ${t("unread")}`}
        </span>
      </div>

      {/* Notification stream */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {loading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-3 px-4 py-3 animate-pulse border-b border-border last:border-b-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                ))
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2.5">
                  <Inbox className="text-muted-foreground" size={18} />
                </div>
                  <h3 className="text-xs font-medium text-foreground">
                    {filter === "unread" ? t("No unread notifications") : t("No notifications yet")}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {filter === "unread"
                      ? t("New workflow updates will appear here")
                      : t("Workflow updates will appear here")}
                  </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.read_at;
                const meta_ = getNotificationIcon(notif.data?.action);
                const Icon = meta_.icon;
                const href = getHref(notif);

                return (
                  <div
                    key={notif.id}
                    className={`group flex gap-3 px-4 py-2.5 border-b border-border last:border-b-0 transition-colors ${
                      isUnread ? "bg-primary/[0.04]" : "hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${meta_.bgClass}`}
                    >
                      <Icon className={`w-4 h-4 ${meta_.iconClass}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <p
                          className={`text-xs leading-snug break-words ${
                            isUnread
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {notif.data?.message}
                        </p>

                        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-muted transition-colors"
                              title="Mark read"
                            >
                              <Check size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notif.id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notif.created_at), {
                            addSuffix: true,
                          })}
                        </span>

                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}

                        {href && (
                          <Link
                            href={href}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            {t("View")}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            {meta.current_page} / {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={page === meta.last_page}
            onClick={() => setPage((prev) => prev + 1)}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
