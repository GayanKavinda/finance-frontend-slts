// src/components/Notifications.js
'use client';

import React, { forwardRef } from 'react';
import { useSnackbar, SnackbarContent } from 'notistack';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';

const CustomToast = forwardRef(({ id, message, variant = 'default' }, ref) => {
  const { closeSnackbar } = useSnackbar();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          border: 'border-emerald-500/30',
          bg: 'from-emerald-500/10 to-transparent',
          glow: 'shadow-emerald-500/20'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
          border: 'border-rose-500/30',
          bg: 'from-rose-500/10 to-transparent',
          glow: 'shadow-rose-500/20'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
          border: 'border-amber-500/30',
          bg: 'from-amber-500/10 to-transparent',
          glow: 'shadow-amber-500/20'
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5 text-cyan-400" />,
          border: 'border-cyan-500/30',
          bg: 'from-cyan-500/10 to-transparent',
          glow: 'shadow-cyan-500/20'
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-primary" />,
          border: 'border-white/10',
          bg: 'from-white/5 to-transparent',
          glow: 'shadow-white/5'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <SnackbarContent ref={ref} className="pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        className={`relative flex items-center gap-4 px-5 py-4 min-w-[320px] max-w-md bg-[#0c0e12]/90 backdrop-blur-2xl border ${styles.border} rounded-2xl shadow-2xl ${styles.glow} overflow-hidden`}
      >
        {/* Progress bar effect at bottom */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-linear-to-r from-transparent via-primary/50 to-transparent w-full opacity-50" />
        
        {/* Background gradient hint */}
        <div className={`absolute top-0 left-0 w-24 h-full bg-linear-to-r ${styles.bg} -z-10`} />

        {/* Icon container */}
        <div className="shrink-0">
          <div className="p-2 rounded-xl bg-white/5 relative">
            <div className="absolute inset-0 blur-sm opacity-50 rounded-xl" style={{ backgroundColor: 'currentColor' }} />
            {styles.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground/90 leading-snug">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => closeSnackbar(id)}
          className="shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </SnackbarContent>
  );
});

CustomToast.displayName = 'CustomToast';

export default CustomToast;
