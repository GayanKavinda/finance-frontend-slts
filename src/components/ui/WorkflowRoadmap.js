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
    <div className="relative mb-10 w-full px-4 py-8 overflow-hidden rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md shadow-2xl">
      <div className="absolute top-0 left-0 h-1 w-full bg-white/5" />
      
      {/* Background Track */}
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-white/10" />
        
        {/* Progress Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const Icon = step.icon || Circle;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              {/* Node */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isCompleted || isActive ? "rgb(255,255,255)" : "rgba(255,255,255,0.05)",
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500",
                  isCompleted ? "border-emerald-500 bg-white" : 
                  isActive ? "border-blue-500 bg-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" : 
                  "border-white/10 bg-white/5"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-blue-600" : "text-white/40"
                  )} />
                )}

                {/* Pulsing Aura for Active */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-blue-500/20"
                  />
                )}
              </motion.div>

              {/* Label */}
              <div className="absolute top-12 whitespace-nowrap text-center">
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors duration-500",
                  isActive ? "text-blue-400" : isCompleted ? "text-emerald-400" : "text-white/30"
                )}>
                  {step.label}
                </p>
                {isActive && (
                  <motion.div 
                    layoutId="active-dot"
                    className="mx-auto mt-1 h-1 w-1 rounded-full bg-blue-500" 
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
