"use client";

import { motion } from "framer-motion";
import { FileText, Wallet, Activity, PiggyBank } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "Digital Pay Sheets",
      desc: "Access monthly pay slips and secure PDF downloads.",
    },
    {
      icon: <Wallet className="w-6 h-6 text-emerald-500" />,
      title: "Loan Management",
      desc: "Track active loans and view settlement balances.",
    },
    {
      icon: <Activity className="w-6 h-6 text-purple-500" />,
      title: "Medical Claims",
      desc: "Submit and track OPD and surgical claims status.",
    },
    {
      icon: <PiggyBank className="w-6 h-6 text-orange-500" />,
      title: "Provident Fund",
      desc: "Monitor EPF/ETF balances and contribution history.",
    },
  ];

  return (
    <section className="py-16 px-6 md:px-12 lg:px-20 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold mb-4 tracking-tight text-foreground"
          >
            Financial Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base text-muted-foreground leading-relaxed"
          >
            Comprehensive tools to streamline your financial operations.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 shadow-sm"
            >
              <div className="mb-4 p-3 rounded-lg bg-primary/5 w-fit">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
