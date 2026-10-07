// src/components/Providers.js

"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import CustomToast from "./Notifications";
import GooeyToasterSafe from "./GooeyToasterSafe";

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <GooeyToasterSafe />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
