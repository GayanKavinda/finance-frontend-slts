// src/components/Sidebar.js
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, X, Sparkles } from "lucide-react";
import { navLinks } from "@/constants/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState(null);
  const { user } = useAuth();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  const userInitials = user ? getInitials(user.name) : "U";
  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-800 z-30 shadow-lg"
      >
        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute -right-4 top-8 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50 border-2 border-white dark:border-gray-900"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </motion.button>

        {/* Decorative Gradient Overlay */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        {/* Header Section */}
        <div className="relative h-16 flex items-center justify-center px-4 border-b border-gray-200/50 dark:border-gray-800/50">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  FinancePro
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks
            .filter(
              (link) =>
                !link.requiredPermission ||
                user?.permissions?.includes(link.requiredPermission),
            )
            .map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              const isHovered = hoveredItem === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredItem(link.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 text-primary shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary"
                  }`}
                  title={isCollapsed ? link.label : ""}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Icon */}
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-primary" : ""
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* Label */}
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`font-medium text-sm whitespace-nowrap ${
                        isActive ? "font-semibold" : ""
                      }`}
                    >
                      {link.label}
                    </motion.span>
                  )}

                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none"
                    >
                      {link.label}
                      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                    </motion.div>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4"
              >
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {userInitials}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {userName}
                  </span>
                  {userEmail && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {userEmail}
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center p-4"
              >
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary/30 transition-colors cursor-pointer">
                  {userInitials}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-800 z-50 lg:hidden flex flex-col shadow-2xl"
            >
              {/* Decorative Gradient */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 relative z-10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Menu
                  </h2>
                </div>
                <motion.button
                  onClick={() => setIsMobileOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navLinks
                  .filter(
                    (link) =>
                      !link.requiredPermission ||
                      user?.permissions?.includes(link.requiredPermission),
                  )
                  .map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden group ${
                          isActive
                            ? "bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 text-primary shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary"
                        }`}
                      >
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}

                        {/* Icon */}
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? "text-primary" : ""
                          }`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />

                        {/* Label */}
                        <span
                          className={`font-medium text-sm ${
                            isActive ? "font-semibold" : ""
                          }`}
                        >
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
              </nav>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    FinancePro
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  © 2026 SLT Digital
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
