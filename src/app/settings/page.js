"use client";

import { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Bell,
  Shield,
  Monitor,
  Users,
  Key,
  Save,
  Loader2,
  User,
  Mail,
  Lock,
  Globe,
  Palette,
  Laptop,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { useSnackbar } from "notistack";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "@/lib/axios";

const TABS = [
  { key: "account", label: "Account", icon: User },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const { user, refetch } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);

  // Profile / Account
  const [account, setAccount] = useState({
    name: "",
    email: "",
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    critical: true,
  });

  // Security
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
  });
  const [activeSessions, setActiveSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Appearance
  const [appearance, setAppearance] = useState({
    darkMode: false,
    compactMode: false,
    language: "en",
    timezone: "Asia/Colombo",
    dateFormat: "DD/MM/YYYY",
    currency: "LKR",
  });

  // System
  const [system, setSystem] = useState({
    maintenanceMode: false,
    debugMode: false,
  });

  // Password
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setAccount({
        name: user.name || "",
        email: user.email || "",
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

  // Load local settings preferences
  useEffect(() => {
    const isDark =
      theme === "dark" || (theme === "system" && resolvedTheme === "dark");

    try {
      const savedNotifs = localStorage.getItem("procurex_notifications");
      if (savedNotifs) setNotifications((prev) => ({ ...prev, ...JSON.parse(savedNotifs) }));

      const savedRegional = localStorage.getItem("procurex_regional");
      if (savedRegional) {
        setAppearance((prev) => ({
          ...prev,
          ...JSON.parse(savedRegional),
          darkMode: isDark,
        }));
      } else {
        setAppearance((prev) => ({
          ...prev,
          darkMode: isDark,
        }));
      }

      const savedSecurity = localStorage.getItem("procurex_security_2fa");
      if (savedSecurity) {
        setSecurity({ twoFactorEnabled: savedSecurity === "true" });
      }

      const savedSystem = localStorage.getItem("procurex_system_pref");
      if (savedSystem) {
        setSystem(JSON.parse(savedSystem));
      }
    } catch (e) {
      console.warn("Could not load stored preferences", e);
    }
  }, [theme, resolvedTheme]);

  // Fetch security info (active sessions & login history)
  const loadSecurityData = useCallback(async () => {
    setLoadingSecurity(true);
    try {
      const [sessRes, histRes] = await Promise.allSettled([
        axios.get("/active-sessions"),
        axios.get("/login-history"),
      ]);

      if (sessRes.status === "fulfilled") {
        setActiveSessions(sessRes.value.data || []);
      }
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
      enqueueSnackbar(err.response?.data?.message || "Failed to revoke session", { variant: "error" });
    }
  };

  const handleAccountSave = async () => {
    setSaving(true);
    try {
      await axios.post("/update-profile", { name: account.name });
      enqueueSnackbar("Profile name updated successfully", { variant: "success" });
      await refetch();
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message || "Failed to update profile",
        { variant: "error" }
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setSaving(true);
    try {
      await axios.post("/update-password", passwordForm);
      enqueueSnackbar("Password changed successfully", { variant: "success" });
      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (err) {
      enqueueSnackbar(
        err.response?.data?.message ||
          err.response?.data?.errors?.password?.[0] ||
          err.response?.data?.errors?.current_password?.[0] ||
          "Failed to change password",
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
      enqueueSnackbar("Avatar updated successfully", { variant: "success" });
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

  const handleNotificationSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("procurex_notifications", JSON.stringify(notifications));
      enqueueSnackbar("Notification preferences saved successfully", { variant: "success" });
    } catch {
      enqueueSnackbar("Could not save notification preferences", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSecuritySave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("procurex_security_2fa", String(security.twoFactorEnabled));
      if (passwordForm.current_password && passwordForm.password) {
        await handlePasswordChange();
      } else {
        enqueueSnackbar("Security preferences updated", { variant: "success" });
      }
    } catch {
      enqueueSnackbar("Failed to update security settings", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAppearanceSave = async () => {
    setSaving(true);
    try {
      setTheme(appearance.darkMode ? "dark" : "light");
      localStorage.setItem(
        "procurex_regional",
        JSON.stringify({
          compactMode: appearance.compactMode,
          language: appearance.language,
          timezone: appearance.timezone,
          dateFormat: appearance.dateFormat,
          currency: appearance.currency,
        })
      );
      enqueueSnackbar("Appearance and regional settings applied successfully", {
        variant: "success",
      });
    } catch {
      enqueueSnackbar("Failed to save appearance settings", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSystemSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("procurex_system_pref", JSON.stringify(system));
      enqueueSnackbar("System settings saved successfully", { variant: "success" });
    } catch {
      enqueueSnackbar("Failed to save system settings", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const getSaveHandler = () => {
    switch (activeTab) {
      case "account":
        return handleAccountSave;
      case "notifications":
        return handleNotificationSave;
      case "security":
        return handleSecuritySave;
      case "appearance":
        return handleAppearanceSave;
      case "system":
        return handleSystemSave;
      default:
        return () => {};
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
        <div className="space-y-1 pb-2 border-b border-border/50">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Settings & Configurations
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your user profile, security controls, visual theme, and operational preferences.
          </p>
        </div>

        <Tabs value={activeTab} onChange={setActiveTab} className="w-full">
          <TabsList className="flex gap-1 overflow-x-auto w-full pb-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.key}
                  value={t.key}
                  className="gap-2 px-3 py-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="pt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile Information
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
                        {!avatarUploading && <span className="text-[10px]">Edit</span>}
                      </div>
                    </label>
                  </div>
                  <div className="flex-1 space-y-3">
                    <Field label="Full Name" required>
                      <Input
                        required
                        value={account.name}
                        onChange={(e) =>
                          setAccount({ ...account, name: e.target.value })
                        }
                        placeholder="Your full name"
                        className="h-8 text-xs"
                      />
                    </Field>
                    <Field label="Email Address">
                      <Input
                        type="email"
                        value={account.email}
                        placeholder="your@email.com"
                        className="h-8 text-xs"
                        disabled
                      />
                    </Field>
                    <p className="text-[10px] text-muted-foreground">
                      Primary email is linked to account authentication.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <Field label="Current Password" required>
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
                      placeholder="Enter current password"
                      className="h-8 text-xs"
                    />
                  </Field>
                  <Field label="New Password" required>
                    <Input
                      type="password"
                      required
                      value={passwordForm.password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          password: e.target.value,
                        })
                      }
                      placeholder="Min 8 chars, uppercase, lowercase, number"
                      className="h-8 text-xs"
                    />
                  </Field>
                  <Field label="Confirm New Password" required>
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
                      placeholder="Repeat new password"
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
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="pt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-xs text-muted-foreground mb-2">
                  Configure which notifications you receive across the procurement lifecycle.
                </div>
                {[
                  {
                    key: "email",
                    label: "Email Notifications",
                    description:
                      "Receive email updates about tenders, purchase orders, approvals, and bills",
                  },
                  {
                    key: "push",
                    label: "Browser & Desktop Alerts",
                    description:
                      "Get instant notifications for status changes and assigned workflow tasks",
                  },
                  {
                    key: "critical",
                    label: "Critical Alerts & Overdue Warnings",
                    description:
                      "System alerts, deadline warnings, and audit logging alerts (mandatory)",
                  },
                ].map((opt) => (
                  <div
                    key={opt.key}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        {opt.label}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {opt.description}
                      </p>
                    </div>
                    <Switch
                      checked={notifications[opt.key]}
                      onCheckedChange={(checked) =>
                        setNotifications((p) => ({ ...p, [opt.key]: checked }))
                      }
                      disabled={opt.key === "critical"}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="pt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Two-Factor Authentication (2FA)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Require security code confirmation on logins from unknown devices
                    </p>
                  </div>
                  <Switch
                    checked={security.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setSecurity((p) => ({ ...p, twoFactorEnabled: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Active Device Sessions
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      View and revoke active authorization tokens and devices
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
                    View Sessions
                  </Button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Login History & Audits
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Inspect recent IP addresses, browser agents, and timestamps
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
                    View Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="pt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Appearance & Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Dark Theme
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Switch between clean high-contrast light and dark appearance
                    </p>
                  </div>
                  <Switch
                    checked={appearance.darkMode}
                    onCheckedChange={(checked) => {
                      setAppearance((p) => ({ ...p, darkMode: checked }));
                      setTheme(checked ? "dark" : "light");
                    }}
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Compact Density Mode
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Optimize padding and spacing for high-density tabular data
                    </p>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) =>
                      setAppearance((p) => ({ ...p, compactMode: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Regional & Localization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      Language
                    </Label>
                    <select
                      value={appearance.language}
                      onChange={(e) =>
                        setAppearance({ ...appearance, language: e.target.value })
                      }
                      className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md outline-none"
                    >
                      <option value="en">English (US/UK)</option>
                      <option value="si">Sinhala (සිංහල)</option>
                      <option value="ta">Tamil (தமிழ்)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      Timezone
                    </Label>
                    <select
                      value={appearance.timezone}
                      onChange={(e) =>
                        setAppearance({ ...appearance, timezone: e.target.value })
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
                      Date Format
                    </Label>
                    <select
                      value={appearance.dateFormat}
                      onChange={(e) =>
                        setAppearance({ ...appearance, dateFormat: e.target.value })
                      }
                      className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md outline-none"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 10/10/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      Primary Currency
                    </Label>
                    <select
                      value={appearance.currency}
                      onChange={(e) =>
                        setAppearance({ ...appearance, currency: e.target.value })
                      }
                      className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md outline-none"
                    >
                      <option value="LKR">LKR (Sri Lankan Rupee)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="pt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> System Preferences & Diagnostic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-xs text-muted-foreground mb-2">
                  System-wide runtime toggles and diagnostics controls.
                </div>
                {[
                  {
                    key: "maintenanceMode",
                    label: "Maintenance Mode",
                    description:
                      "Restricts write operations across procurement and financial ledgers",
                  },
                  {
                    key: "debugMode",
                    label: "Debug Mode & Verbose Network Trace",
                    description:
                      "Logs API requests, response times, and stack traces to client console",
                  },
                ].map((opt) => (
                  <div
                    key={opt.key}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        {opt.label}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {opt.description}
                      </p>
                    </div>
                    <Switch
                      checked={system[opt.key]}
                      onCheckedChange={(checked) =>
                        setSystem((p) => ({ ...p, [opt.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Global Save Button */}
        <div className="flex justify-end pt-3 border-t border-border">
          <Button
            onClick={getSaveHandler()}
            disabled={saving}
            className="h-9 px-4 text-xs gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Active Sessions Modal */}
        {showSessionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Active Sessions
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
                    Only current device session is active.
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
                              Current Device
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[280px]">
                          {s.user_agent || "Web Browser"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Last activity: {s.last_activity ? new Date(s.last_activity * 1000).toLocaleString() : "Active now"}
                        </p>
                      </div>
                      {!s.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(s.id)}
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        >
                          Revoke
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
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Login History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-xl bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Login History & Security Logs
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
                    No recent login logs found.
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
                        Successful
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
                  Close
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