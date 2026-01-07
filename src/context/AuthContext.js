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
    try {
      const response = await axios.get("/api/user");
      setUser(response.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("fetchUser failed:", error.response?.status);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      window.location.pathname !== "/signin" &&
      window.location.pathname !== "/signup"
    ) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await axios.post("/api/logout");
    } catch (e) {
      console.error("Logout failed");
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refetch: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
