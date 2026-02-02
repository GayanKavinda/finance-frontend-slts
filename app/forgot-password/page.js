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
  RefreshCw,
} from "lucide-react";
import axios from "@/lib/axios";
import { useSnackbar } from "notistack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

export default function ForgotPassword() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputs = useRef([]);

  // Timer logic for Resend Code
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
  } = useForm({
    resolver: yupResolver(emailSchema),
  });

  const onSubmitEmail = async (data) => {
    try {
      setIsLoading(true);
      await axios.post("/api/forgot-password-otp", { email: data.email });
      setEmail(data.email);
      setStep(2);
      setResendTimer(60); // Start 60s countdown
      enqueueSnackbar("Verification code sent!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || "Failed to send code", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    try {
      setIsLoading(true);
      await axios.post("/api/forgot-password-otp", { email });
      setResendTimer(60);
      enqueueSnackbar("New code sent successfully!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to resend code", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const {
    setValue: setOtpValue,
    handleSubmit: handleSubmitOtp,
    formState: { errors: errorsOtp },
  } = useForm({
    resolver: yupResolver(otpSchema),
  });

  // Sync otpValues to react-hook-form
  useEffect(() => {
    setOtpValue("otp", otpValues.join(""), { shouldValidate: true });
  }, [otpValues, setOtpValue]);

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);

    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newValues = [...otpValues];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newValues[i] = char;
    });
    setOtpValues(newValues);
    if (pastedData.length === 6) otpInputs.current[5].focus();
  };

  const onSubmitOtp = async (data) => {
    try {
      setIsLoading(true);
      await axios.post("/api/verify-otp", { email, otp: data.otp });
      // otp is stored in 'data.otp' from react-hook-form
      setStep(3);
      enqueueSnackbar("Code verified!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Invalid or expired code", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    formState: { errors: errorsPass },
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const onSubmitPassword = async (data) => {
    try {
      setIsLoading(true);
      await axios.post("/api/reset-password-otp", {
        email,
        otp: otpValues.join(""),
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      enqueueSnackbar("Password reset successfully!", { variant: "success" });
      router.push("/signin");
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to reset password",
        { variant: "error" },
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex items-center gap-2 mb-6 -ml-2">
            <button
              onClick={() => setStep(step > 1 ? step - 1 : 1)}
              className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-400 group"
              disabled={step === 1}
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform ${step > 1 ? "group-hover:-translate-x-1" : "opacity-0"}`}
              />
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Step {step} of 3
            </span>
          </div>

          <div className="mb-8 text-left">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              {step === 1 && "Reset Password"}
              {step === 2 && "Verify Code"}
              {step === 3 && "New Password"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[380px]">
              {step === 1 &&
                "Enter your email to receive a recovery code. We will send you instructions shortly."}
              {step === 2 &&
                `We've sent a 6-digit verification code to your email address for account validation.`}
              {step === 3 &&
                "Create a strong, unique password to secure your personal account information."}
            </p>
          </div>

          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="s1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSubmitEmail(onSubmitEmail)}
                  className="space-y-6"
                >
                  <InputField
                    label="Email Address"
                    icon={Mail}
                    placeholder="name@company.com"
                    {...registerEmail("email")}
                    error={errorsEmail.email?.message}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-[#00B4EB] to-[#009bc9] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,180,235,0.15)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Send Code <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="s2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSubmitOtp(onSubmitOtp)}
                  className="space-y-8"
                >
                  {/* Cyberpunk OTP Input */}
                  <div
                    className="flex justify-between gap-2 sm:gap-3"
                    onPaste={handlePaste}
                  >
                    {otpValues.map((digit, index) => (
                      <div key={index} className="relative group flex-1">
                        {/* Cyberpunk Underglow */}
                        <div
                          className={`absolute -inset-0.5 bg-gradient-to-t from-[#00B4EB] to-transparent rounded-xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-20 blur-[4px]`}
                        />

                        <input
                          ref={(el) => (otpInputs.current[index] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(e.target.value, index)
                          }
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className={`w-full aspect-square text-center text-2xl font-mono font-bold bg-white dark:bg-slate-950 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                            digit
                              ? "border-[#00B4EB] text-[#00B4EB] shadow-[0_0_15px_rgba(0,180,235,0.2)]"
                              : "border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-[#00B4EB]"
                          }`}
                        />
                        {/* Bottom Accent Line */}
                        <div
                          className={`absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-[#00B4EB] opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 rounded-full`}
                        />
                      </div>
                    ))}
                  </div>

                  {errorsOtp.otp && (
                    <p className="text-[11px] text-red-500 text-center font-bold tracking-wide uppercase">
                      {errorsOtp.otp.message}
                    </p>
                  )}

                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={isLoading || otpValues.includes("")}
                      className="w-full py-4 bg-[#008001] hover:bg-[#006e01] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,128,1,0.2)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Authorize Access"
                      )}
                    </button>

                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading || resendTimer > 0}
                        className={`flex items-center gap-2 text-[11px] font-bold transition-all uppercase tracking-widest ${
                          resendTimer > 0
                            ? "text-slate-400 cursor-not-allowed"
                            : "text-[#00B4EB] hover:text-[#009bc9]"
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw
                            className={`w-3 h-3 ${resendTimer > 0 ? "" : "animate-pulse"}`}
                          />
                        )}
                        {resendTimer > 0
                          ? `Resend Code in ${resendTimer}s`
                          : "Resend Verification Code"}
                      </button>
                      <p className="text-[10px] text-slate-400 text-center">
                        Didn&apos;t receive the email? Check your spam folder or
                        request a new one.
                      </p>
                    </div>
                  </div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form
                  key="s3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSubmitPass(onSubmitPassword)}
                  className="space-y-4"
                >
                  <InputField
                    label="New Password"
                    icon={Lock}
                    type="password"
                    placeholder="••••••••"
                    {...registerPass("password")}
                    error={errorsPass.password?.message}
                  />
                  <InputField
                    label="Confirm Password"
                    icon={ShieldCheck}
                    type="password"
                    placeholder="••••••••"
                    {...registerPass("password_confirmation")}
                    error={errorsPass.password_confirmation?.message}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-[#00B4EB] to-[#009bc9] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,180,235,0.15)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Reset Password <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
            <Link
              href="/signin"
              className="text-sm font-bold text-slate-500 hover:text-[#00B4EB] transition-colors uppercase text-xs tracking-widest"
            >
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Immersive Image */}
      <div className="hidden lg:block w-1/2 relative bg-slate-900 overflow-hidden group">
        <Image
          src="/images/signin.png"
          alt="Recovery Showcase"
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
              Secure <br />
              <span className="text-[#00B4EB]">Account Recovery</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
              Regain access to your financial assets with our multi-step secure
              verification system. Your security is our priority.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
