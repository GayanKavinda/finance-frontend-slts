"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within Tabs");
  }
  return context;
}

const Tabs = ({ className, children, value, onChange, defaultValue, ...props }) => {
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const activeValue = isControlled ? value : uncontrolledValue;

  // Unique layout id so each tab group animates its own pill.
  const layoutId = React.useId();

  const handleChange = React.useCallback((val) => {
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    onChange?.(val);
  }, [isControlled, onChange]);

  const contextValue = React.useMemo(
    () => ({ activeValue, onChange: handleChange, layoutId }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeValue, handleChange]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("flex flex-col", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        // Modern shadcn segmented control: soft muted track, generous padding,
        // horizontal scroll on narrow screens without breaking the pill shape.
        "inline-flex h-11 w-full items-center justify-start gap-1 overflow-x-auto rounded-xl border border-border/50 bg-muted/60 p-1.5 text-muted-foreground backdrop-blur-sm scrollbar-none",
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { activeValue, onChange, layoutId } = useTabs();
  const isActive = activeValue === value;

  return (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex flex-1 sm:flex-none items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={() => onChange(value)}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {isActive && (
        <motion.span
          layoutId={`tab-pill-${layoutId}`}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="absolute inset-0 rounded-lg bg-background shadow-soft ring-1 ring-border/60"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { activeValue } = useTabs();
  const isActive = activeValue === value;

  if (!isActive) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
