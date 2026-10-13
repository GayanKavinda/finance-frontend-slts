// src/app/signin/page.js
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import axios from "@/lib/axios";
import { toast } from "@/lib/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchCsrf } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const schema = yup.object({
  email: yup
    .string()
    .required("Work email is required")
    .email("Invalid email format"),
  password: yup.string().required("Password is required"),
  remember: yup.boolean(),
});

export default function Signin() {
  const { t } = useTranslation();
  const router = useRouter();
  const { refetch } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "Weak",
    bars: ["bg-muted", "bg-muted", "bg-muted", "bg-muted"],
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Two-factor challenge state (login step 2)
  const [twoFactorChallenge, setTwoFactorChallenge] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResending, setOtpResending] = useState(false);

  const passwordValue = watch("password", "");

  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength({
        score: -1,
        label: "N/A",
        bars: ["bg-muted", "bg-muted", "bg-muted", "bg-muted"],
      });
      return;
    }

    let score = 0;
    if (passwordValue.length >= 6) score = 1;
    if (passwordValue.length >= 8) score = 2;
    if (passwordValue.length >= 12) score = 3;
    if (passwordValue.length >= 16) score = 4;

    const hasUpper = /[A-Z]/.test(passwordValue);
    const hasNumber = /[0-9]/.test(passwordValue);
    const hasSpecial = /[^A-Za-z0-9]/.test(passwordValue);

    if (passwordValue.length >= 8) {
      if (hasUpper && hasNumber) score = Math.max(score, 3);
      if (hasSpecial) score = Math.max(score, 3);
      if (hasUpper && hasNumber && hasSpecial && passwordValue.length >= 10)
        score = 4;
    }

    const labels = ["Weak", "Fair", "Good", "Strong"];
    const barColors = [0, 1, 2, 3].map((i) => {
      if (i >= score) return "bg-muted";
      if (score === 1) return "bg-destructive";
      if (score === 2) return "bg-primary";
      return "bg-primary";
    });

    setPasswordStrength({
      score,
      label: labels[score - 1] || "Weak",
      bars: barColors,
    });
  }, [passwordValue]);

  const onSubmit = async (data) => {
    try {
      await fetchCsrf();
      const res = await axios.post("/login", data);

      // Two-factor challenge: password was accepted, now ask for the code.
      if (res.data?.two_factor_required) {
        setTwoFactorChallenge({
          token: res.data.twofa_token,
          emailHint: res.data.email_hint || "",
        });
        setOtp("");
        setOtpError("");
        toast.info("Enter the verification code sent to your email to continue.");
        return;
      }

      await refetch();
      toast.success("Welcome back to SLT ProcureX!");
      router.push("/dashboard");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Invalid email or password.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  const onVerifyOtp = async (e) => {
    e?.preventDefault?.();
    if (otp.length !== 6) {
      setOtpError("Enter the full 6-digit code");
      return;
    }

    setOtpVerifying(true);
    setOtpError("");
    try {
      await fetchCsrf();
      await axios.post("/verify-2fa", {
        twofa_token: twoFactorChallenge.token,
        otp,
      });
      await refetch();
      toast.success("Two-factor verification successful. Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      setOtpError(
        error.response?.data?.message || "Verification failed. Please try again."
      );
    } finally {
      setOtpVerifying(false);
    }
  };

  const onResendOtp = async () => {
    setOtpResending(true);
    setOtpError("");
    try {
      await fetchCsrf();
      await axios.post("/resend-2fa", { twofa_token: twoFactorChallenge.token });
      toast.success("A new verification code has been sent.");
    } catch (error) {
      setOtpError(
        error.response?.data?.message || "Could not resend the code."
      );
    } finally {
      setOtpResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <main className="w-full max-w-4xl flex flex-col md:flex-row bg-card border border-border rounded-xl overflow-hidden shadow-soft">
        {/* Left Panel */}
        <section className="hidden md:flex md:w-1/2 flex-col justify-between p-10 bg-muted/30">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                PX
              </div>
              <span className="font-medium text-sm tracking-tight text-foreground">
                ProcureX
              </span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-foreground mb-3">
              Financial Intelligence <br />& Strategic Insight.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Empowering the Internal Procurement Division with secure,
              real-time data management.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border border-border">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                System Status
              </p>
              <p className="text-xs font-medium text-foreground">
                SLT ProcureX Secure Portal - Active
              </p>
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <section className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center bg-card">
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
              PX
            </div>
            <span className="font-medium text-sm tracking-tight text-foreground">
              ProcureX
            </span>
          </div>

          <header className="mb-6 text-left">
            <h2 className="text-xl font-medium tracking-tight text-foreground mb-1">
              {twoFactorChallenge ? "Two-factor verification" : "Sign in to your account"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {twoFactorChallenge
                ? `Enter the 6-digit code sent to ${twoFactorChallenge.emailHint || "your email"}.`
                : "Secure access for authorized personnel only."}
            </p>
          </header>

          {twoFactorChallenge ? (
            /* ── 2FA verification panel ─────────────────────────── */
            <form onSubmit={onVerifyOtp} className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  A one-time verification code has been sent to your registered
                  email address. The code expires in 10 minutes.
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  className="text-xs font-medium text-foreground ml-1"
                  htmlFor="otp"
                >
                  {t("Verification Code")}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm tracking-[0.4em] font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${
                      otpError ? "border-destructive" : "border-border"
                    }`}
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setOtpError("");
                    }}
                  />
                </div>
                {otpError && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {otpError}
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                type="submit"
                disabled={otpVerifying || otp.length !== 6}
              >
                {otpVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify & Sign In"
                )}
              </Button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorChallenge(null);
                    setOtp("");
                    setOtpError("");
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("Back to sign in")}
                </button>
                <button
                  type="button"
                  onClick={onResendOtp}
                  disabled={otpResending}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {otpResending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {t("Resend code")}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label
                className="text-xs font-medium text-foreground ml-1"
                htmlFor="email"
              >
                {t("Work Email")}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.email ? "border-destructive" : "border-border"}`}
                  id="email"
                  type="email"
                  placeholder="e.g. johndoe@slts.lk"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center px-1">
                <label
                  className="text-xs font-medium text-foreground"
                  htmlFor="password"
                >
                  {t("Password")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {t("Forgot Password?")}
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.password ? "border-destructive" : "border-border"}`}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                  {errors.password.message}
                </p>
              )}

              <div className="mt-3 p-2 rounded-lg bg-muted/30 border border-border space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {t("Security Index")}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-foreground">
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="flex gap-1.5 h-1">
                  {passwordStrength.bars.map((barClass, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-500 ${barClass}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pb-1 pt-1">
              <input
                id="remember-device"
                name="remember-device"
                type="checkbox"
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/30"
                {...register("remember")}
              />
              <label
                htmlFor="remember-device"
                className="text-xs text-muted-foreground cursor-pointer select-none"
              >
                {t("Maintain secure session on this device")}
              </label>
            </div>

            <Button
              className="w-full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("Sign In to Portal")
              )}
            </Button>
          </form>
          )}

          <footer className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              {t("Don't have an account?")}{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}
