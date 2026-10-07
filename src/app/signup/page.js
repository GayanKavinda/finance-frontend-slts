// src/app/signup/page.js
"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Check,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import axios from "@/lib/axios";
import { useSnackbar } from "notistack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchCsrf } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const schema = yup.object({
  name: yup.string().required("Name is required").max(255),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "At least 8 characters")
    .matches(/[a-z]/, "Must contain lowercase")
    .matches(/[A-Z]/, "Must contain uppercase")
    .matches(/[0-9]/, "Must contain a number")
    .matches(/[^a-zA-Z0-9]/, "Must contain a symbol"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password required"),
});

const PasswordRequirement = ({ met, text }) => (
  <div className="flex items-center gap-1.5">
    <div
      className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${
        met ? "bg-primary" : "bg-muted"
      }`}
    >
      {met ? (
        <Check className="w-1.5 h-1.5 text-primary-foreground" />
      ) : (
        <X className="w-1.5 h-1.5 text-muted-foreground" />
      )}
    </div>
    <span
      className={`text-[10px] font-medium transition-colors ${
        met ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {text}
    </span>
  </div>
);

const PasswordStrengthMeter = ({ password }) => {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const pct = Math.min((strength / 5) * 100, 100);
  const color = strength <= 2 ? "bg-destructive" : strength <= 3 ? "bg-primary" : "bg-primary";

  return (
    <div className="space-y-1">
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {strength <= 2 ? "Weak" : strength <= 3 ? "Fair" : "Strong"} password
      </p>
    </div>
  );
};

export default function Signup() {
  const router = useRouter();
  const { refetch } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const password = watch("password", "");

  const nextStep = async () => {
    const fields = step === 1 ? ["name", "email"] : ["password", "password_confirmation"];
    const valid = await trigger(fields);
    if (valid) setStep(step + 1);
  };

  const onSubmit = async (data) => {
    try {
      await fetchCsrf();
      await axios.post("/register", data);
      enqueueSnackbar("Account created successfully!", { variant: "success" });
      router.push("/account-success");
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Registration failed. Please try again.",
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
            Create your account
          </h2>
          <p className="text-xs text-muted-foreground">
            Join the procurement management platform.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.name ? "border-destructive" : "border-border"}`}
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="email">
                  Work Email
                </label>
                <div className="relative">
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

              <Button
                type="button"
                onClick={nextStep}
                className="w-full"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.password ? "border-destructive" : "border-border"}`}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {errors.password.message}
                  </p>
                )}
                {password && <PasswordStrengthMeter password={password} />}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-foreground ml-1" htmlFor="password_confirmation">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${errors.password_confirmation ? "border-destructive" : "border-border"}`}
                    id="password_confirmation"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password_confirmation")}
                  />
                </div>
                {errors.password_confirmation && (
                  <p className="text-[11px] text-destructive mt-1 ml-1 font-medium">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </form>

        <footer className="mt-6 pt-5 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
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
