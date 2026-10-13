// src/components/Providers.js

"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import CustomToast from "./Notifications";
import GooeyToasterSafe from "./GooeyToasterSafe";

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PreferencesProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationsProvider>
              <GooeyToasterSafe />
              {children}
            </NotificationsProvider>
          </AuthProvider>
        </LanguageProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
