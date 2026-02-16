"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function AccountSuccess() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [timeLeft, setTimeLeft] = useState(8);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle navigation separately to avoid React "Cannot update a component while rendering" warning
  useEffect(() => {
    if (timeLeft === 0) {
      router.push("/dashboard");
    }
  }, [timeLeft, router]);

  if (!mounted) return null;

  const isDarkMode = resolvedTheme === "dark";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent transition-smooth relative overflow-hidden">
      {/* Background radial gradient that reacts to theme */}
      <div className="fixed inset-0 bg-subtle-gradient -z-10" />

      {/* COMPACT UNIFIED SPLIT-SCREEN LAYOUT */}
      <main
        className="relative w-full max-w-2xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl transition-smooth animate-scale-up"
        style={{
          backgroundColor: isDarkMode ? "#0d111d" : "#ffffff",
          border: isDarkMode
            ? "1px solid rgba(255, 255, 255, 0.05)"
            : "1px solid #e2e8f0",
        }}
      >
        {/* Left Section: Visual Branding */}
        <section
          className={`hidden md:flex md:w-5/12 flex-col justify-between p-7 relative border-r transition-smooth ${isDarkMode ? "border-white/5" : "border-slate-100"}`}
          style={{
            background: isDarkMode
              ? 'linear-gradient(rgba(5, 10, 20, 0.85), rgba(5, 10, 20, 0.85)), url("/images/Signup.png")'
              : 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("/images/Signup.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="z-10 flex items-center gap-2">
            <div className="bg-[#ff5c00] p-1.5 rounded-lg shadow-lg shadow-orange-500/10">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>
            <span
              className={`font-bold text-sm tracking-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-[#1e293b]"}`}
            >
              Finance Portal
            </span>
          </div>

          <div className="z-10">
            <h2
              className={`text-lg font-bold leading-tight mb-2 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-[#1e293b]"}`}
            >
              Secure Assets,
              <br />
              <span className="text-[#ff5c00]">Smarter Insights.</span>
            </h2>
            <p
              className={`text-[10px] leading-relaxed max-w-[180px] transition-colors duration-300 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
            >
              Access global financial standards and elite team tools instantly.
            </p>
          </div>

          <div
            className={`z-10 pt-4 border-t flex gap-3 transition-colors duration-300 ${isDarkMode ? "border-white/10" : "border-slate-200"}`}
          >
            <div
              className={`flex items-center gap-1.5 text-[8px] font-bold tracking-widest uppercase transition-colors duration-300 ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}
            >
              <svg
                className="w-3.5 h-3.5 text-[#ff5c00]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.946-2.597 9.29-6.518 11.771a1.304 1.304 0 01-1.482 0C6.097 16.29 3.5 11.946 3.5 7.001c0-.681.057-1.35.166-2.002zm7.5 4.74l4.146-4.147a.5.5 0 01.708.708L9.854 10.5a.5.5 0 01-.708 0L7.146 8.5a.5.5 0 11.708-.708L9.666 9.74z"
                  clipRule="evenodd"
                ></path>
              </svg>
              ISO 27001
            </div>
            <div
              className={`flex items-center gap-1.5 text-[8px] font-bold tracking-widest uppercase transition-colors duration-300 ${isDarkMode ? "text-gray-400" : "text-slate-400"}`}
            >
              <svg
                className="w-3.5 h-3.5 text-[#ff5c00]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              SSL
            </div>
          </div>
        </section>

        {/* Right Section: Success Message Content */}
        <section
          className={`w-full md:w-7/12 p-8 md:p-10 flex flex-col items-center justify-center text-center transition-smooth animate-scale-up ${isDarkMode ? "bg-transparent" : "bg-white"}`}
        >
          <div className="mb-5 relative">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center success-glow transition-colors duration-300 ${isDarkMode ? "bg-[#10b981]/10" : "bg-green-50/50"}`}
            >
              <svg
                className="h-8 w-8 text-[#10b981]"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  className="checkmark-path animate-check"
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>
          </div>

          <header className="mb-6">
            <h1
              className={`text-xl md:text-2xl font-bold mb-2 tracking-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-[#1e293b]"}`}
            >
              Account Created!
            </h1>
            <p
              className={`text-xs max-w-[240px] mx-auto px-4 transition-colors duration-300 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
            >
              Welcome to the Finance Portal. Redirecting to your dashboard in{" "}
              {timeLeft}s...
            </p>
          </header>

          <div className="w-full max-w-[200px] space-y-3">
            <div
              className={`h-1 w-full rounded-full overflow-hidden transition-colors duration-300 ${isDarkMode ? "bg-white/10" : "bg-slate-100"}`}
            >
              <div
                className="h-full bg-linear-to-r from-[#3197e3] to-[#13b5d8] animate-progress-bar rounded-full"
                style={{ "--progress-duration": "8s" }}
              ></div>
            </div>
            <div
              className={`flex items-center justify-center gap-1.5 text-[10px] font-medium transition-colors duration-300 ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}
            >
              <svg
                className="animate-spin h-3 w-3 text-[#3197e3]"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  fill="currentColor"
                ></path>
              </svg>
              Syncing...
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/dashboard"
              className={`inline-flex items-center gap-2 px-4 py-2 transition-all duration-300 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                isDarkMode
                  ? "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-[#1e293b]"
              }`}
            >
              <span>Go to Dashboard</span>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </Link>
          </div>

          <footer
            className={`mt-8 pt-4 border-t w-full flex items-center justify-center transition-colors duration-300 ${isDarkMode ? "border-white/5" : "border-slate-100"}`}
          >
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
              Need help?
            </a>
          </footer>
        </section>
      </main>
    </div>
  );
}
