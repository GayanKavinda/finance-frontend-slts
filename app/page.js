"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Lock,
  Zap,
  Database,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const slides = [
  {
    title: "Next-Gen Financial Intelligence",
    subtitle: "AI-powered insights for smarter corporate decisions",
    icon: TrendingUp,
    color: "from-[#00B4EB] to-[#009bc9]",
  },
  {
    title: "Bank-Grade Security",
    subtitle: "Enterprise encryption, compliance & zero-trust architecture",
    icon: Lock,
    color: "from-[#008001] to-[#006d00]",
  },
  {
    title: "Real-Time Financial Control",
    subtitle: "Live analytics, cash flow & instant budget enforcement",
    icon: Zap,
    color: "from-[#00B4EB] to-[#008001]",
  },
  {
    title: "Unified Enterprise Finance",
    subtitle: "Seamless integration across all your financial platforms",
    icon: Database,
    color: "from-cyan-400 to-teal-500",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="relative overflow-hidden transition-colors duration-700">
      {/* Subtle circuit background */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="circuit"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="50" cy="50" r="1.5" fill="#00B4EB" opacity="0.4" />
              <line
                x1="50"
                y1="50"
                x2="100"
                y2="50"
                stroke="#00B4EB"
                strokeWidth="0.8"
                opacity="0.25"
              />
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="0"
                stroke="#00B4EB"
                strokeWidth="0.8"
                opacity="0.25"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      {/* Dynamic gradient orbs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.75 }}
          transition={{ duration: 1.4 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br ${slides[currentSlide].color} opacity-20 blur-3xl`}
          />
          <div
            className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tl ${slides[currentSlide].color} opacity-20 blur-3xl`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-5 sm:px-8 py-10 lg:py-16 min-h-[calc(100vh-80px)]">
        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl backdrop-blur-xl border bg-white/75 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-700/50 shadow-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00B4EB] to-[#008001] rounded-lg blur-md opacity-40" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B4EB] to-[#008001] flex items-center justify-center">
                <span className="text-lg font-bold text-white tracking-tight">
                  S
                </span>
              </div>
            </div>
            <span className="text-base md:text-lg font-light tracking-wide text-slate-900 dark:text-white">
              SLT Digital Services
            </span>
          </div>
        </motion.div>

        {/* Carousel content */}
        <div className="w-full max-w-4xl text-center space-y-6 md:space-y-8">
          {/* Icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.5, rotateY: 75 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotateY: -75 }}
              transition={{ duration: 0.7 }}
              className="flex justify-center"
            >
              <div className="p-6 md:p-8 rounded-2xl backdrop-blur-xl border bg-white/75 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-700/50 shadow-xl">
                <CurrentIcon
                  size={56}
                  strokeWidth={1.3}
                  className="text-[#00B4EB] dark:text-[#00B4EB]"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Title & Subtitle */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -35 }}
              transition={{ duration: 0.6 }}
              className="space-y-3 md:space-y-4"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-slate-900 dark:text-white px-4">
                {slides[currentSlide].title}
              </h1>

              <p className="text-sm sm:text-base md:text-lg font-light text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
          >
            <Link href="/signup">
              <button className="px-6 py-3 bg-gradient-to-r from-[#00B4EB] to-[#009bc9] hover:from-[#009bc9] hover:to-[#008cc1] text-white font-semibold text-sm md:text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] w-full sm:w-auto">
                Get Started
                <ArrowRight size={18} />
              </button>
            </Link>

            <Link href="/signin">
              <button className="px-6 py-3 text-sm md:text-base font-medium rounded-lg border transition-all duration-300 active:scale-[0.98] bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-800 dark:text-white w-full sm:w-auto">
                Sign In
              </button>
            </Link>
          </motion.div>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 pt-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentSlide(idx);
                  setIsAutoPlaying(false);
                }}
                className={`
                  h-1.5 rounded-full transition-all duration-600
                  ${
                    idx === currentSlide
                      ? `w-8 bg-gradient-to-r ${slides[currentSlide].color}`
                      : "w-6 bg-slate-300 dark:bg-slate-700"
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="absolute left-3 right-3 md:left-6 md:right-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
          <motion.button
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevSlide}
            className="pointer-events-auto p-2.5 rounded-full backdrop-blur-lg border transition-all bg-white/70 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/50 text-slate-700 dark:text-cyan-400 hover:bg-white/90 dark:hover:bg-slate-800/60 shadow-md"
          >
            <ChevronLeft size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, x: 3 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextSlide}
            className="pointer-events-auto p-2.5 rounded-full backdrop-blur-lg border transition-all bg-white/70 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-700/50 text-slate-700 dark:text-cyan-400 hover:bg-white/90 dark:hover:bg-slate-800/60 shadow-md"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
