"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "@/lib/axios";
import { fetchCsrf } from "@/lib/auth";
import { useSnackbar } from "notistack";
import {
  Loader2,
  User,
  Mail,
  Lock,
  ShieldCheck,
  Trash2,
  Save,
  Camera,
} from "lucide-react";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";

// Validation Schemas
const profileSchema = yup.object({
  name: yup.string().required("Name is required").min(2, "Too short"),
});

const passwordSchema = yup.object({
  current_password: yup.string().required("Current password is required"),
  password: yup
    .string()
    .required("New password is required")
    .min(8, "At least 8 characters")
    .matches(/[a-z]/, "Must contain lowercase")
    .matches(/[A-Z]/, "Must contain uppercase")
    .matches(/[0-9]/, "Must contain a number"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password required"),
});

const emailChangeSchema = yup.object({
  new_email: yup
    .string()
    .email("Invalid email")
    .required("New email is required"),
  current_password: yup.string().required("Current password is required"),
  otp: yup.string().length(6, "Code must be 6 digits").optional(),
});

function Field({ label, error, icon: Icon, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 uppercase tracking-wider">
        {Icon && <Icon size={14} className="text-slate-400" />} {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading, refetch } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loginPagination, setLoginPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [activeSessions, setActiveSessions] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });

  const fileInputRef = useRef(null);

  // Tabs
  const [tab, setTab] = useState("personal");

  // Forms
  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: { name: user?.name || "" },
    mode: "onTouched",
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    mode: "onTouched",
  });

  const emailForm = useForm({
    resolver: yupResolver(emailChangeSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name || "" });
      setAvatarPreview(user?.avatar_url || null);
    }
  }, [user, profileForm]);

  // Handlers
  const onUpdateProfile = async (data) => {
    console.log("[Profile] Update profile initiated:", data);
    try {
      await fetchCsrf();
      const res = await axios.post("/api/update-profile", data);
      console.log("[Profile] Update profile successful:", res.data);
      await refetch();
      enqueueSnackbar(res.data.message || "Profile updated", {
        variant: "success",
      });
    } catch (e) {
      console.error(
        "[Profile] Update profile failed:",
        e.response?.data || e.message
      );
      const msg =
        e.response?.data?.errors?.name?.[0] ||
        e.response?.data?.message ||
        "Update failed";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const onUploadAvatar = async () => {
    if (!avatarFile) return;
    console.log("[Profile] Uploading avatar:", avatarFile.name);
    const form = new FormData();
    form.append("avatar", avatarFile);
    try {
      await fetchCsrf();
      const res = await axios.post("/api/upload-avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("[Profile] Avatar upload successful:", res.data);
      enqueueSnackbar(res.data.message || "Avatar updated", {
        variant: "success",
      });
      setAvatarFile(null);
      await refetch();
    } catch (e) {
      console.error(
        "[Profile] Avatar upload failed:",
        e.response?.data || e.message
      );
      const msg =
        e.response?.data?.errors?.avatar?.[0] ||
        e.response?.data?.message ||
        "Upload failed";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const onUpdatePassword = async (data) => {
    console.log("[Profile] Password update initiated");
    try {
      await fetchCsrf();
      const res = await axios.post("/api/update-password", data);
      console.log("[Profile] Password update successful");
      enqueueSnackbar(res.data.message || "Password updated", {
        variant: "success",
      });
      passwordForm.reset();
    } catch (e) {
      console.error(
        "[Profile] Password update failed:",
        e.response?.data || e.message
      );
      const msg =
        e.response?.data?.errors?.current_password?.[0] ||
        e.response?.data?.errors?.password?.[0] ||
        e.response?.data?.message ||
        "Security update failed";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const onRequestEmailOtp = async () => {
    const values = emailForm.getValues();
    console.log("[Profile] Requesting email OTP for:", values.new_email);
    try {
      await fetchCsrf();
      await axios.post("/api/request-email-change", {
        new_email: values.new_email,
        current_password: values.current_password,
      });
      console.log("[Profile] OTP requested successfully");
      enqueueSnackbar("Verification code sent to your new email", {
        variant: "success",
      });
    } catch (e) {
      console.error(
        "[Profile] OTP request failed:",
        e.response?.data || e.message
      );
      const msg =
        e.response?.data?.errors?.new_email?.[0] ||
        e.response?.data?.errors?.current_password?.[0] ||
        e.response?.data?.message ||
        "Failed to send OTP";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const onConfirmEmailChange = async (data) => {
    console.log("[Profile] Confirming email change to:", data.new_email);
    try {
      await fetchCsrf();
      const res = await axios.post("/api/confirm-email-change", {
        new_email: data.new_email,
        otp: data.otp,
      });
      console.log("[Profile] Email change confirmed successfully");
      enqueueSnackbar(res.data.message || "Email updated", {
        variant: "success",
      });
      emailForm.reset();
      await refetch();
    } catch (e) {
      console.error(
        "[Profile] Email change confirmation failed:",
        e.response?.data || e.message
      );
      const msg =
        e.response?.data?.errors?.otp?.[0] ||
        e.response?.data?.errors?.new_email?.[0] ||
        e.response?.data?.message ||
        "Email update failed";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const onDeactivate = async () => {
    if (
      !confirm(
        "Deactivate your account? You can request restore within 30 days."
      )
    )
      return;
    console.warn("[Profile] Deactivating account...");
    try {
      await fetchCsrf();
      const res = await axios.post("/api/deactivate-account");
      console.log("[Profile] Account deactivated successfully");
      enqueueSnackbar(res.data.message || "Account deactivated", {
        variant: "success",
      });
      try {
        console.log("[Profile] Logging out after deactivation...");
        await axios.post("/api/logout");
      } catch {}
      window.location.href = "/signin";
    } catch (e) {
      console.error(
        "[Profile] Deactivation failed:",
        e.response?.data || e.message
      );
      enqueueSnackbar(e.response?.data?.message || "Failed to deactivate", {
        variant: "error",
      });
    }
  };

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const labels = ["Weak", "Fair", "Good", "Strong"];
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-emerald-500",
    ];

    return {
      score,
      label: labels[score - 1] || "Weak",
      color: colors[score - 1] || "bg-red-500",
    };
  };

  const fetchSecurityData = async (page = 1) => {
    try {
      const [historyRes, sessionsRes] = await Promise.all([
        axios.get(`/api/login-history?page=${page}`),
        axios.get("/api/active-sessions"),
      ]);

      if (page === 1) {
        setLoginHistory(historyRes.data.data);
      } else {
        setLoginHistory((prev) => [...prev, ...historyRes.data.data]);
      }

      setLoginPagination({
        current_page: historyRes.data.current_page,
        last_page: historyRes.data.last_page,
      });
      setActiveSessions(sessionsRes.data);
    } catch (err) {
      console.error("Failed to fetch security data", err);
    }
  };

  const loadMoreHistory = () => {
    const nextPage = loginPagination.current_page + 1;
    if (nextPage <= loginPagination.last_page) {
      fetchSecurityData(nextPage);
    }
  };

  const onDeleteHistoryEntry = async (id) => {
    try {
      await axios.delete(`/api/login-history/${id}`);
      enqueueSnackbar("History entry removed", { variant: "success" });
      setLoginHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      enqueueSnackbar("Failed to remove history entry", { variant: "error" });
    }
  };

  const onRevokeSession = async (id) => {
    try {
      await axios.delete(`/api/revoke-session/${id}`);
      enqueueSnackbar("Session revoked successfully", { variant: "success" });
      fetchSecurityData();
    } catch (err) {
      enqueueSnackbar("Failed to revoke session", { variant: "error" });
    }
  };

  useEffect(() => {
    if (tab === "security" || tab === "activity") {
      fetchSecurityData();
    }
  }, [tab]);

  if (loading || !user) {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-12 pb-12">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          {/* Header - Centered with underline */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-2">
              Profile Settings
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-700"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your personal information and security
              </p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-700"></div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center border-b border-slate-200 dark:border-slate-800 mb-6">
            {[
              { key: "personal", label: "Personal" },
              { key: "security", label: "Security" },
              { key: "activity", label: "Activity" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-6 py-3 text-sm font-semibold -mb-px border-b-2 transition-all ${
                  tab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {tab === "personal" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Avatar + Meta */}
              <div className="w-full lg:col-span-1">
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
                  {/* Glow effect for dark mode */}
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 blur-2xl opacity-0 dark:opacity-60"></div>

                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4">
                    Profile Photo
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 shrink-0">
                      <Image
                        src={avatarPreview || "/images/Signup.png"}
                        alt="avatar"
                        fill
                        className="rounded-full object-cover border border-slate-200 dark:border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 bg-slate-900 dark:bg-slate-700 text-white p-2 rounded-full shadow hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors z-10"
                        title="Change photo"
                      >
                        <Camera size={14} />
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        JPG, PNG, WEBP up to 2MB
                      </div>
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            if (f.size > 2 * 1024 * 1024) {
                              enqueueSnackbar("File too large (max 2MB)", {
                                variant: "error",
                              });
                              return;
                            }
                            setAvatarFile(f);
                            const url = URL.createObjectURL(f);
                            setAvatarPreview(url);
                          }}
                        />
                        <button
                          type="button"
                          disabled={!avatarFile}
                          onClick={onUploadAvatar}
                          className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-white shadow-lg disabled:opacity-40 hover:bg-primary/90 hover:shadow-xl transition-all active:scale-95"
                        >
                          Upload
                        </button>
                        {avatarFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setAvatarFile(null);
                              setAvatarPreview(user?.avatar_url || null);
                            }}
                            className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border-2 border-slate-200 dark:border-slate-700 active:scale-95"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <div>
                      Last updated:{" "}
                      {user?.profile_updated_at
                        ? new Date(user.profile_updated_at).toLocaleString()
                        : "—"}
                    </div>
                    <div>Updated by: {user?.profile_updated_by || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Right: Personal Info and Email Change */}
              <div className="w-full lg:col-span-2 space-y-6">
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
                  {/* Glow effect for dark mode */}
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 blur-2xl opacity-0 dark:opacity-60"></div>

                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4">
                    Personal Info
                  </h3>
                  <form
                    onSubmit={profileForm.handleSubmit(onUpdateProfile)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <Field
                      label="Full name"
                      icon={User}
                      error={profileForm.formState.errors.name?.message}
                    >
                      <input
                        {...profileForm.register("name")}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Your name"
                      />
                    </Field>
                    <Field label="Email (read-only)" icon={Mail}>
                      <input
                        value={user?.email || ""}
                        disabled
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm cursor-not-allowed"
                      />
                    </Field>
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={profileForm.formState.isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white text-sm font-bold shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all disabled:opacity-40 active:scale-95 w-full sm:w-auto justify-center"
                      >
                        {profileForm.formState.isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
                  {/* Glow effect for dark mode */}
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 blur-2xl opacity-0 dark:opacity-60"></div>

                  <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4">
                    Change Email
                  </h3>
                  <form
                    onSubmit={emailForm.handleSubmit(onConfirmEmailChange)}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    <Field
                      label="New email"
                      icon={Mail}
                      error={emailForm.formState.errors.new_email?.message}
                    >
                      <input
                        {...emailForm.register("new_email")}
                        placeholder="name@example.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </Field>
                    <Field
                      label="Current password"
                      icon={Lock}
                      error={
                        emailForm.formState.errors.current_password?.message
                      }
                    >
                      <input
                        type="password"
                        {...emailForm.register("current_password")}
                        placeholder="Your password"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </Field>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={onRequestEmailOtp}
                        className="px-4 py-2.5 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold w-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all active:scale-95"
                      >
                        Send Code
                      </button>
                    </div>
                    <Field
                      label="Verification code"
                      icon={ShieldCheck}
                      error={emailForm.formState.errors.otp?.message}
                    >
                      <input
                        {...emailForm.register("otp")}
                        placeholder="6-digit code"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </Field>
                    <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                      <button
                        type="submit"
                        disabled={emailForm.formState.isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary dark:bg-secondary/90 text-white text-sm font-bold shadow-lg hover:bg-secondary/90 dark:hover:bg-secondary hover:shadow-xl transition-all disabled:opacity-40 active:scale-95 w-full sm:w-auto justify-center"
                      >
                        {emailForm.formState.isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck size={16} />
                        )}
                        Confirm Change
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="w-full lg:col-span-2">
                  <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
                    {/* Glow effect for dark mode */}
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 blur-2xl opacity-0 dark:opacity-60"></div>

                    <h3 className="text-base font-bold text-slate-600 dark:text-slate-400 mb-6">
                      Update Password
                    </h3>
                    <form
                      onSubmit={passwordForm.handleSubmit(onUpdatePassword)}
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Current Password
                          </label>
                          <input
                            type="password"
                            {...passwordForm.register("current_password")}
                            className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            placeholder="••••••••"
                          />
                          {passwordForm.formState.errors.current_password && (
                            <p className="text-xs text-red-500 mt-1">
                              {
                                passwordForm.formState.errors.current_password
                                  .message
                              }
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              {...passwordForm.register("password")}
                              onChange={(e) => {
                                passwordForm.setValue(
                                  "password",
                                  e.target.value
                                );
                                setPasswordStrength(
                                  calculatePasswordStrength(e.target.value)
                                );
                              }}
                              className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-10 text-sm"
                              placeholder="Min. 8 characters"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <Lock size={16} />
                            </div>
                          </div>
                          {passwordForm.watch("password") && (
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-slate-500">Strength</span>
                                <span
                                  className={passwordStrength.color.replace(
                                    "bg-",
                                    "text-"
                                  )}
                                >
                                  {passwordStrength.label}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${passwordStrength.color} transition-all duration-500`}
                                  style={{
                                    width: `${
                                      (passwordStrength.score / 4) * 100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {passwordForm.formState.errors.password && (
                            <p className="text-xs text-red-500 mt-1">
                              {passwordForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            {...passwordForm.register("password_confirmation")}
                            className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            placeholder="Repeat new password"
                          />
                          {passwordForm.formState.errors
                            .password_confirmation && (
                            <p className="text-xs text-red-500 mt-1">
                              {
                                passwordForm.formState.errors
                                  .password_confirmation.message
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          type="submit"
                          disabled={passwordForm.formState.isSubmitting}
                          className="flex items-center gap-2 px-6 py-3 bg-primary dark:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-lg hover:bg-primary/90 dark:hover:bg-primary hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
                        >
                          {passwordForm.formState.isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="w-full lg:col-span-1">
                  <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(239,68,68,0.1)]">
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 blur-2xl opacity-0 dark:opacity-40"></div>

                    <h3 className="text-base font-bold text-red-600 dark:text-red-400 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                      Once you deactivate your account, you will have 30 days to
                      request restoration.
                    </p>
                    <button
                      onClick={onDeactivate}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg font-bold text-sm hover:bg-red-100 dark:hover:bg-red-950/40 transition-all active:scale-95"
                    >
                      <Trash2 size={16} /> Deactivate Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "activity" && (
            <div className="space-y-6">
              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
                {/* Glow effect for dark mode */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 blur-2xl opacity-0 dark:opacity-60"></div>

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-slate-600 dark:text-slate-400">
                    Active Sessions
                  </h3>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                    {activeSessions.length} active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeSessions.length > 0 ? (
                    activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <ShieldCheck size={18} className="text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-200">
                              <span className="truncate max-w-[120px] font-mono text-[11px]">
                                {session.ip_address}
                              </span>
                              {session.is_current && (
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
                                  Active Now
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              Last active:{" "}
                              {new Date(session.last_active).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {!session.is_current && (
                          <button
                            onClick={() => onRevokeSession(session.id)}
                            className="px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg transition-all border-2 border-red-200 dark:border-red-800 active:scale-95"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                      No active sessions found
                    </div>
                  )}
                </div>
              </div>

              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
                {/* Glow effect for dark mode */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 blur-2xl opacity-0 dark:opacity-60"></div>

                <h3 className="text-base font-bold text-slate-600 dark:text-slate-400 mb-6">
                  Login History
                </h3>
                <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                  <table className="w-full text-left text-sm min-w-[600px]">
                    <thead>
                      <tr className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                        <th className="pb-4 pr-4 uppercase text-[10px] tracking-wider whitespace-nowrap">
                          Device / OS
                        </th>
                        <th className="pb-4 pr-4 uppercase text-[10px] tracking-wider whitespace-nowrap">
                          IP Address
                        </th>
                        <th className="pb-4 pr-4 uppercase text-[10px] tracking-wider whitespace-nowrap">
                          Date & Time
                        </th>
                        <th className="pb-4 pr-4 uppercase text-[10px] tracking-wider whitespace-nowrap">
                          Status
                        </th>
                        <th className="pb-4 uppercase text-[10px] tracking-wider text-right whitespace-nowrap">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {loginHistory.map((login) => (
                        <tr key={login.id} className="group">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                                {login.platform} ({login.browser})
                              </span>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                            {login.ip_address}
                          </td>
                          <td className="py-4 pr-4 text-slate-500 dark:text-slate-400 text-xs">
                            {new Date(login.created_at).toLocaleString()}
                          </td>
                          <td className="py-4 pr-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                login.status === "failed"
                                  ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                                  : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {login.status === "failed" ? "Failed" : "Success"}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => onDeleteHistoryEntry(login.id)}
                              className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                              title="Delete log"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {loginPagination.current_page < loginPagination.last_page && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={loadMoreHistory}
                      className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all uppercase tracking-wider active:scale-95"
                    >
                      Load More History
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
