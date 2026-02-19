"use client";

import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useEffect, useRef } from "react";
import { AUTH_PATHS } from "@/constants/navigation";

export default function ThemeScrollArea({ children, className, onScroll }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (!onScroll || !scrollAreaRef.current) return;

    const viewport = scrollAreaRef.current.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );
    if (!viewport) return;

    const handleScroll = () => {
      onScroll(viewport.scrollTop);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [onScroll]);

  // Disable the gradient mask on common pages (dashboard, profile, etc.)
  // and only enable it on auth pages (signin, signup) as per user request.
  return (
    <ScrollArea
      ref={scrollAreaRef}
      className={className}
      maskHeight={isAuthPage ? 30 : 0}
    >
      {children}
    </ScrollArea>
  );
}
