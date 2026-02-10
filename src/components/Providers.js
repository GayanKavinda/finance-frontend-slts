// src/components/Providers.js

"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "next-themes";
import CustomToast from "./Notifications";

export default function Providers({ children }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      Components={{
        success: CustomToast,
        error: CustomToast,
        warning: CustomToast,
        info: CustomToast,
        default: CustomToast,
      }}
      autoHideDuration={4000}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </SnackbarProvider>
  );
}
