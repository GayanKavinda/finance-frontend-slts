"use client";

/**
 * Safe wrapper for goey-toast to prevent SSR module evaluation errors.
 * This ensures goey-toast is only loaded and executed in the browser.
 */

const getGooey = async () => {
  if (typeof window === "undefined") return null;
  const mod = await import("goey-toast");
  return mod.gooeyToast;
};

export const toast = {
  success: async (message) => {
    const gooey = await getGooey();
    gooey?.success(message);
  },
  error: async (message) => {
    const gooey = await getGooey();
    gooey?.error(message);
  },
  warning: async (message) => {
    const gooey = await getGooey();
    gooey?.warning(message);
  },
  promise: async (promise, options) => {
    const gooey = await getGooey();
    if (gooey) {
      return gooey.promise(promise, options);
    }
    return promise;
  },
};
