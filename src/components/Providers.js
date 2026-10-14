// src/components/Providers.js

"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import CustomToast from "./Notifications";
import GooeyToasterSafe from "./GooeyToasterSafe";

// Shared toast style — follows the app's light/dark design tokens so
// react-hot-toast matches the rest of the interface.
const toastStyle = {
  background: "hsl(var(--card))",
  color: "hsl(var(--card-foreground))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.625rem",
  fontSize: "0.8125rem",
  fontWeight: 500,
  padding: "10px 14px",
  maxWidth: "420px",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.06)",
};

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PreferencesProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationsProvider>
              <GooeyToasterSafe />
              {/* Renders every toast.success / toast.error raised by the
                  data pages after a create, update, delete or workflow action */}
              <Toaster
                position="top-center"
                gutter={8}
                toastOptions={{
                  duration: 4000,
                  style: toastStyle,
                  success: { iconTheme: { primary: "#10b981", secondary: "#ffffff" } },
                  error: { iconTheme: { primary: "#ef4444", secondary: "#ffffff" }, duration: 5000 },
                }}
              />
              {children}
            </NotificationsProvider>
          </AuthProvider>
        </LanguageProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
