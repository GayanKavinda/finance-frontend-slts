// src/app/reset-password/page.js
"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "@/lib/axios";
import { useSnackbar } from "notistack";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCsrf } from "@/lib/auth";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const schema = yup.object({
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

function ResetPasswordForm() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await fetchCsrf();
      await axios.post("/reset-password", {
        token,
        email,
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

  if (!token || !email) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Invalid or expired reset link.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:text-primary/80 mt-4 inline-block"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <InputField
        label="New Password"
        icon={Lock}
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />
      <InputField
        label="Confirm Password"
        icon={Lock}
        type="password"
        placeholder="••••••••"
        error={errors.password_confirmation?.message}
        {...register("password_confirmation")}
      />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Reset Password"
        )}
      </Button>
    </motion.form>
  );
}

export default function ResetPassword() {
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
            Set a new password
          </h2>
          <p className="text-xs text-muted-foreground">
            Your new password must be different from previous passwords.
          </p>
        </header>

        <Suspense fallback={<div className="text-xs text-muted-foreground">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>

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
