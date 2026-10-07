// src/components/Sidebar.js
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
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

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

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
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border z-30"
      >
        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-accent transition-colors z-50"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </motion.div>
        </motion.button>

        {/* Header Section */}
        <div className="h-14 flex items-center justify-center px-4 border-b border-border/60">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                  PX
                </div>
                <span className="font-medium text-sm tracking-tight text-foreground">
                  ProcureX
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold"
              >
                PX
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 group relative ${
                    isActive
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                  title={isCollapsed ? link.label : ""}
                >
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />

                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm whitespace-nowrap"
                    >
                      {link.label}
                    </motion.span>
                  )}

                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="absolute left-full ml-2 px-2.5 py-1.5 bg-popover border border-border text-foreground text-xs rounded-md whitespace-nowrap shadow-medium z-50 pointer-events-none"
                    >
                      {link.label}
                    </motion.div>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-border/60 bg-muted/30">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-medium shrink-0">
                  {userInitials}
                </div>
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {userName}
                  </span>
                  {userEmail && (
                    <span className="text-xs text-muted-foreground truncate">
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
                className="flex items-center justify-center p-3"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-medium hover:bg-accent transition-colors cursor-pointer">
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[260px] bg-background border-r border-border z-50 lg:hidden flex flex-col shadow-medium"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                    PX
                  </div>
                  <span className="font-medium text-sm tracking-tight">
                    ProcureX
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
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
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ${
                          isActive
                            ? "bg-muted text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <Icon
                          className={`w-[18px] h-[18px] shrink-0 ${
                            isActive ? "text-primary" : ""
                          }`}
                          strokeWidth={isActive ? 2 : 1.5}
                        />
                        <span className="text-sm">{link.label}</span>
                      </Link>
                    );
                  })}
              </nav>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-border/60">
                <p className="text-[10px] text-muted-foreground font-medium">
                  SLT Digital
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  2026 All rights reserved
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
