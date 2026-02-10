"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import Breadcrumb from "@/components/Breadcrumb";
import PersonalDetails from "./PersonalDetails";
import SecuritySettings from "./SecuritySettings";
import ActivityLog from "./ActivityLog";

export default function ProfilePage() {
  const { user, loading, refetch } = useAuth();
  const [tab, setTab] = useState("personal");

  if (loading || !user) {
    return (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-6 pb-12">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Profile" },
            ]}
          />

          {/* Header - Centered with underline */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-600 dark:text-slate-400 mb-2">
              Profile Settings
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-700"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your personal information and security
              </p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-700"></div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center border-b border-slate-200 dark:border-slate-800 mb-6 relative">
            {[
              { key: "personal", label: "Personal" },
              { key: "security", label: "Security" },
              { key: "activity", label: "Activity" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative px-6 py-3 text-sm font-bold -mb-px transition-all duration-300 cursor-pointer rounded-t-xl ${
                  tab === t.key
                    ? "text-primary bg-white/10 dark:bg-white/5 backdrop-blur-md"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {t.label}
                {/* Active indicator with smooth transition */}
                {tab === t.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-700 to-purple-600 shadow-[0_-2px_10px_rgba(225,29,72,0.3)]"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {tab === "personal" && (
              <PersonalDetails key="personal" user={user} refetch={refetch} />
            )}

            {tab === "security" && <SecuritySettings key="security" />}

            {tab === "activity" && <ActivityLog key="activity" />}
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  );
}
