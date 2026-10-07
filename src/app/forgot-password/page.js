// src/app/forgot-password/page.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowRight,
  Loader2,
  Lock,
  CheckCircle2,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import axios from "@/lib/axios";
import { useSnackbar } from "notistack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const emailSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address"),
});

const otpSchema = yup.object({
  otp: yup.string().required("Code is required").length(6, "Must be 6 digits"),
});

const passwordSchema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "At least 8 characters"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password"),
});

const InputField = ({ label, icon: Icon, error, type = "text", ...props }) => (
  <div className="space-y-1 text-left w-full">
    <label className="text-xs font-medium text-foreground ml-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
        <Icon className="w-4 h-4" />
      </div>
      <input
        type={type}
        {...props}
        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${error ? "border-destructive" : "border-border"}`}
      />
    </div>
    {error && (
      <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
        {error}
      </p>
    )}
  </div>
);

export default function ForgotPassword() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const emailForm = useForm({
    resolver: yupResolver(emailSchema),
  });

  const otpForm = useForm({
    resolver: yupResolver(otpSchema),
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const onEmailSubmit = async (data) => {
    try {
      await axios.post("/forgot-password", { email: data.email });
      setEmail(data.email);
      enqueueSnackbar("OTP sent to your email.", { variant: "success" });
      setStep(2);
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to send OTP.",
        { variant: "error" }
      );
    }
  };

  const onOtpSubmit = async (data) => {
    try {
      await axios.post("/verify-otp", { email, otp: data.otp });
      enqueueSnackbar("OTP verified.", { variant: "success" });
      setStep(3);
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Invalid OTP.",
        { variant: "error" }
      );
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await axios.post("/reset-password", {
        email,
        otp: otpForm.getValues("otp"),
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      enqueueSnackbar("Password reset successfully.", { variant: "success" });
      router.push("/signin");
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to reset password.",
        { variant: "error" }
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <main className="w-full max-w-md bg-card border border-border rounded-xl shadow-soft p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
            PX
          </div>
          <span className="font-medium text-sm tracking-tight text-foreground">
            ProcureX
          </span>
        </div>

        <header className="mb-6 text-left">
          <h2 className="text-xl font-medium tracking-tight text-foreground mb-1">
            Reset your password
          </h2>
          <p className="text-xs text-muted-foreground">
            We&apos;ll help you get back into your account.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <InputField
                label="Work Email"
                icon={Mail}
                type="email"
                placeholder="e.g. johndoe@slts.lk"
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register("email")}
              />
              <Button type="submit" className="w-full">
                Send OTP <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={otpForm.handleSubmit(onOtpSubmit)}
              className="space-y-4"
            >
              <InputField
                label="Enter OTP"
                icon={ShieldCheck}
                type="text"
                placeholder="123456"
                maxLength={6}
                error={otpForm.formState.errors.otp?.message}
                {...otpForm.register("otp")}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button type="submit" className="flex-1">
                  Verify OTP
                </Button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <InputField
                label="New Password"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                error={passwordForm.formState.errors.password?.message}
                {...passwordForm.register("password")}
              />
              <InputField
                label="Confirm Password"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                error={passwordForm.formState.errors.password_confirmation?.message}
                {...passwordForm.register("password_confirmation")}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button type="submit" className="flex-1">
                  Reset Password
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <footer className="mt-6 pt-5 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/signin"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
