// src/context/AuthContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "@/lib/axios";
import { fetchCsrf } from "@/lib/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    console.log("[AuthContext] Fetching user...");
    try {
      const response = await axios.get("/user");
      console.log("[AuthContext] User fetched successfully:", response.data);
      setUser(response.data);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[AuthContext] Initial check for user session...");
    if (
      window.location.pathname !== "/signin" &&
      window.location.pathname !== "/signup"
    ) {
      fetchUser();
    } else {
      console.log("[AuthContext] On auth page, skipping initial fetchUser");
      setLoading(false);
    }
  }, []);

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
