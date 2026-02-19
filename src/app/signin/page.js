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
  Mail as MailIcon,
  Lock as LockIcon,
} from "lucide-react";
import axios from "@/lib/axios";
import { useSnackbar } from "notistack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchCsrf } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

const schema = yup.object({
  email: yup
    .string()
    .required("Work email is required")
    .email("Invalid email format"),
  password: yup.string().required("Password is required"),
});

export default function Signin() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { refetch } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "Weak",
    color: "text-red-500",
    bars: [
      "bg-slate-200 dark:bg-slate-700",
      "bg-slate-200 dark:bg-slate-700",
      "bg-slate-200 dark:bg-slate-700",
      "bg-slate-200 dark:bg-slate-700",
    ],
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const passwordValue = watch("password", "");

  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength({
        score: -1,
        label: "N/A",
        color: "text-slate-400 dark:text-slate-600",
        bars: [
          "bg-slate-100 dark:bg-slate-800",
          "bg-slate-100 dark:bg-slate-800",
          "bg-slate-100 dark:bg-slate-800",
          "bg-slate-100 dark:bg-slate-800",
        ],
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
    const colors = [
      "text-red-500",
      "text-orange-500",
      "text-yellow-500",
      "text-sltGreen",
    ];

    const barColors = [0, 1, 2, 3].map((i) => {
      if (i >= score) return "bg-slate-200 dark:bg-slate-700";
      if (score === 1) return "bg-red-500";
      if (score === 2) return "bg-orange-500";
      if (score === 3) return "bg-yellow-500";
      return "bg-sltGreen";
    });

    setPasswordStrength({
      score,
      label: labels[score - 1] || "Weak",
      color: colors[score - 1] || "text-red-500",
      bars: barColors,
    });
  }, [passwordValue]);

  const onSubmit = async (data) => {
    try {
      await fetchCsrf();
      await axios.post("/login", data);
      await refetch();
      enqueueSnackbar("Welcome back to Finance Portal!", {
        variant: "success",
      });
      router.push("/dashboard");
    } catch (error) {
      if (error.response?.status === 401) {
        enqueueSnackbar("Invalid email or password.", { variant: "error" });
      } else {
        enqueueSnackbar("Login failed. Please try again.", {
          variant: "error",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-0 bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
      <main className="w-full max-w-4xl h-full sm:h-[540px] flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 transition-all duration-500 shadow-slate-200/50 dark:shadow-none">
        {/* BEGIN: LeftPanel_Visual_With_Background_Image */}
        <section className="hidden md:flex md:w-1/2 flex-col justify-between p-10 text-white relative overflow-hidden group">
          {/* Background Image Container */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/slides/6.wp9223826-finance-4k-wallpapers.avif"
              alt="Finance Background"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority
            />
            {/* Multi-layered Overlays */}
            <div className="absolute inset-0 bg-blue-900/60 dark:bg-blue-950/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-blue-900/40" />
            <div className="absolute inset-0 finance-pattern opacity-20" />
          </div>

          {/* Top Section */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-lg border border-white/20">
                <Image
                  src="/icons/slt_digital_icon.png"
                  alt="SLT Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-lg tracking-tight drop-shadow-md">
                SLT <span className="text-sltGreen">SERVICES</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-3 drop-shadow-lg">
              Financial Intelligence <br />& Strategic Insight.
            </h1>
            <p className="text-blue-50 text-base font-light max-w-xs opacity-95 leading-relaxed drop-shadow-md">
              Empowering the Internal Finance Division with secure, real-time
              data management.
            </p>
          </div>

          {/* Bottom Security Tag */}
          <div className="relative z-10 flex items-center gap-3 bg-white/10 dark:bg-white/5 p-3 rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-md transition-all shadow-xl">
            <ShieldCheck className="text-sltGreen w-5 h-5 drop-shadow-[0_0_8px_rgba(76,175,80,0.5)]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                System Status
              </p>
              <p className="text-sm font-semibold truncate">
                Finance Division Secure Portal - Active
              </p>
            </div>
          </div>
        </section>
        {/* END: LeftPanel_Visual */}

        {/* BEGIN: RightPanel_Form */}
        <section className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-[#0f172a] transition-all duration-500">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded flex items-center justify-center overflow-hidden bg-sltBlue">
              <Image
                src="/icons/slt_digital_icon.png"
                alt="SLT"
                width={28}
                height={28}
                className="brightness-0 invert object-contain"
              />
            </div>
            <span className="font-bold text-xl dark:text-white">
              SLT SERVICES
            </span>
          </div>

          <header className="mb-8 text-left">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 transition-colors tracking-tight">
              Finance Division Portal
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Secure access for authorized personnel only.
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label
                className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-1"
                htmlFor="email"
              >
                Work Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sltBlue transition-colors">
                  <MailIcon className="w-4 h-4" />
                </div>
                <input
                  className={`block w-full pl-10 pr-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sltBlue/20 focus:border-sltBlue transition-all outline-none ${errors.email ? "border-red-500" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}
                  id="email"
                  type="email"
                  placeholder="e.g. johndoe@slts.lk"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-500 mt-1 ml-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center px-1">
                <label
                  className="text-[13px] font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  size="sm"
                  className="text-[11px] font-bold text-sltBlue hover:text-sltBlue-light transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sltBlue transition-colors">
                  <LockIcon className="w-4 h-4" />
                </div>
                <input
                  className={`block w-full pl-10 pr-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sltBlue/20 focus:border-sltBlue transition-all outline-none ${errors.password ? "border-red-500" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 mt-1 ml-1 font-medium">
                  {errors.password.message}
                </p>
              )}

              <div className="mt-3 p-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Security Index
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${passwordStrength.color}`}
                  >
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
                className="h-4 w-4 text-sltBlue focus:ring-sltBlue/30 border-slate-300 dark:border-slate-700 rounded cursor-pointer bg-white dark:bg-slate-800"
              />
              <label
                htmlFor="remember-device"
                className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none"
              >
                Maintain secure session on this device
              </label>
            </div>

            <button
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-sltBlue to-sltBlue-dark hover:brightness-110 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-2 transition-all"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sign In to Portal"
              )}
            </button>
          </form>

          <footer className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 text-center transition-colors duration-500">
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-sltGreen hover:text-sltGreen-dark hover:underline ml-1.5 transition-all"
              >
                Sign Up
              </Link>
            </p>
            <div className="mt-6 flex justify-center items-center gap-4 grayscale opacity-40">
              <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-slate-400">
                Authorized Personnel Only
              </span>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
