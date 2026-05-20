"use client";

import React from "react";
import { DotmSquare12 } from "@/components/ui/dotm-square-12";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LoadingOverlay
 * 
 * A premium glassmorphism overlay using the DotmSquare12 loader.
 */
export function LoadingOverlay({ isLoading, message = "Processing..." }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/20 backdrop-blur-md"
        >
          <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl flex flex-col items-center gap-4">
            <DotmSquare12 size={48} dotSize={6} color="#c084fc" />
            <span className="text-sm font-medium text-white/70 animate-pulse tracking-widest uppercase">
              {message}
            </span>
            
            {/* Ambient Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl -z-10 rounded-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * SkeletonLoader
 * 
 * A component-level loader for specific sections.
 */
export function SkeletonLoader() {
  return (
    <div className="w-full h-48 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
      <DotmSquare12 size={32} dotSize={4} color="rgba(255,255,255,0.2)" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
  );
}
