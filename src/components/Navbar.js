"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ReceiptText,
  Target,
  PieChart,
  User as UserIcon,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import useAutoLogout from "@/hooks/useAutoLogout";
import { useScroll } from "@/contexts/ScrollContext";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/reports", label: "Reports", icon: PieChart },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  useAutoLogout(30 * 60 * 1000);

  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { scrollY } = useScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setThemeMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    setScrolled(scrollY > 50);
  }, [scrollY]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (
    ["/signup", "/signin", "/forgot-password", "/reset-password"].includes(
      pathname
    )
  )
    return null;

  const isHomePage = pathname === "/";

  return (
    <>
      <div className="w-full flex justify-center fixed top-0 z-50">
        <nav
          className={`w-full transition-all duration-500 ${
            isHomePage
              ? scrolled
                ? "bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-800/30"
                : "bg-transparent border-transparent"
              : "bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-200/30 dark:border-slate-800/30"
          } px-4 md:px-6`}
        >
          <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-[120px] h-[40px]">
                <Image
                  src="/icons/slt_digital_icon.png"
                  alt="SLT Digital Logo"
                  fill
                  className={`object-contain transition-all duration-300 ${
                    isHomePage
                      ? "brightness-0 invert"
                      : "dark:brightness-0 dark:invert"
                  }`}
                  priority
                />
              </div>
              <div
                className={`h-8 w-px self-center hidden md:block transition-colors ${
                  isHomePage ? "bg-white/30" : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
              <div className="hidden md:flex flex-col justify-center">
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider leading-none mb-0.5 transition-colors ${
                    isHomePage ? "text-white" : "text-[#00B4EB]"
                  }`}
                >
                  Sri Lanka Telecom Services
                </span>
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest leading-none transition-colors ${
                    isHomePage
                      ? "text-white/80"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Finance Division
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {loading ? (
                <div className="flex items-center gap-4 mr-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-24 h-8 bg-slate-200/50 dark:bg-slate-800/50 animate-pulse rounded-md"
                    />
                  ))}
                </div>
              ) : (
                user &&
                pathname !== "/" && (
                  <div className="flex items-center gap-1 mr-4">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href;
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`px-3 py-2 text-sm font-medium transition-all flex items-center gap-2 rounded-md ${
                            isActive
                              ? "text-primary bg-primary/5"
                              : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? "text-primary" : "text-slate-400"
                            }`}
                          />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )
              )}

              {/* Theme Toggle */}
              <div className="relative">
                {!mounted ? (
                  <div className="w-9 h-9 bg-slate-200/50 dark:bg-slate-800/50 animate-pulse rounded-full" />
                ) : (
                  <>
                    <button
                      onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                      className={`p-2 rounded-full transition-colors ${
                        isHomePage
                          ? "text-white hover:bg-white/20"
                          : "text-slate-500 hover:text-[#00B4EB] hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      aria-label="Toggle Theme"
                    >
                      {theme === "dark" ? (
                        <Moon size={20} />
                      ) : theme === "light" ? (
                        <Sun size={20} />
                      ) : (
                        <Laptop size={20} />
                      )}
                    </button>

                    <AnimatePresence>
                      {themeMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                          className="absolute right-0 top-full mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1 z-50 overflow-hidden"
                        >
                          {[
                            { name: "light", icon: Sun, label: "Light" },
                            { name: "dark", icon: Moon, label: "Dark" },
                            { name: "system", icon: Laptop, label: "System" },
                          ].map((t) => (
                            <button
                              key={t.name}
                              onClick={() => {
                                setTheme(t.name);
                                setThemeMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${
                                theme === t.name
                                  ? "bg-[#00B4EB]/10 text-[#00B4EB]"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              <t.icon size={14} />
                              {t.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* User Actions */}
              {loading ? (
                <div className="flex items-center gap-4">
                  <div className="w-24 h-10 bg-slate-200/50 dark:bg-slate-800/50 animate-pulse rounded-lg" />
                  <div className="w-10 h-10 bg-slate-200/50 dark:bg-slate-800/50 animate-pulse rounded-full" />
                </div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  {pathname === "/" && (
                    <Link
                      href="/dashboard"
                      className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#005FA9] to-[#00B4EB] rounded-lg hover:from-[#004c87] hover:to-[#009bc9] transition-all shadow-lg flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className={`flex items-center gap-3 pl-2 pr-1 py-1.5 rounded-full transition-all border ${
                        isHomePage
                          ? "hover:bg-white/20 border-white/30"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent"
                      }`}
                    >
                      {user.avatar_url ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                          <Image
                            src={user.avatar_url}
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold uppercase">
                          {user.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          profileMenuOpen ? "rotate-180" : ""
                        } ${isHomePage ? "text-white" : "text-slate-400"}`}
                      />
                    </button>

                    <AnimatePresence>
                      {profileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 top-full mt-4 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-60"
                        >
                          <div className="px-4 py-3 mb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            {user.avatar_url ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 relative flex-shrink-0">
                                <Image
                                  src={user.avatar_url}
                                  alt={user.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold uppercase flex-shrink-0">
                                {user.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          {[
                            {
                              label: "Profile",
                              icon: UserIcon,
                              href: "/profile",
                            },
                            {
                              label: "Help & Support",
                              icon: HelpCircle,
                              href: "/help",
                            },
                          ].map((item, i) => (
                            <Link
                              key={i}
                              href={item.href}
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 transition-all"
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          ))}

                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/signin"
                    className={`text-sm font-bold transition-colors ${
                      isHomePage
                        ? "text-white hover:text-white/80"
                        : "text-slate-600 dark:text-slate-300 hover:text-primary"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#005FA9] to-[#00B4EB] rounded-lg hover:from-[#004c87] hover:to-[#009bc9] transition-all shadow-lg"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`p-2 ${
                  isHomePage
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-[#0F172A] flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 group"
                >
                  <div className="relative w-[100px] h-[32px]">
                    <Image
                      src="/icons/slt_digital_icon.png"
                      alt="Logo"
                      fill
                      className="object-contain dark:brightness-0 dark:invert relative z-10"
                    />
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 self-center" />
                  <div className="flex flex-col justify-center">
                    <span className="text-[8px] font-extrabold text-[#00B4EB] uppercase tracking-wider leading-none mb-0.5">
                      Sri Lanka Telecom Services
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                      Finance Division
                    </span>
                  </div>
                </Link>
              </motion.div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto touch-pan-y custom-scrollbar">
              {user ? (
                <>
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-2xl p-4 mb-6 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 relative flex-shrink-0 shadow-lg">
                          <Image
                            src={user.avatar_url}
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold uppercase flex-shrink-0 shadow-lg">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-slate-900 dark:text-white truncate mb-0.5">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
                      Navigation
                    </p>
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all active:scale-95"
                      >
                        <link.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-1 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
                      Account
                    </p>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all active:scale-95"
                    >
                      <UserIcon className="w-5 h-5 flex-shrink-0" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/help"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all active:scale-95"
                    >
                      <HelpCircle className="w-5 h-5 flex-shrink-0" />
                      <span>Help & Support</span>
                    </Link>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center justify-center gap-3 w-full px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-3">
                    Get Started
                  </p>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full bg-gradient-to-r from-[#005FA9] to-[#00B4EB] text-white px-6 py-3.5 rounded-xl font-bold hover:shadow-xl transition-all active:scale-95 shadow-lg text-base">
                      Create Account
                    </button>
                  </Link>
                  <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full border-2 border-slate-300 dark:border-slate-700 px-6 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all active:scale-95 text-base mt-3">
                      Sign In
                    </button>
                  </Link>
                </div>
              )}

              <div className="pt-8 mt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/10 relative overflow-hidden group"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-xl bg-primary/20 text-primary">
                        <Sparkles size={16} />
                      </div>
                      <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
                        Premium Finance
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                      Empower Growth, <br />
                      Digital SLT
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                      Join the future of corporate finance with SLT Digital.
                    </p>
                    <button className="px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                      Learn More <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <div className="grid grid-cols-3 gap-2">
                  {["light", "dark", "system"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTheme(mode)}
                      className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 text-xs font-bold uppercase transition-all active:scale-95 ${
                        theme === mode
                          ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {mode === "light" ? (
                        <Sun size={16} />
                      ) : mode === "dark" ? (
                        <Moon size={16} />
                      ) : (
                        <Laptop size={16} />
                      )}
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
