// src/components/Layout.js

"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import axios from "@/lib/axios";
import { useSnackbar } from "notistack";

export default function Layout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  // Poll maintenance mode so the banner appears/disappears without a reload.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const run = async () => {
      try {
        const res = await axios.get("/system/maintenance-status");
        if (cancelled) return;
        setMaintenanceMode((prev) => {
          if (prev === false && res.data?.maintenance_mode === true) {
            enqueueSnackbar(
              "Maintenance mode enabled — write operations are temporarily disabled.",
              { variant: "warning" }
            );
          }
          return !!res.data?.maintenance_mode;
        });
      } catch {
        /* status is informational */
      }
    };

    run();
    const interval = setInterval(run, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, enqueueSnackbar]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // redirecting
  }

  const canManageSystem = (user.permissions || []).includes("manage-system");

  return (
    <div className="min-h-screen bg-transparent selection:bg-primary/20">
      <Navbar
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />
      {maintenanceMode && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-amber-500 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-xs font-medium">
            <Wrench className="w-4 h-4 shrink-0" />
            <span>
              Maintenance mode is active — write operations are disabled across
              the system. Read-only access remains available.
              {canManageSystem && " You can turn it off in Settings → System."}
            </span>
          </div>
        </div>
      )}
      <div className={`flex pt-16 ${maintenanceMode ? "mt-9" : ""}`}>
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
