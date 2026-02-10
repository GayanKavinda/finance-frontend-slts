"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Mail,
  Phone,
  MessageSquare,
  BookOpen,
  ShieldCheck,
  FileText,
  LifeBuoy,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "Go to your Profile → Security tab. Enter your current password, then your new one. You'll receive a confirmation email for security purposes.",
  },
  {
    question: "How are transactions automatically categorized?",
    answer:
      "Our system uses intelligent classification based on merchant data and historical patterns. You can manually override any category in the Transactions view.",
  },
  {
    question: "Can I export financial reports?",
    answer:
      "Yes. Navigate to the Reports page and use the 'Export' button. We support CSV, PDF, and Excel formats for departmental auditing.",
  },
  {
    question: "Who approves departmental budgets?",
    answer:
      "Budget requests are routed through the system to the Finance Division Manager. You can track approval status in the Budgets module.",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* HEADER SECTION */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20"
          >
            <LifeBuoy size={14} />
            Support Center
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            How can we{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-[#db2777] to-[#9333ea] dark:from-primary dark:to-accent">
              help you?
            </span>
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
            Access internal resources, technical support, and financial
            guidelines for the SLT Digital Finance Division.
          </p>

          {/* Search Bar - More Refined */}
          <div className="w-full max-w-2xl mt-8 relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search for guidelines, security, or technical help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all outline-none shadow-xl shadow-black/5"
            />
          </div>
        </div>

        {/* QUICK CONTACT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Mail,
              label: "Email Support",
              detail: "finance-support@sltdigital.lk",
              color: "text-blue-500",
            },
            {
              icon: Phone,
              label: "Internal Hotline",
              detail: "+94 11 234 5678",
              color: "text-emerald-500",
            },
            {
              icon: MessageSquare,
              label: "IT Helpdesk",
              detail: "Ext: 4402 (Mon-Fri)",
              color: "text-amber-500",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="premium-card p-6 flex flex-col items-center text-center space-y-3 cursor-pointer group"
            >
              <div
                className={`p-3 rounded-xl bg-muted/50 ${item.color} group-hover:scale-110 transition-transform`}
              >
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  {item.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Side: FAQs */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-primary" size={20} />
              <h2 className="text-xl font-bold">Common Questions</h2>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="premium-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-muted/30"
                  >
                    <span className="text-sm font-bold text-foreground/90">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-muted-foreground transition-transform duration-300 ${
                        openFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 text-xs md:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4 bg-muted/10"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Resources & CTA */}
          <div className="lg:col-span-4 space-y-8">
            {/* Resources Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-primary" size={20} />
                <h2 className="text-xl font-bold">Resources</h2>
              </div>
              <div className="space-y-2">
                {[
                  { title: "Finance Guidelines", size: "2.4 MB" },
                  { title: "User Manual v2.0", size: "5.1 MB" },
                  { title: "Security Protocols", size: "1.2 MB" },
                ].map((res, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FileText
                        className="text-muted-foreground group-hover:text-primary"
                        size={18}
                      />
                      <div>
                        <p className="text-xs font-bold group-hover:text-primary transition-colors">
                          {res.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          {res.size} • PDF
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={14}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Support CTA Card - Professional Styled */}
            <div className="relative p-6 rounded-2xl bg-primary dark:bg-slate-900/60 dark:border dark:border-primary/20 overflow-hidden shadow-xl group">
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform dark:opacity-20">
                <LifeBuoy size={120} />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-bold text-white">
                  Need Technical Assistance?
                </h3>
                <p className="text-xs text-white/80 dark:text-slate-300 leading-relaxed">
                  Can't find what you're looking for? Raise a ticket and our IT
                  team will respond within 2 hours.
                </p>
                <button className="w-full py-3 bg-white text-primary dark:bg-primary dark:text-primary-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-primary/90 transition-colors shadow-lg">
                  Submit Support Ticket
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
