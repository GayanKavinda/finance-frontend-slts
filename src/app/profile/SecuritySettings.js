// src/app/profile/SecuritySettings.js
/* eslint-disable react-hooks/incompatible-library */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "@/lib/axios";
import { fetchCsrf } from "@/lib/auth";
import { useSnackbar } from "notistack";
import { motion } from "framer-motion";
import {
  Loader2,
  Lock,
  Save,
  Trash2,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

function SectionHeader({ icon: Icon, title, iconColor = "text-primary" }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-2">
        {Icon && (
          <div
            className={`p-1.5 rounded-lg ${iconColor.replace("text-", "bg-")}/10`}
          >
            <Icon size={18} className={iconColor} />
          </div>
        )}
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div
        className={`h-0.5 w-16 bg-gradient-to-r ${iconColor.replace("text-", "from-").split(" ")[0]} to-transparent rounded-full`}
      ></div>
    </div>
  );
}

function Field({
  label,
  error,
  icon: Icon,
  iconColor = "text-slate-400",
  children,
  optional = false,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-wider">
        {Icon && <Icon size={12} className={iconColor} />} {label}{" "}
        {optional && (
          <span className="opacity-50 lowercase font-normal">(optional)</span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-[10px] text-red-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}

// Validation Schema
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

export default function SecuritySettings() {
  const { enqueueSnackbar } = useSnackbar();

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    mode: "onTouched",
  });

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

  const onUpdatePassword = async (data) => {
    console.log("[Profile] Password update initiated");
    try {
      await fetchCsrf();
      const res = await axios.post("/update-password", data);
      console.log("[Profile] Password update successful");
      enqueueSnackbar(res.data.message || "Password updated", {
        variant: "success",
      });
      passwordForm.reset();
    } catch (e) {
      console.error(
        "[Profile] Password update failed:",
        e.response?.data || e.message,
      );
      const msg =
        e.response?.data?.errors?.current_password?.[0] ||
        e.response?.data?.errors?.password?.[0] ||
        e.response?.data?.message ||
        "Security update failed";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const onDeactivate = async () => {
    if (
      !confirm(
        "Deactivate your account? You can request restore within 30 days.",
      )
    )
      return;
    console.warn("[Profile] Deactivating account...");
    try {
      await fetchCsrf();
      const res = await axios.post("/deactivate-account");
      console.log("[Profile] Account deactivated successfully");
      enqueueSnackbar(res.data.message || "Account deactivated", {
        variant: "success",
      });
      try {
        console.log("[Profile] Logging out after deactivation...");
        await axios.post("/logout");
      } catch {}
      window.location.href = "/signin";
    } catch (e) {
      console.error(
        "[Profile] Deactivation failed:",
        e.response?.data || e.message,
      );
      enqueueSnackbar(e.response?.data?.message || "Failed to deactivate", {
        variant: "error",
      });
    }
  };

  const onPermanentDelete = async () => {
    if (
      !confirm(
        "WARNING: PERMANENTLY REMOVE ACCOUNT? This action cannot be undone. All your data will be permanently deleted and you will lose access immediately.",
      )
    )
      return;
    if (!confirm("Are you ABSOLUTELY sure? This is your last chance.")) return;

    console.warn("[Profile] Permanently deleting account...");
    try {
      await fetchCsrf();
      const res = await axios.delete("/permanent-delete-account");
      console.log("[Profile] Account permanently removed");
      enqueueSnackbar(res.data.message || "Account permanently removed", {
        variant: "success",
      });
      window.location.href = "/signin";
    } catch (e) {
      console.error(
        "[Profile] Permanent deletion failed:",
        e.response?.data || e.message,
      );
      enqueueSnackbar(e.response?.data?.message || "Deletion failed", {
        variant: "error",
      });
    }
  };

  return (
    <motion.div
      key="security"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="w-full lg:col-span-2">
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(0,180,235,0.15)]">
            {/* Glow effect for dark mode */}
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 blur-2xl opacity-0 dark:opacity-60"></div>

            <SectionHeader
              icon={KeyRound}
              title="Update Password"
              iconColor="text-primary"
            />
            <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)}>
              <div className="space-y-4">
                <Field
                  label="Current Password"
                  icon={Lock}
                  iconColor="text-slate-400"
                  error={
                    passwordForm.formState.errors.current_password?.message
                  }
                >
                  <input
                    type="password"
                    {...passwordForm.register("current_password")}
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="••••••••"
                  />
                </Field>

                <Field
                  label="New Password"
                  icon={KeyRound}
                  iconColor="text-blue-500"
                  error={passwordForm.formState.errors.password?.message}
                >
                  <div className="relative">
                    <input
                      type="password"
                      {...passwordForm.register("password")}
                      onChange={(e) => {
                        passwordForm.setValue("password", e.target.value);
                        setPasswordStrength(
                          calculatePasswordStrength(e.target.value),
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
                    <div className="space-y-1.5 mt-2">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-slate-500">Strength</span>
                        <span
                          className={passwordStrength.color.replace(
                            "bg-",
                            "text-",
                          )}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-500`}
                          style={{
                            width: `${(passwordStrength.score / 4) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Field>

                <Field
                  label="Confirm New Password"
                  icon={ShieldCheck}
                  iconColor="text-emerald-500"
                  error={
                    passwordForm.formState.errors.password_confirmation?.message
                  }
                >
                  <input
                    type="password"
                    {...passwordForm.register("password_confirmation")}
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="Repeat new password"
                  />
                </Field>
              </div>

              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="relative flex items-center gap-2">
                    {passwordForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save
                          size={16}
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-12"
                        />
                        <span>Update Password</span>
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </form>
          </div>
        </div>

        <div className="w-full lg:col-span-1">
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/60 dark:bg-slate-950/40 dark:shadow-[0_0_80px_-12px_rgba(239,68,68,0.1)]">
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 blur-2xl opacity-0 dark:opacity-40"></div>

            <SectionHeader
              icon={ShieldAlert}
              title="Danger Zone"
              iconColor="text-red-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Once you deactivate your account, you will have 30 days to request
              restoration.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDeactivate}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-red-500/40 active:scale-95 mb-3"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <Lock
                size={16}
                className="transition-transform duration-300 group-hover:rotate-12"
              />
              <span>Deactivate Account</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPermanentDelete}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-red-200 dark:border-red-900/30 bg-white dark:bg-transparent px-4 py-2 text-xs font-bold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300"
            >
              <Trash2 size={16} />
              <span>Remove Account Permanently</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
