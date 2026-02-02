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
import Image from "next/image";

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
    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none">
        <Icon
          className={`w-4 h-4 transition-colors duration-200 ${error ? "text-red-500" : "text-slate-400 dark:text-slate-500 group-focus-within:text-[#00B4EB]"}`}
        />
      </div>
      <input
        type={type}
        {...props}
        className={`w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-950 border rounded-lg text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none transition-all duration-300 ${
          error
            ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
            : "border-slate-200 dark:border-slate-800 focus:border-[#00B4EB] focus:ring-1 focus:ring-[#00B4EB]/20 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      />
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[10px] text-red-500 font-medium ml-1"
      >
        {error}
      </motion.p>
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
    if (!token || !email) {
      enqueueSnackbar("Invalid reset link.", { variant: "error" });
      return;
    }

    try {
      await fetchCsrf();
      await axios.post("/api/reset-password", { ...data, token, email });
      enqueueSnackbar("Password reset successfully! Please sign in.", {
        variant: "success",
      });
      router.push("/signin");
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to reset password.",
        { variant: "error" },
      );
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" value={email || ""} {...register("email")} />
      <input type="hidden" value={token || ""} {...register("token")} />

      <InputField
        label="New Password"
        icon={Lock}
        type="password"
        placeholder="••••••••"
        {...register("password")}
        error={errors.password?.message}
      />
      <InputField
        label="Confirm Password"
        icon={ShieldCheck}
        type="password"
        placeholder="••••••••"
        {...register("password_confirmation")}
        error={errors.password_confirmation?.message}
      />

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-gradient-to-r from-[#00B4EB] to-[#009bc9] text-white font-bold rounded-xl shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Update Password <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
        <Link
          href="/signin"
          className="text-sm font-bold text-slate-500 hover:text-[#00B4EB] transition-colors uppercase text-xs tracking-widest"
        >
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-white dark:bg-[#020617] overflow-y-auto transition-colors duration-500 relative">
      {/* Left Side: Centered Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 lg:p-12 relative pt-24 pb-12 lg:py-0 overflow-y-auto">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#00B4EB]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#008001]/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[420px] relative z-20"
        >
          <div className="mb-10 text-left">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              Set New Password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[380px]">
              Join the SLT Digital professional network and secure your business
              identity with a new password today.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00B4EB]" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-12 text-left opacity-30">
            <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-[0.3em]">
              Validated by SLT Digital Security
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Immersive Image */}
      <div className="hidden lg:block w-1/2 relative bg-slate-900 overflow-hidden group">
        <Image
          src="/images/signin.png"
          alt="Reset Showcase"
          fill
          className="object-cover opacity-60 transition-all duration-[1000ms] ease-out group-hover:scale-110 group-hover:brightness-110 group-hover:saturate-[1.2]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#020617]/40 to-transparent z-10" />

        <div className="absolute bottom-12 left-12 right-12 z-20 transition-transform duration-700 ease-out group-hover:-translate-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight leading-[1.2]">
              Complete <br />
              <span className="text-[#00B4EB]">Security Update</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
              You&apos;re one step away from reclaiming your account. Please set
              a strong new password to continue.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
