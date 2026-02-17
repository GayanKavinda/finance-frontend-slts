// src/components/PublicRoute.js
"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#020617]">
        <Loader2 className="w-10 h-10 animate-spin text-[#00B4EB]" />
      </div>
    );
  }

  // If user is logged in, we are already redirecting in useEffect.
  // We return null to avoid flashing the public page.
  if (user) {
    return null;
  }

  return children;
}
