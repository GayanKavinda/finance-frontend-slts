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
  color = "bg-gradient-to-br from-blue-500 to-blue-600",
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;
    const duration = 1500;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`inline-flex p-3 rounded-lg ${color} mb-4 shadow-md`}>
            {icon}
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {prefix}
            {count.toLocaleString("en-US", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              {change > 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-medium">+{change}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                  <span className="text-red-500 font-medium">{change}%</span>
                </>
              )}
              <span className="text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}