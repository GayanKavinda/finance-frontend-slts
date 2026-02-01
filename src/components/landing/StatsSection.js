"use client";

import { motion } from "framer-motion";
import { Users, ShieldCheck, Globe, Zap } from "lucide-react";

export default function StatsSection() {
  return (
    <section className="py-16 bg-muted/20 border-y border-border/40">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            icon: <Users className="w-5 h-5" />,
            label: "Active Users",
            value: "7,500+",
          },
          {
            icon: <ShieldCheck className="w-5 h-5" />,
            label: "Secure",
            value: "100%",
          },
          {
            icon: <Globe className="w-5 h-5" />,
            label: "Coverage",
            value: "Island-wide",
          },
          {
            icon: <Zap className="w-5 h-5" />,
            label: "Uptime",
            value: "99.9%",
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col items-center justify-center gap-3 text-center"
          >
            <div className="text-muted-foreground opacity-70">{stat.icon}</div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
