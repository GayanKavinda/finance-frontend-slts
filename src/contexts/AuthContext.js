// src/context/AuthContext.js
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "@/lib/axios";
import { fetchCsrf } from "@/lib/auth";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    console.log("[AuthContext] Fetching user...");
    try {
      const response = await axios.get("/user");
      console.log("[AuthContext] User fetched successfully:", response.data);
      setUser(response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error(
          "[AuthContext] fetchUser failed:",
          error.response?.status,
          error.message,
        );
      } else {
        console.log("[AuthContext] User not logged in (401)");
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      console.log("[AuthContext] Initial check for user session...");
      const currentUser = await fetchUser();
      
      if (!isMounted) return;

      // If user is already logged in and on landing/signin/signup page, redirect to dashboard
      const isAuthPage = ["/", "/signin", "/signup"].includes(window.location.pathname);
      if (isAuthPage && currentUser) {
        console.log("[AuthContext] User is already authenticated, redirecting to dashboard...");
        router.push("/dashboard");
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [fetchUser, router]);

  const logout = async () => {
    console.log("[AuthContext] Logout initiation started");
    try {
      await axios.post("/logout");
      console.log("[AuthContext] Logout successful");
    } catch (e) {
      console.error("[AuthContext] Logout API call failed:", e);
    }
    setUser(null);
    console.log("[AuthContext] User state cleared locally");
  };

  return (
    <AuthContext.Provider value={{ user, loading, refetch: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
