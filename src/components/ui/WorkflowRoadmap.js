"use client";

import { motion } from "framer-motion";
import { Check, Circle, Clock, CreditCard, Banknote, FileText, Send, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_STEPS = [
  { id: "Draft", label: "Draft", icon: FileText },
  { id: "Tax Generated", label: "Tax", icon: ShieldCheck },
  { id: "Submitted", label: "Submitted", icon: Send },
  { id: "Approved", label: "Approved", icon: Check },
  { id: "Payment Received", label: "Paid", icon: CreditCard },
  { id: "Banked", label: "Banked", icon: Banknote },
];

export default function WorkflowRoadmap({ currentStatus, steps = DEFAULT_STEPS }) {
  const currentIndex = steps.findIndex((s) => s.id === currentStatus);
  const progress = steps.length > 1 ? (Math.max(0, currentIndex) / (steps.length - 1)) * 100 : 0;

  return (
    <div className="relative mb-6 w-full px-5 py-5 overflow-hidden rounded-xl border border-border bg-card/60 shadow-xs">
      {/* Background Track */}
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-4 h-0.5 w-full bg-border" />
        
        {/* Progress Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute left-0 top-4 h-0.5 bg-primary"
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const Icon = step.icon || Circle;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              {/* Node */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition-all text-xs",
                  isCompleted ? "border-emerald-600 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-500" : 
                  isActive ? "border-primary bg-primary text-primary-foreground shadow-xs" : 
                  "border-border bg-muted/60 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Label */}
              <div className="mt-2 whitespace-nowrap text-center">
                <p className={cn(
                  "text-[10.5px] font-medium tracking-tight",
                  isActive ? "text-foreground font-semibold" : isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
