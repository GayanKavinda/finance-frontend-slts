"use client";

import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

export default function ThemeScrollArea({ children, className, onScroll }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (!onScroll || !scrollAreaRef.current) return;

    const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    const handleScroll = () => {
      onScroll(viewport.scrollTop);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [onScroll]);

  // Disable the gradient mask on the homepage to prevent white lines in light mode
  // appearing over the dark landing page design.
  return (
    <ScrollArea ref={scrollAreaRef} className={className} maskHeight={isHomePage ? 0 : 30}>
      {children}
    </ScrollArea>
  );
}
