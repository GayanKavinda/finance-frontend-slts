// src/components/Notifications.js
'use client';

import React, { forwardRef } from 'react';
import { useSnackbar, SnackbarContent } from 'notistack';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';

const CustomToast = forwardRef(({ id, message, variant = 'default' }, ref) => {
  const { closeSnackbar } = useSnackbar();

  const getVariantConfig = () => {
    switch (variant) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          accent: 'bg-emerald-500',
          border: 'border-emerald-500/20',
          bg: 'bg-emerald-500/5',
          label: 'Success'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
          accent: 'bg-rose-500',
          border: 'border-rose-500/20',
          bg: 'bg-rose-500/5',
          label: 'Error'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
          accent: 'bg-amber-500',
          border: 'border-amber-500/20',
          bg: 'bg-amber-500/5',
          label: 'Warning'
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5 text-[#00B4EB]" />,
          accent: 'bg-[#00B4EB]',
          border: 'border-[#00B4EB]/20',
          bg: 'bg-[#00B4EB]/5',
          label: 'Information'
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-slate-500" />,
          accent: 'bg-slate-500',
          border: 'border-slate-500/20',
          bg: 'bg-slate-500/5',
          label: 'Notification'
        };
    }
  };

  const config = getVariantConfig();

  return (
    <SnackbarContent ref={ref} className="pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        className={`relative flex items-center gap-4 px-4 py-3.5 min-w-[300px] max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden transition-colors duration-300`}
      >
        {/* Decorative Side Accent */}
        <div className={`absolute top-0 left-0 w-1 h-full ${config.accent}`} />
        
        {/* Subtle Background Glow */}
        <div className={`absolute top-0 left-0 w-24 h-full ${config.bg} blur-xl -z-10 opacity-50`} />

        {/* Icon container */}
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-slate-100 dark:border-slate-700/50 transition-colors">
            {config.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pr-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
            {config.label}
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => closeSnackbar(id)}
          className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Minimal Progress Bar */}
        <motion.div 
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 4, ease: "linear" }}
            className={`absolute bottom-0 left-0 h-[2px] w-full ${config.accent} origin-left opacity-30`}
        />
      </motion.div>
    </SnackbarContent>
  );
});

CustomToast.displayName = 'CustomToast';

export default CustomToast;
