"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";

export default function NotificationsPage() {
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
  }, [page, filter]);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
      );
    } catch {
      console.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
      );
    } catch {
      console.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      console.error("Failed to delete notification");
    }
  };

  return (
    <div className="min-h-full bg-background p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-xl font-medium tracking-tight text-foreground flex items-center gap-2">
                  Notifications
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </h1>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Real-time activity stream
                </p>
              </div>

              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex items-center justify-between bg-muted/50 p-1.5 rounded-lg border border-border">
          <div className="flex gap-1">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              className="text-xs"
            >
              All Events
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setFilter("unread");
                setPage(1);
              }}
              className="text-xs"
            >
              Unread
              {notifications.some((n) => !n.read_at) && (
                <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </div>
          <div className="px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {meta ? `${meta.total} Total` : `${notifications.length} Priority`}
          </div>
        </div>

        {/* Notification Stream */}
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {loading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-2 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  ))
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Inbox className="text-muted-foreground" size={20} />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">
                    No New Activity
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    You are caught up with all tasks.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isUnread = !notif.read_at;
                  return (
                    <div
                      key={notif.id}
                      className="flex gap-4 p-4 border-b border-border last:border-b-0"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isUnread
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Bell size={14} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <p
                            className={`text-sm leading-snug break-words ${
                              isUnread
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notif.data.message}
                          </p>

                          <div className="flex items-center gap-1 shrink-0">
                            {isUnread && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markAsRead(notif.id)}
                                className="text-emerald-600 hover:text-emerald-700 h-8 w-8"
                                title="Mark Read"
                              >
                                <Check size={14} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification(notif.id)}
                              className="text-destructive hover:text-destructive h-8 w-8"
                              title="Dismiss"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                            <Clock size={10} />
                            {formatDistanceToNow(new Date(notif.created_at), {
                              addSuffix: true,
                            })}
                          </div>

                          {notif.data.invoice_id && (
                            <Link
                              href={`/invoices/${notif.data.invoice_id}`}
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline underline-offset-2 uppercase tracking-wide"
                            >
                              INV-REF <ExternalLink size={10} />
                            </Link>
                          )}

                          {notif.data.entity_type === "quotation" && (
                            <Link
                              href={`/jobs/${notif.data.entity_id}`}
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline underline-offset-2 uppercase tracking-wide"
                            >
                              JOB-REF <ExternalLink size={10} />
                            </Link>
                          )}

                          {notif.data.entity_type === "bill" && (
                            <Link
                              href={`/contractor-bills`}
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline underline-offset-2 uppercase tracking-wide"
                            >
                              BILL-REF <ExternalLink size={10} />
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
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
              {meta.current_page} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page === meta.last_page}
              onClick={() => setPage((prev) => prev + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
