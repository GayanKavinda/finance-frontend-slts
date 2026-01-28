"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

const slides = [
  {
    title: "SLT Finance Division",
    subtitle:
      "Empowering employees with comprehensive salary and payment management",
    image: "/slides/2.santa-claus-chariot-3840x2160-24949.avif",
    cta: "View Dashboard",
  },
  {
    title: "Instant Salary Insights",
    subtitle:
      "View your monthly earnings, deductions, and net pay in real-time",
    image: "/slides/6.wp9223826-finance-4k-wallpapers.avif",
    cta: "Check Salary",
  },
  {
    title: "Digital Pay Sheets",
    subtitle:
      "Download and export your monthly payment slips as secure PDFs instantly",
    image: "/slides/5.uwp4831664.avif",
    cta: "Download PDF",
  },
  {
    title: "Track Your Earnings",
    subtitle:
      "Analyze your financial growth with detailed monthly earning histories",
    image: "/slides/8.wp11893992-anime-technology-wallpapers.avif",
    cta: "View History",
  },
  {
    title: "Streamlined Allowances",
    subtitle:
      "Review and manage your financial benefits and operational claims efficiently",
    image: "/slides/9.wp15425485-nasa-earth-wallpapers.avif",
    cta: "Manage Claims",
  },
  {
    title: "Secure Financial Access",
    subtitle:
      "Your financial data, protected by enterprise-grade security protocols",
    image: "/slides/7.wp10965088-modified-lamborghini-wallpapers.avif",
    cta: "Login Now",
  },
];

import Footer from "@/components/Footer";

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

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <div className="relative w-full h-screen overflow-hidden shrink-0">
        {/* Background Slideshow with Crossfade */}
        <div className="absolute inset-0">
          {slides.map((slide, idx) => (
            <motion.div
              key={idx}
              initial={false}
              animate={{
                opacity: idx === currentSlide ? 1 : 0,
                scale: idx === currentSlide ? 1 : 1.05,
              }}
              transition={{
                opacity: { duration: 1, ease: "easeInOut" },
                scale: { duration: 1.2, ease: "easeOut" },
              }}
              className="absolute inset-0"
              style={{ pointerEvents: idx === currentSlide ? "auto" : "none" }}
            >
              {/* Image with overlay */}
              <div className="relative w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                  quality={100}
                />
                {/* Dark overlay for text readability with blur effect */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 sm:px-8 lg:px-16">
          <div className="max-w-5xl w-full">
            {/* Main Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center space-y-6"
              >
                {/* Centered Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
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
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-normal leading-tight text-white">
                  {slides[currentSlide].title}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base md:text-lg font-normal text-white/90 max-w-xl mx-auto leading-relaxed">
                  {slides[currentSlide].subtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                  <Link href="/signup">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                    >
                      {slides[currentSlide].cta}
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>

                  <Link href="/signin">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 text-sm font-medium rounded-xl backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/30 text-white transition-all duration-300 w-full sm:w-auto cursor-pointer"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`
                    h-1 rounded-full transition-all duration-300
                    ${
                      idx === currentSlide
                        ? "w-8 bg-white"
                        : "w-6 bg-white/30 hover:bg-white/50"
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute left-4 right-4 md:left-6 md:right-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevSlide}
            className="pointer-events-auto p-2.5 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5 cursor-pointer" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextSlide}
            className="pointer-events-auto p-2.5 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
          >
            <ChevronRight className="w-5 h-5 cursor-pointer" />
          </motion.button>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/60 text-xs font-medium hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-4 h-6 border-2 border-white/30 rounded-full flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-1 bg-white/50 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
