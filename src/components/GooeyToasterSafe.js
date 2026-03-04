"use client";

import { useEffect, useState, Suspense } from "react";
import "goey-toast/styles.css";

/**
 * Highly resilient Toaster wrapper that only loads goey-toast in the browser.
 * This prevents module evaluation errors during Next.js SSR/Static Generation.
 */
export default function GooeyToasterSafe() {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    // Only import in the browser
    const load = async () => {
      try {
        const { GooeyToaster } = await import("goey-toast");
        setComponent(() => GooeyToaster);
      } catch (err) {
        console.error("Failed to load GooeyToaster:", err);
      }
    };
    load();
  }, []);

  if (!Component) return null;

  return <Component />;
}
