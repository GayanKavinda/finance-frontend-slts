// src/components/LayoutContent.js

"use client";

import { ScrollProvider, useScroll } from "@/contexts/ScrollContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import ThemeScrollArea from "@/components/ThemeScrollArea";
import { useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AUTH_PATHS } from "@/constants/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import ScrollToTop from "@/components/ScrollToTop";

const SidebarContext = createContext();

export const useSidebarContext = () => useContext(SidebarContext);

function ScrollableContent({ children }) {
  const { handleScroll } = useScroll();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Show sidebar on authenticated pages (not auth pages or home page)
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const isHomePage = pathname === "/";
  const showSidebar = user && !isAuthPage && !isHomePage;

  const renderContent = () => {
    if (isAuthPage) {
      return <PublicRoute>{children}</PublicRoute>;
    }
    if (isHomePage) {
      return children;
    }
    return <ProtectedRoute>{children}</ProtectedRoute>;
  };

  return (
    <SidebarContext.Provider
      value={{ isSidebarCollapsed, setIsSidebarCollapsed }}
    >
      <ThemeScrollArea
        className="h-full w-full bg-inherit"
        onScroll={handleScroll}
      >
        <div className="flex flex-col min-h-screen">
          <Navbar
            isMobileSidebarOpen={isMobileSidebarOpen}
            setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          />
          {showSidebar ? (
            <div className="flex flex-1">
              <Sidebar
                isMobileOpen={isMobileSidebarOpen}
                setIsMobileOpen={setIsMobileSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
              />
              <main
                className={`flex-1 pt-16 transition-all duration-300 ${
                  isSidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"
                }`}
              >
                {renderContent()}
              </main>
            </div>
          ) : (
            <MainContent>{renderContent()}</MainContent>
          )}
        </div>
      </ThemeScrollArea>
      <ScrollToTop />
    </SidebarContext.Provider>
  );
}

export default function LayoutContent({ children }) {
  return (
    <ScrollProvider>
      <ScrollableContent>{children}</ScrollableContent>
    </ScrollProvider>
  );
}
