"use client";

import { useEffect, useRef, useCallback } from "react";
import axios from "@/lib/axios";

import { AUTO_LOGOUT_TIMEOUT } from "@/constants/config";

const useAutoLogout = (timeout = AUTO_LOGOUT_TIMEOUT) => {
  // Default 30 minutes
  const timerRef = useRef(null);

  const logoutUser = useCallback(async () => {
    console.warn("[AutoLogout] Inactivity detected, logging out user...");
    try {
      await axios.post("/api/logout");
      console.log("[AutoLogout] Remote logout successful");
      window.location.href = "/signin?reason=inactivity";
    } catch (err) {
      console.error("[AutoLogout] Remote logout failed", err);
      window.location.href = "/signin";
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logoutUser, timeout);
  }, [logoutUser, timeout]);

  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => resetTimer();

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);
};

export default useAutoLogout;
