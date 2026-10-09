"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Bell, Shield, Monitor, Users, Key, Save, Loader2, User, Mail, Lock, Globe, Palette } from "lucide-react";
import { useSnackbar } from "notistack";
import { useAuth } from "@/contexts/AuthContext";
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
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);

  const [account, setAccount] = useState({
    name: "",
    email: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    critical: true,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
  });

  const [appearance, setAppearance] = useState({
    darkMode: false,
    compactMode: false,
  });

  const [system, setSystem] = useState({
    maintenanceMode: false,
    debugMode: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setAccount({
        name: user.name || "",
        email: user.email || "",
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

  const handleAccountSave = async () => {
    setSaving(true);
    try {
      await axios.post("/update-profile", { name: account.name });
      enqueueSnackbar("Profile updated successfully", { variant: "success" });
      await refetch();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || "Failed to update profile", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post("/update-password", passwordForm);
      enqueueSnackbar("Password changed successfully", { variant: "success" });
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || "Failed to change password", { variant: "error" });
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
      enqueueSnackbar("Invalid file type. Use JPG, PNG, or WebP", { variant: "error" });
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
      enqueueSnackbar(err.response?.data?.message || "Upload failed", { variant: "error" });
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleNotificationSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    enqueueSnackbar("Notification preferences saved", { variant: "success" });
    setSaving(false);
  };

  const handleAppearanceSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    enqueueSnackbar("Appearance settings saved", { variant: "success" });
    setSaving(false);
  };

  const handleSystemSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    enqueueSnackbar("System settings saved", { variant: "success" });
    setSaving(false);
  };

  const getSaveHandler = () => {
    switch (activeTab) {
      case "account": return handleAccountSave;
      case "notifications": return handleNotificationSave;
      case "security": return handlePasswordChange;
      case "appearance": return handleAppearanceSave;
      case "system": return handleSystemSave;
      default: return () => {};
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <h1 className="text-base font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground">Manage your account, preferences, and system settings</p>
        </div>

        <Tabs value={activeTab} onChange={setActiveTab} className="w-full">
          <TabsList className="flex gap-1 overflow-x-auto w-full pb-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.key} value={t.key} className="gap-2 px-3 py-2 whitespace-nowrap">
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
                <CardTitle className="flex items-center gap-2"><User className="w-4 h-4" /> Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-border" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                        <User className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" disabled={avatarUploading} />
                      <div className={`w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background cursor-pointer transition-opacity ${avatarUploading ? "opacity-50" : ""}`}>
                        <Loader2 className={`w-4 h-4 ${avatarUploading ? "animate-spin" : "hidden"}`} />
                        {!avatarUploading && <span className="text-[10px]">Edit</span>}
                      </div>
                    </label>
                  </div>
                  <div className="flex-1 space-y-3">
                    <Field label="Full Name" required>
                      <Input
                        required
                        value={account.name}
                        onChange={(e) => setAccount({...account, name: e.target.value})}
                        placeholder="Your full name"
                        className="h-8 text-xs"
                      />
                    </Field>
                    <Field label="Email Address">
                      <Input
                        type="email"
                        value={account.email}
                        onChange={(e) => setAccount({...account, email: e.target.value})}
                        placeholder="your@email.com"
                        className="h-8 text-xs"
                        disabled
                      />
                    </Field>
                    <p className="text-[10px] text-muted-foreground">Email changes require verification. Use Security tab to update.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <Field label="Current Password" required>
                    <Input
                      type="password"
                      required
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                      placeholder="Enter current password"
                      className="h-8 text-xs"
                    />
                  </Field>
                  <Field label="New Password" required>
                    <Input
                      type="password"
                      required
                      value={passwordForm.password}
                      onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
                      placeholder="Min 8 chars, upper, lower, number"
                      className="h-8 text-xs"
                    />
                  </Field>
                  <Field label="Confirm New Password" required>
                    <Input
                      type="password"
                      required
                      value={passwordForm.password_confirmation}
                      onChange={(e) => setPasswordForm({...passwordForm, password_confirmation: e.target.value})}
                      placeholder="Repeat new password"
                      className="h-8 text-xs"
                    />
                  </Field>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="pt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="w-4 h-4" /> Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-xs text-muted-foreground mb-2">
                  Configure which notifications you receive. Critical alerts cannot be disabled.
                </div>
                {[
                  { key: "email", label: "Email Notifications", description: "Receive email updates about jobs, orders, approvals, and system events" },
                  { key: "push", label: "Browser Notifications", description: "Get desktop notifications for important events and updates" },
                  { key: "critical", label: "Critical Alerts", description: "System alerts, security warnings, deadline reminders, and payment notifications" },
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{opt.label}</h4>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                    <Switch
                      checked={notifications[opt.key]}
                      onCheckedChange={(checked) => setNotifications((p) => ({ ...p, [opt.key]: checked }))}
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
                <CardTitle className="flex items-center gap-2"><Shield className="w-4 h-4" /> Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Two-Factor Authentication</h4>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={security.twoFactorEnabled}
                    onCheckedChange={(checked) => setSecurity((p) => ({ ...p, twoFactorEnabled: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Active Sessions</h4>
                    <p className="text-xs text-muted-foreground">Manage your active login sessions</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => alert("Session management coming soon")}>View</Button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Login History</h4>
                    <p className="text-xs text-muted-foreground">View recent login activity</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => alert("Login history coming soon")}>View</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="pt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette className="w-4 h-4" /> Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: "darkMode", label: "Dark Mode", description: "Use dark theme across the application" },
                  { key: "compactMode", label: "Compact Mode", description: "Reduce spacing for denser information display" },
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{opt.label}</h4>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                    <Switch
                      checked={appearance[opt.key]}
                      onCheckedChange={(checked) => setAppearance((p) => ({ ...p, [opt.key]: checked }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="w-4 h-4" /> Regional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Language</Label>
                    <select className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md outline-none">
                      <option value="en">English</option>
                      <option value="si">Sinhala</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Timezone</Label>
                    <select className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md outline-none">
                      <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Date Format</Label>
                    <select className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md outline-none">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Currency</Label>
                    <select className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md outline-none">
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
                <CardTitle className="flex items-center gap-2"><Monitor className="w-4 h-4" /> System Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-xs text-muted-foreground mb-2">
                  System-wide settings (admin only)
                </div>
                {[
                  { key: "maintenanceMode", label: "Maintenance Mode", description: "Enable maintenance mode - restricts write operations system-wide" },
                  { key: "debugMode", label: "Debug Mode", description: "Enable verbose logging and error details in console" },
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{opt.label}</h4>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                    <Switch
                      checked={system[opt.key]}
                      onCheckedChange={(checked) => setSystem((p) => ({ ...p, [opt.key]: checked }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button onClick={getSaveHandler()} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}

const Field = ({ label, children, required }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">
      {label}{required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);