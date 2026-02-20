// src/components/StatCard.js
"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function StatCard({
  title,
  value,
  prefix = "",
  decimals = 0,
  change,
  icon,
  delay = 0,
  color = "bg-blue-500",
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = typeof value === "number" ? value : parseFloat(value) || 0;
    if (!target) return;
    const duration = 1200;
    const steps = 50;
    const inc = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {title}
        </p>
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">
        {prefix}
        {count.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
      </p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          {change > 0 ? (
            <>
              <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500 font-medium">+{change}%</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
              <span className="text-red-500 font-medium">{change}%</span>
            </>
          )}
          <span className="text-gray-400 dark:text-gray-500 ml-1">
            vs last month
          </span>
        </div>
      )}
    </motion.div>
  );
}