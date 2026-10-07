//src/components/Navbar.js

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
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
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import useAutoLogout from "@/hooks/useAutoLogout";
import { useScroll } from "@/contexts/ScrollContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";

import { navLinks, AUTH_PATHS } from "@/constants/navigation";

export default function Navbar({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}) {
  const { user, loading, logout } = useAuth();
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
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
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
/* eslint-enable react-hooks/set-state-in-effect */

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

  const renderUserActions = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-3">
          <div className="w-20 h-8 bg-muted rounded-md" />
          <div className="w-8 h-8 bg-muted rounded-full" />
        </div>
      );
    }

    if (user) {
      return (
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-full border border-transparent hover:border-border transition-colors"
            >
              {user.avatar_url ? (
                <Avatar className="w-7 h-7">
                  <AvatarImage
                    src={user.avatar_url}
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-[10px]">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-medium">
                  {user.name?.charAt(0) || "U"}
                </div>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  profileMenuOpen ? "rotate-180" : ""
                } text-muted-foreground`}
              />
            </button>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 rounded-lg bg-popover border border-border shadow-medium p-1.5 z-50"
                >
                  <div className="px-3 py-2.5 mb-1.5 border-b border-border flex items-center gap-2.5">
                    {user.avatar_url ? (
                      <Avatar className="w-9 h-9">
                        <AvatarImage
                          src={user.avatar_url}
                          alt={user.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-[10px]">
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-medium">
                        {user.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
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
                      label: "Help",
                      icon: HelpCircle,
                      href: "/help",
                    },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}

                  <div className="mt-1.5 pt-1.5 border-t border-border">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
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
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/signin"
          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
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
          className={`w-full transition-colors duration-300 border-b ${
            isTransparentPage
              ? scrolled
                ? "bg-background/80 backdrop-blur-md border-border"
                : "bg-transparent border-transparent"
              : "bg-background/80 backdrop-blur-md border-border"
          } px-4 md:px-6`}
        >
          <div className="w-full mx-auto h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-[80px] h-[28px]">
                <Image
                  src="/icons/slt_digital_icon.png"
                  alt="SLT Digital Logo"
                  fill
                  sizes="80px"
                  className={`object-contain transition-all duration-300 ${
                    isLightContent
                      ? "brightness-0 invert"
                      : "dark:brightness-0 dark:invert"
                  }`}
                  priority
                />
              </div>
              <div className="hidden md:block h-4 w-px bg-border transition-colors" />

              <div className="hidden md:flex flex-col justify-center">
                <span className={`text-[8px] font-semibold uppercase tracking-wider leading-none mb-0.5 transition-colors ${
                  isLightContent ? "text-white" : "text-primary"
                }`}>
                  Sri Lanka Telecom
                </span>
                <span
                  className={`text-[10px] font-medium uppercase tracking-wider leading-none transition-colors ${
                    isLightContent
                      ? "text-white/70"
                      : "text-muted-foreground"
                  }`}
                >
                  Procurement Division
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {user && pathname !== "/" && (
                <button
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="p-2 rounded-md hover:bg-muted transition-colors lg:hidden"
                >
                  <Menu size={20} className="text-foreground" />
                </button>
              )}
              {renderUserActions()}
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
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                  PX
                </div>
                <span className="font-medium text-sm">ProcureX</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </motion.button>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto touch-pan-y custom-scrollbar">
              {user ? (
                <>
                  <div className="p-5 border-b border-border/60">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-border relative flex-shrink-0">
                          <Image
                            src={user.avatar_url}
                            alt={user.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground text-lg font-medium flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-base font-medium text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-0.5">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href;
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            isActive
                              ? "bg-muted text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          }`}
                        >
                          <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                          <span className="text-sm">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-auto p-5 border-t border-border">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-5 space-y-3">
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full bg-foreground text-background px-5 py-3 rounded-lg font-medium text-sm hover:bg-foreground/90 transition-colors">
                      Create Account
                    </button>
                  </Link>
                  <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full border border-border px-5 py-3 rounded-lg font-medium text-sm text-foreground hover:bg-muted transition-colors">
                      Sign In
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
