"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Footer() {
  const pathname = usePathname();

  // Hide Footer on auth pages to maintain full-screen immersion
  if (["/signup", "/signin", "/forgot-password"].includes(pathname))
    return null;

  const isHomePage = pathname === "/";

  return (
    <footer
      className={`border-t py-8 transition-all duration-300 ${
        isHomePage
          ? "bg-black/80 backdrop-blur-xl border-white/10"
          : "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          {/* Left: SLT Logo */}
          <div className="relative w-[140px] h-[45px] md:w-[160px] md:h-[50px]">
            <Image
              src="/icons/slt_digital_icon.png"
              alt="SLT Digital Services"
              fill
              className={`object-contain transition-all duration-300 ${
                isHomePage
                  ? "brightness-0 invert"
                  : "dark:brightness-0 dark:invert"
              }`}
            />
          </div>

          {/* Center: Company Info */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div
              className={`text-sm font-semibold uppercase tracking-wider ${
                isHomePage
                  ? "text-white/90"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              Sri Lanka Telecom Services
            </div>
            <div
              className={`text-xs uppercase tracking-wide ${
                isHomePage
                  ? "text-white/60"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              Finance Division
            </div>
          </div>

          {/* Right: Quick Links */}
          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className={`text-xs font-medium uppercase tracking-wider transition-colors ${
                isHomePage
                  ? "text-white/70 hover:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-[#005FA9] dark:hover:text-[#00B4EB]"
              }`}
            >
              Privacy
            </a>
            <a
              href="/terms"
              className={`text-xs font-medium uppercase tracking-wider transition-colors ${
                isHomePage
                  ? "text-white/70 hover:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-[#005FA9] dark:hover:text-[#00B4EB]"
              }`}
            >
              Terms
            </a>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div
          className={`pt-6 border-t text-center ${
            isHomePage ? "border-white/10" : "border-slate-200 dark:border-slate-800"
          }`}
        >
          <p
            className={`text-xs tracking-wide ${
              isHomePage
                ? "text-white/50"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            © {new Date().getFullYear()} Sri Lanka Telecom Services. All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}