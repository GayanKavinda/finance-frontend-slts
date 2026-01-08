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
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

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
        met ? "bg-[#008001]" : "bg-slate-200 dark:bg-slate-800"
      }`}
    >
      {met ? (
        <Check className="w-1.5 h-1.5 text-white" />
      ) : (
        <X className="w-1.5 h-1.5 text-slate-400 dark:text-slate-500" />
      )}
    </div>
    <span
      className={`text-[10px] font-medium transition-colors ${
        met ? "text-[#008001]" : "text-slate-500 dark:text-slate-400"
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

  const getColor = () => {
    if (strength === 0) return "bg-slate-700";
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-amber-500";
    if (strength <= 4) return "bg-[#00B4EB]";
    return "bg-[#008001]";
  };

  return (
    <div className="flex gap-1 h-0.5 mt-1.5">
      {[1, 2, 3, 4, 5].map((level) => (
        <div
          key={level}
          className={`flex-1 rounded-full transition-colors duration-300 ${
            level <= strength ? getColor() : "bg-slate-200 dark:bg-slate-800"
          }`}
        />
      ))}
    </div>
  );
};

const InputField = ({
  label,
  icon: Icon,
  error,
  type = "text",
  isLoading,
  ...props
}) => (
  <div className="space-y-1 text-left w-full">
    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none">
        <Icon
          className={`w-4 h-4 transition-colors duration-200 ${
            error
              ? "text-red-500"
              : "text-slate-400 dark:text-slate-500 group-focus-within:text-[#00B4EB]"
          }`}
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
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-3.5 h-3.5 text-[#00B4EB] animate-spin" />
        </div>
      )}
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

export default function Signup() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { refetch } = useAuth();
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const password = useWatch({ control, name: "password", defaultValue: "" });
  const email = useWatch({ control, name: "email", defaultValue: "" });

  // Real-time Email Validation
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.log("[Signup] Real-time email validation for:", email);
        setIsCheckingEmail(true);
        try {
          const response = await axios.post("/api/check-email-exists", {
            email,
          });
          console.log("[Signup] Email check result:", response.data);
          if (response.data.exists) {
            setError("email", {
              type: "manual",
              message: "This email is already registered",
            });
          } else if (!response.data.valid_domain) {
            setError("email", {
              type: "manual",
              message: "Invalid email domain (no mail server)",
            });
          } else {
            clearErrors("email");
          }
        } catch (error) {
          console.error("[Signup] Email check error:", error.message);
        } finally {
          setIsCheckingEmail(false);
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [email, setError, clearErrors]);

  const onSubmit = async (data) => {
    console.log("[Signup] Form submission initiated:", {
      name: data.name,
      email: data.email,
    });
    try {
      console.log("[Signup] Fetching CSRF cookie...");
      await fetchCsrf();
      console.log("[Signup] CSRF fetched, attempting registration...");
      const response = await axios.post("/api/register", data);
      console.log("[Signup] Registration successful:", response.data);
      await refetch();
      enqueueSnackbar("Account created successfully!", { variant: "success" });
      router.push("/dashboard");
    } catch (error) {
      console.error("[Signup] Registration failed:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors,
      });
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach((key) => {
          setError(key, { type: "server", message: validationErrors[key][0] });
        });
        enqueueSnackbar("Please correct the highlighted errors.", {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Registration failed. Please try again.", {
          variant: "error",
        });
      }
    }
  };

  const reqs = [
    { text: "8+ chars", met: password.length >= 8 },
    { text: "Lowercase", met: /[a-z]/.test(password) },
    { text: "Uppercase", met: /[A-Z]/.test(password) },
    { text: "Number", met: /[0-9]/.test(password) },
    { text: "Symbol", met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-y-auto transition-colors duration-500">
      {/* Navigation Logo */}
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none pl-4 pr-6">
        <div className="max-w-7xl mx-auto h-16 flex items-center">
          <Link
            href="/"
            className="pointer-events-auto group flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="relative w-[120px] h-[40px] lg:w-[140px] lg:h-[45px]">
              <Image
                src="/icons/slt_digital_icon.png"
                alt="SLT Digital Logo"
                fill
                className="object-contain dark:brightness-0 dark:invert transition-all duration-300"
                priority
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Left Side: Immersive Image */}
      <div className="hidden lg:block w-1/2 relative bg-slate-900 overflow-hidden group">
        <Image
          src="/images/Signup.png"
          alt="Signup Showcase"
          fill
          className="object-cover transition-all duration-[1000ms] ease-out group-hover:scale-110 group-hover:brightness-110 group-hover:saturate-[1.2]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 via-transparent to-transparent z-10" />

        <div className="absolute bottom-12 left-12 right-12 z-20 transition-transform duration-700 ease-out group-hover:-translate-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight leading-[1.2]">
              Join the <br />
              <span className="text-[#00B4EB]">Digital Ecosystem</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
              The future of corporate financial management is here. Simple,
              powerful, and built for enterprise success.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Centered Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 lg:p-12 relative pt-24 pb-12 lg:py-0 overflow-y-auto">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00B4EB]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#008001]/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[420px] relative z-20 pt-24 pb-12 lg:py-0"
        >
          <div className="mb-8 text-left">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Empower your business with SLT Digital services
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              label="Full Name"
              icon={User}
              placeholder="Your Name"
              {...register("name")}
              error={errors.name?.message}
            />

            <InputField
              label="Work Email"
              icon={Mail}
              placeholder="name@company.com"
              {...register("email")}
              error={errors.email?.message}
              isLoading={isCheckingEmail}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <InputField
                  label="Password"
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  error={errors.password?.message}
                />
                {password && <PasswordStrengthMeter password={password} />}
              </div>
              <div className="space-y-1">
                <InputField
                  label="Confirm"
                  icon={ShieldCheck}
                  type="password"
                  placeholder="••••••••"
                  {...register("password_confirmation")}
                  error={errors.password_confirmation?.message}
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#020617]/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {reqs.map((req, i) => (
                <PasswordRequirement key={i} {...req} />
              ))}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isCheckingEmail}
                className="w-full py-3.5 bg-gradient-to-r from-[#00B4EB] to-[#009bc9] hover:from-[#00A0D1] hover:to-[#0089b3] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,180,235,0.15)] hover:shadow-[0_0_30px_rgba(0,180,235,0.3)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Get Started <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <p className="text-left text-[11px] text-slate-500 mt-4 leading-relaxed">
              By signing up, you agree to our{" "}
              <a href="#" className="font-bold text-[#00B4EB] hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-bold text-[#00B4EB] hover:underline">
                Privacy Policy
              </a>
              .
            </p>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-[#008001] font-bold hover:text-[#00B4EB] transition-colors uppercase text-xs tracking-widest ml-1"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
