"use client";

import { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  Bell,
  Shield,
  Monitor,
  Save,
  Loader2,
  User,
  Lock,
  Globe,
  Palette,
  Laptop,
  CheckCircle,
  Trash2,
  ExternalLink,
  Wrench,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { useSnackbar } from "notistack";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useFormat } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "@/lib/axios";
import Link from "next/link";

const TABS = [
  { key: "account", labelKey: "Account", hintKey: "Profile, name & password", icon: User },
  { key: "notifications", labelKey: "Notifications", hintKey: "Email & desktop alerts", icon: Bell },
  { key: "security", labelKey: "Security", hintKey: "2FA, sessions & logins", icon: Shield },
  { key: "appearance", labelKey: "Appearance", hintKey: "Theme, density & region", icon: Palette },
  { key: "system", labelKey: "System", hintKey: "Diagnostics & maintenance", icon: Monitor },
];

const NOTIFICATION_OPTIONS = [
  {
    key: "email_alerts",
    label: "Email Notifications",
    description: "Tenders, POs, approvals, and bills",
    locked: false,
  },
  {
    key: "browser_alerts",
    label: "Browser & Desktop Alerts",
    description: "Desktop pop-up alerts when new workflow updates arrive",
    locked: false,
  },
  {
    key: "critical_alerts",
    label: "Critical Alerts & Overdue Warnings",
    description: "Always on — system and audit safety",
    locked: true,
  },
];

const DEFAULT_NOTIFS = {
  email_alerts: true,
  browser_alerts: true,
  critical_alerts: true,
};

const sameObj = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const empty2faForm = { password: "", mode: null };

export default function SettingsPage() {
  const { user, refetch } = useAuth();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { compact, setDensity, debugMode, setDebugMode, regional, setRegional } =
    usePreferences();
  const { requestBrowserAlerts, browserPermission } = useNotifications();

  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const isDark = theme === "dark" || (theme === "system" && resolvedTheme === "dark");
  const twoFactorEnabled = !!user?.two_factor_enabled;
  const canManageSystem = (user?.permissions || []).includes("manage-system");

  /* ── Draft state — nothing applies until Save is pressed ────── */
  const [accountDraft, setAccountDraft] = useState({ name: "" });
  const [accountBase, setAccountBase] = useState({ name: "" });

  const [notifDraft, setNotifDraft] = useState(DEFAULT_NOTIFS);
  const [notifBase, setNotifBase] = useState(DEFAULT_NOTIFS);
  const [notifsLoaded, setNotifsLoaded] = useState(false);

  const [appearanceDraft, setAppearanceDraft] = useState(null);
  const [regionalDraft, setRegionalDraft] = useState(null);
  const [systemDraft, setSystemDraft] = useState(null);
  const [systemBase, setSystemBase] = useState({
    debugMode: false,
    maintenanceMode: false,
  });
  const [maintenanceLoaded, setMaintenanceLoaded] = useState(false);

  /* Drafts derive from the live contexts until the user edits them, so no
     effect is needed to keep baselines in sync. */
  const appearanceValue = appearanceDraft ?? { darkMode: isDark, compact };
  const regionalValue = regionalDraft ?? regional;
  const debugValue = systemDraft?.debugMode ?? debugMode;
  const maintenanceValue = systemDraft?.maintenanceMode ?? systemBase.maintenanceMode;

  /* ── Loaded baselines ─────────────────────────────────────── */
  // Account profile (adjust during render — no cascading effect)
  const [syncedUserId, setSyncedUserId] = useState(null);
  if (user && user.id !== syncedUserId) {
    setSyncedUserId(user.id);
    setAccountDraft({ name: user.name || "" });
    setAccountBase({ name: user.name || "" });
  }

  // Fetch notification preferences + maintenance status from the API
  useEffect(() => {
    if (activeTab !== "notifications" && activeTab !== "system") return;

    let cancelled = false;

    if (activeTab === "notifications" && !notifsLoaded) {
      (async () => {
        try {
          const res = await axios.get("/notification-preferences");
          if (cancelled) return;
          const loaded = {
            email_alerts: !!res.data.email_alerts,
            browser_alerts: !!res.data.browser_alerts,
            critical_alerts: true,
          };
          setNotifDraft(loaded);
          setNotifBase(loaded);
          setNotifsLoaded(true);
        } catch {
          if (!cancelled) {
            enqueueSnackbar(t("Failed to load notification preferences"), {
              variant: "error",
            });
          }
        }
      })();
    }

    if (activeTab === "system" && !maintenanceLoaded) {
      (async () => {
        try {
          const res = await axios.get("/system/maintenance-status");
          if (cancelled) return;
          setSystemBase((p) => ({ ...p, maintenanceMode: !!res.data.maintenance_mode }));
          setMaintenanceLoaded(true);
        } catch {
          /* status is informational — ignore failures */
        }
      })();
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, notifsLoaded, maintenanceLoaded]);

  /* ── Dirty tracking per tab ───────────────────────────────── */
  const dirty = {
    account: !sameObj(accountDraft, accountBase),
    notifications: !sameObj(notifDraft, notifBase),
    appearance:
      (appearanceDraft !== null &&
        !sameObj(appearanceDraft, { darkMode: isDark, compact })) ||
      (regionalDraft !== null && !sameObj(regionalDraft, regional)),
    system:
      (systemDraft?.debugMode !== undefined && systemDraft.debugMode !== debugMode) ||
      (systemDraft?.maintenanceMode !== undefined &&
        systemDraft.maintenanceMode !== systemBase.maintenanceMode),
    security: false,
  };
  const isDirty = !!dirty[activeTab];

  /* ── Security — sessions & login history ──────────────────── */
  const [activeSessions, setActiveSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [twoFactorForm, setTwoFactorForm] = useState(empty2faForm);
  const [twoFactorSaving, setTwoFactorSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const loadSecurityData = useCallback(async () => {
    setLoadingSecurity(true);
    try {
      const [sessRes, histRes] = await Promise.allSettled([
        axios.get("/active-sessions"),
        axios.get("/login-history"),
      ]);
      if (sessRes.status === "fulfilled") setActiveSessions(sessRes.value.data || []);
      if (histRes.status === "fulfilled") {
        const histData = histRes.value.data;
        setLoginHistory(histData?.data || histData || []);
      }
    } catch (err) {
      console.error("Failed to load security audit data", err);
    } finally {
      setLoadingSecurity(false);
    }
  }, []);

  const handleRevokeSession = async (sessionId) => {
    try {
      await axios.delete(`/revoke-session/${sessionId}`);
      enqueueSnackbar("Session revoked successfully", { variant: "success" });
      loadSecurityData();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message || "Failed to revoke session",
        { variant: "error" }
      );
    }
  };

  /* ── Save: commits the ACTIVE tab's draft ─────────────────── */
  const resetDrafts = () => {
    setAccountDraft(accountBase);
    setNotifDraft(notifBase);
    setAppearanceDraft(null);
    setRegionalDraft(null);
    setSystemDraft(null);
  };

  const handleSave = async () => {
    if (!isDirty) {
      enqueueSnackbar(t("No changes to save"), { variant: "info" });
      return;
    }
    setSaving(true);
    try {
      if (activeTab === "account") {
        await axios.post("/update-profile", { name: accountDraft.name });
        setAccountBase(accountDraft);
        await refetch();
        enqueueSnackbar(t("Profile name updated successfully"), { variant: "success" });
      }

      if (activeTab === "notifications") {
        const payload = { ...notifDraft, critical_alerts: true };

        // Browser alerts need real browser permission at apply time.
        if (payload.browser_alerts && !notifBase.browser_alerts) {
          const permission = await requestBrowserAlerts();
          if (permission !== "granted") {
            enqueueSnackbar(
              permission === "unsupported"
                ? t("This browser does not support desktop notifications.")
                : t("Browser notifications are blocked. Allow them in your browser's site settings, then save again."),
              { variant: "warning" }
            );
            setSaving(false);
            return;
          }
        }

        await axios.put("/notification-preferences", payload);
        setNotifBase(payload);
        enqueueSnackbar(t("Notification preferences saved successfully"), {
          variant: "success",
        });
      }

      if (activeTab === "appearance") {
        // Theme + density
        setTheme(appearanceValue.darkMode ? "dark" : "light");
        setDensity(appearanceValue.compact ? "compact" : "comfortable");
        // Regional — drives formatDate/formatCurrency across the app
        setRegional({
          language: regionalValue.language,
          timezone: regionalValue.timezone,
          dateFormat: regionalValue.dateFormat,
          currency: regionalValue.currency,
        });
        setAppearanceDraft(null);
        setRegionalDraft(null);
        enqueueSnackbar(t("Appearance and regional settings saved successfully"), {
          variant: "success",
        });
      }

      if (activeTab === "system") {
        if (canManageSystem) {
          const res = await axios.put("/system/maintenance-mode", {
            maintenance_mode: maintenanceValue,
          });
          setSystemBase((p) => ({ ...p, maintenanceMode: !!res.data.maintenance_mode }));
        }
        setDebugMode(debugValue);
        setSystemDraft(null);
        enqueueSnackbar(t("System settings saved successfully"), {
          variant: "success",
        });
      }

      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2200);
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message || t("Failed to save settings"),
        { variant: "error" }
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── Two-factor authentication (own password-confirmed action) ── */
  const openTwoFactorModal = (mode) => setTwoFactorForm({ password: "", mode });

  const handleTwoFactorSubmit = async (e) => {
    e?.preventDefault?.();
    if (!twoFactorForm.password) {
      enqueueSnackbar(t("Enter your current password to continue"), {
        variant: "error",
      });
      return;
    }
    setTwoFactorSaving(true);
    const enabling = twoFactorForm.mode === "enable";
    try {
      await axios.post(enabling ? "/2fa/enable" : "/2fa/disable", {
        password: twoFactorForm.password,
      });
      enqueueSnackbar(
        enabling
          ? "Two-factor authentication enabled. You will be asked for a verification code at your next login."
          : t("Two-factor authentication disabled."),
        { variant: "success" }
      );
      setTwoFactorForm(empty2faForm);
      await refetch();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message ||
          err.response?.data?.errors?.password?.[0] ||
          t("Failed to update two-factor authentication"),
        { variant: "error" }
      );
    } finally {
      setTwoFactorSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setSaving(true);
    try {
      await axios.post("/update-password", passwordForm);
      enqueueSnackbar(t("Password changed successfully"), { variant: "success" });
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message ||
          err.response?.data?.errors?.password?.[0] ||
          err.response?.data?.errors?.current_password?.[0] ||
          t("Failed to change password"),
        { variant: "error" }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      enqueueSnackbar("File size must be less than 2MB", { variant: "error" });
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      enqueueSnackbar("Invalid file type. Use JPG, PNG, or WebP", {
        variant: "error",
      });
      return;
    }
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await axios.post("/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarPreview(res.data.avatar_url);
      enqueueSnackbar(t("Avatar updated successfully"), { variant: "success" });
      await refetch();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || "Upload failed", {
        variant: "error",
      });
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  /* ── Regional live preview (from the DRAFT, so users see the
       effect before saving) ── */
  const { formatCurrency, formatDate, formatDateTime } = useFormat();
  const preview = (() => {
    const localeMap = { en: "en-LK", si: "si-LK", ta: "ta-LK" };
    const locale = localeMap[regionalValue.language] || "en-LK";
    const sample = new Date();
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: regionalValue.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(sample);
    const m = {};
    for (const x of p) if (x.type !== "literal") m[x.type] = x.value;
    const d = (() => {
      switch (regionalValue.dateFormat) {
        case "YYYY-MM-DD":
          return `${m.year}-${m.month}-${m.day}`;
        case "MM/DD/YYYY":
          return `${m.month}/${m.day}/${m.year}`;
        default:
          return `${m.day}/${m.month}/${m.year}`;
      }
    })();
    const dt = `${d} ${m.hour === "24" ? "00" : m.hour}:${m.minute}`;
    const cur = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: regionalValue.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(1234567.89);
    return { date: d, dateTime: dt, currency: cur };
  })();
  const savedPreview = {
    date: formatDate(new Date()),
    dateTime: formatDateTime(new Date()),
    currency: formatCurrency(1234567.89),
  };


  return (
    <ProtectedRoute>
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-border/50">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-widest mb-2">
              {t("Settings")}
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {t("Settings & Configurations")}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              {t("Manage your user profile, security controls, visual theme, and operational preferences.")}
            </p>
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            {t("Changes apply only when you press Save.")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-4 lg:gap-6">
          {/* ── Premium settings rail ──────────────────────────── */}
          <nav aria-label={t("Settings")} className="lg:sticky lg:top-4 lg:self-start">
            {/* Desktop: vertical rail */}
            <div className="hidden lg:flex flex-col gap-1 p-2 rounded-2xl border border-border/60 bg-muted/40 backdrop-blur-sm">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="settings-rail-pill"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-background shadow-soft ring-1 ring-border/60"
                      />
                    )}
                    {active && (
                      <motion.span
                        layoutId="settings-rail-accent"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-primary"
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "bg-transparent text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="relative z-10 flex-1 min-w-0">
                      <span className="block text-[13px] font-medium leading-tight truncate">
                        {t(tab.labelKey)}
                      </span>
                      <span className="block text-[10px] text-muted-foreground leading-tight truncate">
                        {t(tab.hintKey)}
                      </span>
                    </span>
                    {dirty[tab.key] && (
                      <span className="relative z-10 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile: horizontal scrolling pills */}
            <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground bg-muted/60"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="settings-rail-pill-mobile"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-primary shadow-soft"
                      />
                    )}
                    <Icon className="relative z-10 w-3.5 h-3.5" />
                    <span className="relative z-10">{t(tab.labelKey)}</span>
                    {dirty[tab.key] && (
                      <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ── Content ───────────────────────────────────────── */}
          <div className="min-w-0 space-y-4">
            {/* Unsaved-changes banner */}
            {isDirty && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5"
              >
                <p className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {t("You have unsaved changes in this section.")}
                </p>
                <button
                  onClick={resetDrafts}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t("Discard")}
                </button>
              </motion.div>
            )}

            {/* ── Account ─────────────────────────────────────── */}
            {activeTab === "account" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" /> {t("Profile Information")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover border-2 border-border"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                            <User className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                        <label className="absolute bottom-0 right-0 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="sr-only"
                            disabled={avatarUploading}
                          />
                          <div
                            className={`w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background cursor-pointer transition-opacity ${
                              avatarUploading ? "opacity-50" : ""
                            }`}
                          >
                            <Loader2
                              className={`w-4 h-4 ${
                                avatarUploading ? "animate-spin" : "hidden"
                              }`}
                            />
                            {!avatarUploading && <span className="text-[10px]">{t("Edit")}</span>}
                          </div>
                        </label>
                      </div>
                      <div className="flex-1 space-y-3">
                        <Field label={t("Full name")} required>
                          <Input
                            required
                            value={accountDraft.name}
                            onChange={(e) =>
                              setAccountDraft({ ...accountDraft, name: e.target.value })
                            }
                            placeholder={t("Full name")}
                            className="h-8 text-xs"
                          />
                        </Field>
                        <Field label={t("Email address")}>
                          <Input
                            type="email"
                            value={user?.email || ""}
                            className="h-8 text-xs"
                            disabled
                          />
                        </Field>
                        <p className="text-[10px] text-muted-foreground">
                          {t("Primary email is linked to account authentication.")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4" /> {t("Change Password")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <form onSubmit={handlePasswordChange} className="space-y-3">
                      <Field label={t("Current Password")} required>
                        <Input
                          type="password"
                          required
                          value={passwordForm.current_password}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              current_password: e.target.value,
                            })
                          }
                          placeholder={t("Current Password")}
                          className="h-8 text-xs"
                        />
                      </Field>
                      <Field label={t("New password")} required>
                        <Input
                          type="password"
                          required
                          value={passwordForm.password}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, password: e.target.value })
                          }
                          placeholder={t("New password")}
                          className="h-8 text-xs"
                        />
                      </Field>
                      <Field label={t("Confirm New Password")} required>
                        <Input
                          type="password"
                          required
                          value={passwordForm.password_confirmation}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              password_confirmation: e.target.value,
                            })
                          }
                          placeholder={t("Confirm New Password")}
                          className="h-8 text-xs"
                        />
                      </Field>
                      <div className="pt-1">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={saving}
                          className="h-8 text-xs gap-1.5"
                        >
                          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          {t("Update Password")}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── Notifications ───────────────────────────────── */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Bell className="w-4 h-4" /> {t("Notification Preferences")}
                    <Link
                      href="/notifications"
                      className="ml-auto inline-flex items-center gap-1 text-[11px] font-normal text-primary hover:text-primary/80 transition-colors"
                    >
                      {t("Open Center")}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0.5">
                    {NOTIFICATION_OPTIONS.map((opt) => (
                      <div
                        key={opt.key}
                        className="flex items-center justify-between gap-3 py-1.5 border-b border-border/40 last:border-0"
                      >
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-medium text-foreground leading-tight">
                            {t(opt.label)}
                          </h4>
                          <p className="text-[11px] text-muted-foreground leading-tight">
                            {opt.key === "browser_alerts" && browserPermission === "denied"
                              ? t("Blocked in browser settings — allow notifications for this site to enable")
                              : opt.key === "browser_alerts" && browserPermission === "unsupported"
                                ? t("Not supported by this browser")
                                : t(opt.description)}
                          </p>
                        </div>
                        <Switch
                          checked={notifDraft[opt.key]}
                          disabled={opt.locked}
                          onCheckedChange={(checked) => {
                            if (opt.locked) return;
                            setNotifDraft((p) => ({ ...p, [opt.key]: checked }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-2">
                    {t("Emails go to")}{" "}
                    <span className="font-medium text-foreground">{user?.email}</span>.{" "}
                    {t("In-app alerts are always delivered to the navbar bell and notification center.")}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ── Security ────────────────────────────────────── */}
            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4" /> {t("Security Settings")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        {t("Two-Factor Authentication (2FA)")}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {twoFactorEnabled
                          ? t("Enabled — a 6-digit verification code is emailed to you at every login.")
                          : t("Disabled — require a security code confirmation on logins from unknown devices")}
                      </p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={(checked) =>
                        openTwoFactorModal(checked ? "enable" : "disable")
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        {t("Active Device Sessions")}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {t("View and revoke active authorization tokens and devices")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        loadSecurityData();
                        setShowSessionsModal(true);
                      }}
                    >
                      {t("View Sessions")}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        {t("Login History & Audits")}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {t("Inspect recent IP addresses, browser agents, and timestamps")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        loadSecurityData();
                        setShowHistoryModal(true);
                      }}
                    >
                      {t("View Logs")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Appearance + Regional ───────────────────────── */}
            {activeTab === "appearance" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Palette className="w-4 h-4" /> {t("Appearance & Theme")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">
                          {t("Dark Theme")}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {t("Switch between clean high-contrast light and dark appearance")}
                        </p>
                      </div>
                      <Switch
                        checked={appearanceValue.darkMode}
                        onCheckedChange={(checked) =>
                          setAppearanceDraft({ ...appearanceValue, darkMode: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">
                          {t("Compact Density Mode")}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {t("Optimize padding and spacing for high-density tabular data")}
                        </p>
                      </div>
                      <Switch
                        checked={appearanceValue.compact}
                        onCheckedChange={(checked) =>
                          setAppearanceDraft({ ...appearanceValue, compact: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4" /> {t("Regional & Localization")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                          {t("Language (date & number format)")}
                        </Label>
                        <select
                          value={regionalValue.language}
                          onChange={(e) =>
                            setRegionalDraft({ ...regionalValue, language: e.target.value })
                          }
                          className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md outline-none"
                        >
                          <option value="en">English</option>
                          <option value="si">සිංහල (Sinhala)</option>
                          <option value="ta">தமிழ் (Tamil)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                          {t("Timezone")}
                        </Label>
                        <select
                          value={regionalValue.timezone}
                          onChange={(e) =>
                            setRegionalDraft({ ...regionalValue, timezone: e.target.value })
                          }
                          className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md outline-none"
                        >
                          <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
                          <option value="UTC">UTC (GMT+0:00)</option>
                          <option value="Asia/Singapore">Asia/Singapore (GMT+8:00)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                          {t("Date Format")}
                        </Label>
                        <select
                          value={regionalValue.dateFormat}
                          onChange={(e) =>
                            setRegionalDraft({ ...regionalValue, dateFormat: e.target.value })
                          }
                          className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md outline-none"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 31/12/2026)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                          {t("Primary Currency")}
                        </Label>
                        <select
                          value={regionalValue.currency}
                          onChange={(e) =>
                            setRegionalDraft({ ...regionalValue, currency: e.target.value })
                          }
                          className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md outline-none"
                        >
                          <option value="LKR">LKR (Sri Lankan Rupee)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="EUR">EUR (Euro)</option>
                        </select>
                      </div>
                    </div>

                    {/* Live preview of the draft (before saving) */}
                    <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {t("Live Preview")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {t("Currently applied")}: {savedPreview.date} · {savedPreview.currency}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground">{t("Date")}</p>
                          <p className="text-xs font-medium text-foreground">{preview.date}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">{t("Date & Time")}</p>
                          <p className="text-xs font-medium text-foreground">{preview.dateTime}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">{t("Amount")}</p>
                          <p className="text-xs font-medium text-foreground">{preview.currency}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {t("Applied to dashboards, job values, quotations, purchase orders, invoices, and tenders.")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* ── System ──────────────────────────────────────── */}
            {activeTab === "system" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Monitor className="w-4 h-4" /> {t("System Preferences & Diagnostic")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-xs text-muted-foreground mb-2">
                    {t("System-wide runtime toggles and diagnostics controls.")}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        {t("Debug Mode & Verbose Network Trace")}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {debugValue
                          ? t("Enabled — API requests, responses and timings are logged to the browser console.")
                          : t("Logs API requests, response times, and stack traces to client console")}
                      </p>
                    </div>
                    <Switch
                      checked={debugValue}
                      onCheckedChange={(checked) =>
                        setSystemDraft({ debugMode: checked, maintenanceMode: maintenanceValue })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        {t("Maintenance Mode")}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {canManageSystem
                          ? t("Restricts write operations across procurement and financial ledgers")
                          : t("Only Super Admins can change maintenance mode")}
                      </p>
                    </div>
                    {canManageSystem ? (
                      <Switch
                        checked={maintenanceValue}
                        onCheckedChange={(checked) =>
                          setSystemDraft({ debugMode: debugValue, maintenanceMode: checked })
                        }
                      />
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          maintenanceValue
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        {maintenanceValue
                          ? t("Under maintenance")
                          : t("Operational")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sticky action bar */}
            <div className="sticky bottom-4 z-20 flex items-center justify-end gap-2 rounded-xl border border-border/60 bg-background/90 px-3.5 py-2.5 shadow-soft backdrop-blur-md">
              {isDirty && (
                <button
                  onClick={resetDrafts}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t("Discard")}
                </button>
              )}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-9 px-4 text-xs gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : savedFeedback ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? t("Saving...") : savedFeedback ? t("Saved") : t("Save Changes")}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Modals ─────────────────────────────────────────── */}

        {/* Two-Factor password confirmation */}
        {twoFactorForm.mode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {twoFactorForm.mode === "enable"
                      ? t("Enable Two-Factor Authentication")
                      : t("Disable Two-Factor Authentication")}
                  </h3>
                </div>
                <button
                  onClick={() => setTwoFactorForm(empty2faForm)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleTwoFactorSubmit} className="p-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  {twoFactorForm.mode === "enable"
                    ? t("Enter your current password to enable 2FA. A 6-digit verification code will be emailed to you at every login.")
                    : t("Enter your current password to disable 2FA. Your account will only be protected by your password.")}
                </p>
                <Field label={t("Current Password")} required>
                  <Input
                    type="password"
                    required
                    autoFocus
                    value={twoFactorForm.password}
                    onChange={(e) =>
                      setTwoFactorForm((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder={t("Current Password")}
                    className="h-9 text-xs"
                  />
                </Field>
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTwoFactorForm(empty2faForm)}
                    className="h-8 text-xs"
                  >
                    {t("Cancel")}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={twoFactorSaving}
                    className="h-8 text-xs gap-1.5"
                  >
                    {twoFactorSaving && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    {twoFactorForm.mode === "enable" ? t("Enable 2FA") : t("Disable 2FA")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Active Sessions */}
        {showSessionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("Active Sessions")}
                  </h3>
                </div>
                <button
                  onClick={() => setShowSessionsModal(false)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
                {loadingSecurity ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : activeSessions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    {t("Only current device session is active.")}
                  </div>
                ) : (
                  activeSessions.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="p-3 border border-border rounded-md flex items-center justify-between bg-muted/20"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium text-foreground flex items-center gap-1.5">
                          <span>{s.ip_address || "Localhost"}</span>
                          {s.is_current && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono">
                              {t("Current Device")}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[280px]">
                          {s.user_agent || "Web Browser"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {t("Last activity")}: {s.last_activity ? new Date(s.last_activity * 1000).toLocaleString() : "Active now"}
                        </p>
                      </div>
                      {!s.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(s.id)}
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        >
                          {t("Revoke")}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-border flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSessionsModal(false)}
                  className="h-8 text-xs"
                >
                  {t("Close")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Login History */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-xl bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("Login History & Security Logs")}
                  </h3>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-y-auto space-y-2 flex-1 text-xs">
                {loadingSecurity ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : loginHistory.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    {t("No recent login logs found.")}
                  </div>
                ) : (
                  loginHistory.slice(0, 15).map((log, idx) => (
                    <div
                      key={log.id || idx}
                      className="p-2.5 border border-border rounded flex items-center justify-between hover:bg-muted/30"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium text-foreground flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>IP: {log.ip_address || "127.0.0.1"}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : "Recently"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[340px]">
                          {log.user_agent || "Desktop Browser"}
                        </p>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {t("Successful")}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-border flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistoryModal(false)}
                  className="h-8 text-xs"
                >
                  {t("Close")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

const Field = ({ label, children, required }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);
