//src/components/Navbar.js

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
  AlertTriangle,
  Bell,
  AlertCircle,
  Database,
  Server,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import useAutoLogout from "@/hooks/useAutoLogout";
import useSystemStatus from "@/hooks/useSystemStatus";
import { useScroll } from "@/contexts/ScrollContext";

import { navLinks, AUTH_PATHS } from "@/constants/navigation";


export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { metrics, alerts: systemAlerts } = useSystemStatus();
  useAutoLogout();

  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const isTransparentPage = isHomePage || isAuthPage;

  const { theme, setTheme, resolvedTheme } = useTheme();
  const { scrollY } = useScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  // const [themeMenuOpen, setThemeMenuOpen] = useState(false); // Removed
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    // setThemeMenuOpen(false); // Removed
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

  const isLightContent =
    mounted && ((isHomePage && !scrolled) || resolvedTheme === "dark");

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /* Removed static systemAlerts */

  const renderUserActions = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-4">
          <div className="w-24 h-10 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg" />
          <div className="w-10 h-10 bg-slate-200/50 dark:bg-slate-800/50 rounded-full" />
        </div>
      );
    }

    if (user) {
      return (
        <div className="flex items-center gap-4">
          {pathname === "/" && (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-medium rounded-xl backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/30 text-white transition-all duration-300 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          )}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className={`flex items-center gap-3 pl-2 pr-1 py-1.5 rounded-full transition-all border cursor-pointer ${
                isLightContent
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
                } ${isLightContent ? "text-white" : "text-slate-400"}`}
              />
            </button>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-full mt-4 w-60 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-2 z-60"
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
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all cursor-pointer"
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
      );
    }

    return (
      <div className="flex items-center gap-4 cursor-pointer">
        <Link
          href="/signin"
          className={`text-sm font-bold transition-colors ${
            isLightContent
              ? "text-white hover:text-white/80"
              : "text-slate-600 dark:text-slate-300 hover:text-primary"
          }`}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#005FA9] to-[#00B4EB] rounded-lg hover:from-[#004c87] hover:to-[#009bc9] transition-all shadow-lg cursor-pointer"
        >
          Get Started
        </Link>
      </div>
    );
  };

  return (
    <>
      <div className="w-full flex justify-center fixed top-0 z-50">
        <nav
          className={`w-full transition-all duration-500 ${
            isTransparentPage
              ? scrolled
                ? "bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-md border-b border-white/20 dark:border-white/10 shadow-lg"
                : "bg-transparent border-transparent"
              : "bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-md border-b border-white/20 dark:border-white/10 shadow-lg"
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
                    isLightContent
                      ? "brightness-0 invert"
                      : "dark:brightness-0 dark:invert"
                  }`}
                  priority
                />
              </div>
              <div
                className={`h-8 w-px self-center hidden md:block transition-colors ${
                  isLightContent
                    ? "bg-white/30"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              />

              <div className="hidden md:flex flex-col justify-center">
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider leading-none mb-0.5 transition-colors ${
                    isLightContent ? "text-white" : "text-[#00B4EB]"
                  }`}
                >
                  Sri Lanka Telecom Services
                </span>
                <span
                  className={`text-[11px] font-bold uppercase tracking-widest leading-none transition-colors ${
                    isLightContent
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
                      className="w-24 h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-md"
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
                  <div className="w-9 h-9 bg-white/5 dark:bg-white/5 rounded-full animate-pulse border border-white/10" />
                ) : (
                  <div
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className={`relative w-14 h-7 rounded-full cursor-pointer transition-all duration-500 p-1 flex items-center border group overflow-hidden ${
                      resolvedTheme === "dark"
                        ? "bg-white/5 border-white/10 hover:bg-white/10"
                        : "bg-white/20 border-white/30 hover:bg-white/30"
                    } backdrop-blur-xl shadow-lg ring-1 ring-black/5`}
                  >
                    {/* Glass Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`w-5 h-5 rounded-full shadow-[0_0_15px_rgba(0,180,235,0.4)] flex items-center justify-center transition-all duration-500 relative z-10 ${
                        resolvedTheme === "dark"
                          ? "bg-[#00B4EB] text-white translate-x-7"
                          : "bg-white text-[#00B4EB] translate-x-0"
                      }`}
                    >
                      {resolvedTheme === "dark" ? (
                        <Moon size={11} fill="currentColor" />
                      ) : (
                        <Sun size={11} fill="currentColor" />
                      )}
                    </motion.div>
                  </div>
                )}
              </div>

              {user && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className={`p-2 rounded-full transition-all relative cursor-pointer ${
                      isLightContent
                        ? "text-white hover:bg-white/20"
                        : "text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500"></span>
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setNotificationsOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 top-full mt-4 w-[360px] rounded-2xl bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
                        >
                          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                System Notifications
                              </h3>
                              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                                Status:{" "}
                                <span
                                  className={
                                    metrics.status === "operational"
                                      ? "text-emerald-500"
                                      : "text-amber-500"
                                  }
                                >
                                  {metrics.status}
                                </span>
                              </p>
                            </div>
                            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {systemAlerts.length} Active
                            </span>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/30 px-5 py-3 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 uppercase font-bold">
                                Load
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  metrics.serverLoad > 80
                                    ? "text-red-500"
                                    : "text-slate-700 dark:text-slate-200"
                                }`}
                              >
                                {metrics.serverLoad}%
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 uppercase font-bold">
                                Latency
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  metrics.dbLatency > 100
                                    ? "text-amber-500"
                                    : "text-slate-700 dark:text-slate-200"
                                }`}
                              >
                                {metrics.dbLatency}ms
                              </span>
                            </div>
                          </div>

                          <div className="max-h-[350px] overflow-y-auto">
                            {systemAlerts.length === 0 ? (
                              <div className="p-8 text-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                                <p className="text-xs text-slate-400">
                                  All systems operational
                                </p>
                              </div>
                            ) : (
                              systemAlerts.map((alert) => (
                                <div
                                  key={alert.id}
                                  className="px-5 py-4 border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                >
                                  <div className="flex gap-3">
                                    <div
                                      className={`p-2 rounded-lg ${
                                        alert.type === "error"
                                          ? "bg-red-500/10 text-red-500"
                                          : alert.type === "warning"
                                            ? "bg-amber-500/10 text-amber-500"
                                            : "bg-blue-500/10 text-blue-500"
                                      } h-fit`}
                                    >
                                      {alert.type === "error" ? (
                                        <AlertCircle size={16} />
                                      ) : alert.type === "warning" ? (
                                        <AlertTriangle size={16} />
                                      ) : (
                                        <CheckCircle2 size={16} />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                                          {alert.title}
                                        </h4>
                                        <span className="text-[9px] text-slate-400 font-medium">
                                          {alert.time}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                        {alert.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <Link
                            href="/system-logs"
                            onClick={() => setNotificationsOpen(false)}
                            className="block w-full py-3 text-center text-[11px] font-bold text-primary hover:bg-primary/5 transition-colors uppercase tracking-widest"
                          >
                            Open System Monitor
                          </Link>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* User Actions */}
              {![
                "/signup",
                "/signin",
                "/forgot-password",
                "/reset-password",
              ].includes(pathname) && renderUserActions()}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`p-2 ${
                  isLightContent
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
              <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "light", icon: Sun, label: "Light" },
                    { id: "dark", icon: Moon, label: "Dark" },
                    { id: "system", icon: Laptop, label: "System" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setTheme(mode.id)}
                      className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border ${
                        theme === mode.id
                          ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <mode.icon size={18} />
                      {mode.label}
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
