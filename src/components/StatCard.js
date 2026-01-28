// src/components/StatCard.js
"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useState } from "react";

export default function StatCard({
  title,
  value,
  prefix = "",
  decimals = 0,
  change,
  changeLabel,
  icon,
  delay = 0,
  variant = "default",
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Ensure value is a number
    const numericValue =
      typeof value === "number" ? value : parseFloat(value) || 0;

    const duration = 1000;
    const steps = 40;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const getChangeColor = () =>
    change > 0
      ? "text-emerald-400"
      : change < 0
        ? "text-rose-400"
        : "text-primary/40";
  const getIconContainer = () =>
    variant === "destructive"
      ? "bg-rose-500/20 text-rose-500 border-rose-500/20"
      : "bg-primary/20 text-primary border-primary/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="premium-card p-6 group relative overflow-hidden active:scale-95 transition-all cursor-default"
    >
      {/* Glossy Reflection */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div
            className={`w-11 h-11 rounded-2xl border ${getIconContainer()} flex items-center justify-center mb-5 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg`}
          >
            {icon}
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black tracking-tighter text-foreground">
              {prefix}
              {displayValue.toLocaleString("en-US", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })}
            </p>
          </div>

          {change !== undefined && (
            <div
              className={`flex items-center gap-2 text-[10px] font-black mt-4 uppercase tracking-widest ${getChangeColor()} transition-colors`}
            >
              <div
                className={`p-1 rounded-lg bg-white/5 border border-white/5`}
              >
                {change > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : change < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
              </div>
              <span className="opacity-80">
                {Math.abs(change)}% {changeLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
