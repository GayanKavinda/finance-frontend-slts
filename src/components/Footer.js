"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Footer() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide Footer on auth pages to maintain full-screen immersion
  if (["/signup", "/signin", "/forgot-password"].includes(pathname))
    return null;

  const isHomePage = pathname === "/";

  return (
    <footer
      className={`border-t py-12 transition-all duration-300 ${
        isHomePage
          ? "bg-black/90 backdrop-blur-xl border-white/10"
          : "bg-white dark:bg-[#0B1120] border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          {/* Left: SLT Logo */}
          <div className="relative w-[140px] h-[45px] md:w-[160px] md:h-[50px]">
            <Image
              src="/icons/slt_digital_icon.png"
              alt="SLT Digital Services"
              fill
              className={`object-contain transition-all duration-300 ${
                isHomePage || (mounted && theme === "dark")
                  ? "brightness-0 invert"
                  : ""
              }`}
            />
          </div>

          {/* Center: Company Info */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div
              className={`text-sm font-semibold uppercase tracking-wider ${
                isHomePage || (mounted && theme === "dark")
                  ? "text-slate-200"
                  : "text-slate-900"
              }`}
            >
              Sri Lanka Telecom Services
            </div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Finance Division
            </div>
          </div>

          {/* Right: Quick Links */}
          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className={`text-xs font-medium uppercase tracking-wider transition-colors ${
                isHomePage || (mounted && theme === "dark")
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-primary"
              }`}
            >
              Privacy
            </a>
            <a
              href="/terms"
              className={`text-xs font-medium uppercase tracking-wider transition-colors ${
                isHomePage || (mounted && theme === "dark")
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-primary"
              }`}
            >
              Terms
            </a>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div
          className={`pt-8 border-t text-center ${
            isHomePage || (mounted && theme === "dark")
              ? "border-slate-800/60"
              : "border-slate-200"
          }`}
        >
          <p className="text-xs tracking-wide text-slate-500">
            © {new Date().getFullYear()} Sri Lanka Telecom Services. All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
