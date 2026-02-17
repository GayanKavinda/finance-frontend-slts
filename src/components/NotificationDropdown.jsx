// src/components/NotificationDropdown.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Clock, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

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
      // Filter unread from the page (this is a simple implementation)
      setUnreadCount(res.data.data?.filter(n => !n.read_at).length || 0);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds (simple real-time)
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
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px]">
                    {unreadCount} New
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Inbox className="text-slate-300" size={20} />
                  </div>
                  <p className="text-sm text-slate-400">All caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 relative group ${!notif.read_at ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                          notif.data.action === 'rejected' ? 'bg-red-100 text-red-600' : 
                          notif.data.action === 'approved' ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <Clock size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`text-xs leading-relaxed ${!notif.read_at ? "font-bold text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}>
                              {notif.data.message}
                            </p>
                            {!notif.read_at && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-all"
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                          </p>
                          {notif.data.invoice_id && (
                            <Link
                              href={`/invoices/${notif.data.invoice_id}`}
                              onClick={() => {
                                setIsOpen(false);
                                if (!notif.read_at) markAsRead(notif.id);
                              }}
                              className="inline-block mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
                            >
                              View Invoice
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/30 dark:bg-slate-900/30">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-primary transition-colors"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
