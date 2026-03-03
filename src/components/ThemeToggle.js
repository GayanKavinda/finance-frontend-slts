"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[4em] h-[2.2em] bg-slate-200/50 dark:bg-slate-800/50 rounded-[30px] animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center">
      <label className="group relative inline-block w-[4.2em] h-[2.2em] rounded-[30px] text-[14px] cursor-pointer ring-1 ring-black/5">
        <input
          checked={isDark}
          onChange={() => setTheme(isDark ? "light" : "dark")}
          className="opacity-0 w-0 h-0 peer"
          type="checkbox"
          id="theme-checkbox"
        />
        {/* Main Background Panel with Glassmorphism Border */}
        <span
          className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 transition-all duration-[600ms] rounded-[30px] overflow-hidden 
          peer-checked:from-[#00B4EB] peer-checked:to-[#00D2FF]
          border border-white/10 dark:border-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]
          after:absolute after:content-[''] after:h-[1.4em] after:w-[1.4em] after:rounded-full after:left-[0.4em] after:bottom-[0.4em] 
          after:transition-all after:duration-[600ms] after:[transition-timing-function:cubic-bezier(0.68,-0.55,0.265,1.55)] 
          after:bg-white after:shadow-[0_0_15px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.1)]
          peer-checked:after:translate-x-[2em] peer-checked:after:bg-[#FFD700] 
          peer-checked:after:shadow-[0_0_20px_rgba(255,215,0,0.6),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]"
        >
          {/* Moon Craters (Visible in Dark Mode) */}
          <div className="absolute left-[0.7em] top-[0.7em] w-1 h-1 bg-slate-200 rounded-full opacity-40 transition-all duration-500 group-has-[:checked]:opacity-0" />
          <div className="absolute left-[1.1em] top-[1.0em] w-0.5 h-0.5 bg-slate-200 rounded-full opacity-40 transition-all duration-500 group-has-[:checked]:opacity-0" />

          {/* Animated Stars */}
          <div className="bg-white rounded-full absolute w-[2px] h-[2px] animate-pulse left-[2.2em] top-[0.5em] group-has-[:checked]:opacity-0 transition-opacity duration-300" />
          <div className="bg-white rounded-full absolute w-[3px] h-[3px] animate-pulse [animation-delay:0.5s] left-[2.6em] top-[1.2em] group-has-[:checked]:opacity-0 transition-opacity duration-300" />
          <div className="bg-white rounded-full absolute w-[2px] h-[2px] animate-pulse [animation-delay:1s] left-[3.2em] top-[0.8em] group-has-[:checked]:opacity-0 transition-opacity duration-300" />

          {/* Premium Clouds - Targeted via group-has-[:checked] */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg
              viewBox="0 0 16 16"
              className="w-[3.2em] absolute bottom-[-0.8em] left-[-0.6em] opacity-0 translate-y-4 transition-all duration-500 group-has-[:checked]:opacity-40 group-has-[:checked]:translate-y-0"
            >
              <path
                fill="#fff"
                d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
                transform="matrix(.77976 0 0 .78395-299.99-418.63)"
              />
            </svg>
            <svg
              viewBox="0 0 16 16"
              className="w-[2.4em] absolute bottom-[-0.4em] right-[-0.5em] opacity-0 translate-y-4 transition-all duration-[700ms] group-has-[:checked]:opacity-30 group-has-[:checked]:translate-y-0"
            >
              <path
                fill="#fff"
                d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
                transform="matrix(.77976 0 0 .78395-299.99-418.63)"
              />
            </svg>
          </div>
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
