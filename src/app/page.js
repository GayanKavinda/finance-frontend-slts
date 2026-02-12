"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

import { slides, SLIDE_DURATION } from "@/constants/slides";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);


  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);

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

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors duration-500">
      <div className="relative w-full h-screen overflow-hidden shrink-0 bg-black">
        {/* Background Slideshow with Crossfade */}
        <div className="absolute inset-0">
          {slides.map((slide, idx) => (
            <motion.div
              key={idx}
              initial={false}
              animate={{
                opacity: idx === currentSlide ? 1 : 0,
                scale: idx === currentSlide ? 1.15 : 1,
              }}
              transition={{
                opacity: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
                scale: { duration: 7, ease: "linear" }, // Slow cinematic zoom
              }}
              className="absolute inset-0 will-change-[opacity,transform]"
              style={{ pointerEvents: idx === currentSlide ? "auto" : "none" }}
            >
              {/* Background Asset */}
              <div className="relative w-full h-full">
                {slide.video ? (
                  <video
                    src={slide.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={idx === 0}
                    quality={90}
                  />
                )}
                {/* Fixed Overlay for readability */}
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Visual Layers (Static - Higher Performance) */}
        <div className="absolute inset-0 pointer-events-none z-1">
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/80" />
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 sm:px-8 lg:px-16">
          <div className="max-w-5xl w-full">
            {/* Main Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      staggerChildren: 0.08,
                      delayChildren: 0.1,
                      ease: [0.21, 1, 0.36, 1], // Apple-style easeOut
                    },
                  },
                  exit: {
                    opacity: 0,
                    y: -10,
                    transition: { duration: 0.3 },
                  },
                }}
                className="text-center space-y-6"
              >
                {/* Centered Logo */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  className="flex justify-center mb-4"
                >
                  <div className="relative w-[160px] h-[50px] md:w-[180px] md:h-[55px]">
                    <Image
                      src="/icons/slt_digital_icon.png"
                      alt="SLT Digital Services"
                      fill
                      className="object-contain brightness-0 invert"
                      priority
                    />
                  </div>
                </motion.div>

                {/* Title with reveal */}
                <motion.h1
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.8, ease: "easeOut" },
                    },
                  }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-normal leading-tight text-white"
                >
                  {slides[currentSlide].title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="text-sm sm:text-base md:text-lg font-normal text-white/90 max-w-xl mx-auto leading-relaxed"
                >
                  {slides[currentSlide].subtitle}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  className="flex flex-col sm:flex-row gap-3 justify-center pt-6"
                >
                  <Link href="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                    >
                      {slides[currentSlide].cta}
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>

                  <Link href="/signin">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 text-sm font-medium rounded-xl backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/30 text-white transition-all duration-300 w-full sm:w-auto cursor-pointer"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-10 left-0 right-0 px-8 flex items-center justify-center">
              <div className="mx-auto flex justify-center gap-3">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSlide(idx);
                      setIsAutoPlaying(false);
                    }}
                    className="relative py-2 focus:outline-none"
                  >
                    <div
                      className="relative h-[2px] rounded-full bg-white/10 overflow-hidden transition-all duration-500"
                      style={{
                        width: idx === currentSlide ? "64px" : "32px",
                      }}
                    >
                      {idx === currentSlide && (
                        <motion.div
                          key={`progress-${idx}`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{
                            duration: isAutoPlaying
                              ? SLIDE_DURATION / 1000
                              : 0.4,
                            ease: "linear",
                          }}
                          className="absolute inset-y-0 left-0 bg-white"
                        />
                      )}
                      {idx < currentSlide && (
                        <div className="absolute inset-0 bg-white/30" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Refined Navigation Arrows */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
          <motion.button
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="pointer-events-auto p-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 text-white transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="pointer-events-auto p-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 text-white transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
