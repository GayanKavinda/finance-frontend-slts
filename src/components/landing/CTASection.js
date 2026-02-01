"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-6 text-foreground"
        >
          Ready to get started?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
        >
          Securely manage your salary, loans, and claims from one unified
          dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/signup">
            <button className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg shadow-md hover:bg-primary/90 transition-all duration-200">
              Create Account
            </button>
          </Link>
          <Link href="/signin">
            <button className="px-8 py-3 bg-background border border-input text-foreground font-medium rounded-lg hover:bg-muted transition-all duration-200">
              Sign In
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
