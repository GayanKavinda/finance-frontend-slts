// src/components/StatCard.js
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StatCard({ title, value, change, changeLabel, icon, delay = 0, variant = 'default' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const getChangeColor = () => change > 0 ? 'text-emerald-500' : change < 0 ? 'text-rose-500' : 'text-muted-foreground';
  const getIconBg = () => variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card group relative"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className={`w-9 h-9 rounded-lg ${getIconBg()} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
            {icon}
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold tracking-tight">
            ${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-[11px] font-semibold mt-2 ${getChangeColor()} px-2 py-0.5 rounded-full bg-white/5 inline-flex`}>
              {change > 0 ? <TrendingUp className="w-3 h-3" /> : change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              <span>{Math.abs(change)}% {changeLabel}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}