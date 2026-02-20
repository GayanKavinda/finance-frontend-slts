"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useScroll } from "@/contexts/ScrollContext";

export default function ScrollToTop() {
  const { scrollY } = useScroll();
  const isVisible = scrollY > 400;

  const scrollToTop = () => {
    const viewport = document.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Fallback
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all z-50 cursor-pointer group"
          title="Scroll to top"
        >
          <ChevronUp
            size={24}
            className="group-hover:-translate-y-1 transition-transform"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
