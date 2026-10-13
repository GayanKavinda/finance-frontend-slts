// src/contexts/NotificationsContext.jsx
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

const NotificationsContext = createContext({
  unreadCount: 0,
  reloadKey: 0,
  browserAlerts: false,
  browserPermission: "default",
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  remove: async () => {},
  requestBrowserAlerts: async () => "default",
  refreshUnread: async () => {},
});

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [browserAlerts, setBrowserAlerts] = useState(false);
  const [browserPermission, setBrowserPermission] = useState("default");
  const prevCountRef = useRef(0);
  const firstFetchRef = useRef(true);

  /* ── Browser Notification API helpers ─────────────────────── */
  const syncPermission = useCallback(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    setBrowserPermission(Notification.permission);
    return Notification.permission;
  }, []);

  const fireBrowserNotification = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (!browserAlerts) return;
    try {
      const res = await api.get("/notifications?page=1");
      const latest = res.data?.data?.[0];
      if (!latest) return;
      const notification = new Notification("SLT ProcureX", {
        body: latest.data?.message || "You have a new notification",
        icon: "/icons/slt_digital_icon.png",
        tag: latest.id,
      });
      notification.onclick = () => {
        window.focus();
        const d = latest.data || {};
        window.location.href =
          d.entity_type === "quotation"
            ? `/jobs/${d.entity_id}`
            : d.entity_type === "bill"
              ? "/contractor-bills"
              : d.invoice_id
                ? `/invoices/${d.invoice_id}`
                : "/notifications";
      };
    } catch {
      /* browser notifications are best-effort */
    }
  }, [browserAlerts]);

  const refreshUnread = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications/unread-count");
      const next = res.data?.unread_count ?? 0;

      if (!firstFetchRef.current && next > prevCountRef.current) {
        // A genuinely new notification arrived — surface it as a desktop alert.
        fireBrowserNotification();
      }
      firstFetchRef.current = false;
      prevCountRef.current = next;
      setUnreadCount(next);
    } catch {
      /* badge is best-effort */
    }
  }, [user, fireBrowserNotification]);

  // Load the user's saved notification preferences (drives browser alerts).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/notification-preferences");
        if (!cancelled) setBrowserAlerts(!!res.data?.browser_alerts);
      } catch {
        /* defaults to off */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) syncPermission();
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [syncPermission]);

  // Poll the lightweight count endpoint for the whole app session.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      if (!user) {
        setUnreadCount(0);
        return;
      }
      await refreshUnread();
    };
    run();
    const interval = setInterval(run, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, refreshUnread]);

  /** Invalidate every mounted consumer (navbar dropdown, notifications page). */
  const bump = useCallback(() => setReloadKey((k) => k + 1), []);

  const markAsRead = useCallback(
    async (id) => {
      try {
        await api.post(`/notifications/${id}/read`);
        await refreshUnread();
        bump();
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    [refreshUnread, bump],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post("/notifications/read-all");
      setUnreadCount(0);
      prevCountRef.current = 0;
      bump();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, [bump]);

  const remove = useCallback(
    async (id) => {
      try {
        await api.delete(`/notifications/${id}`);
        await refreshUnread();
        bump();
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    [refreshUnread, bump],
  );

  /**
   * Enable browser/desktop alerts: asks the browser for notification
   * permission first. Returns the resulting permission state.
   */
  const requestBrowserAlerts = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    let permission = Notification.permission;
    if (permission === "default") {
      try {
        permission = await Notification.requestPermission();
      } catch {
        permission = "denied";
      }
    }
    setBrowserPermission(permission);
    return permission;
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        unreadCount,
        reloadKey,
        browserAlerts,
        browserPermission,
        markAsRead,
        markAllAsRead,
        remove,
        requestBrowserAlerts,
        refreshUnread,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
