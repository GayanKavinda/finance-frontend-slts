"use client";

import { motion } from "framer-motion";
import {
  Search,
  Mail,
  Phone,
  MessageSquare,
  BookOpen,
  ShieldCheck,
  FileText,
  LifeBuoy,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "Go to your Profile → Security tab. Enter current password, then your new one. You'll receive a confirmation email.",
  },
  {
    question: "How are transactions automatically categorized?",
    answer:
      "We use intelligent AI classification based on merchant, amount, and description. You can always manually adjust any transaction on the Transactions page.",
  },
  {
    question: "Can I export financial reports?",
    answer:
      "Yes — navigate to Reports and use the Export button (CSV, PDF, or Excel formats are available).",
  },
  {
    question: "Who approves departmental budgets?",
    answer:
      "Submit requests via the Budgets module. Final approvals come from the Finance Division Manager.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "We implement bank-grade AES-256 encryption, multi-factor authentication, and regular security audits.",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-16">
          {/* Hero / Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider border border-primary/20">
              <LifeBuoy size={16} />
              <span>Support Center</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              How can we{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                help you today?
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quick answers, direct contacts, and resources for SLT Digital
              Finance team members.
            </p>
          </div>

          {/* Prominent Search */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground/70" />
              </div>
              <input
                type="text"
                placeholder="Search questions, reports, security..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-5 py-5 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 
                           focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-300
                           shadow-lg shadow-black/5 text-lg placeholder:text-muted-foreground/60"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>

          {/* Quick Contact Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                color: "text-blue-500",
                title: "Email Support",
                desc: "finance-support@sltdigital.lk",
                label: "Send message",
              },
              {
                icon: Phone,
                color: "text-emerald-500",
                title: "Hotline",
                desc: "+94 11 234 5678",
                label: "Call now",
              },
              {
                icon: MessageSquare,
                color: "text-amber-500",
                title: "Internal Chat",
                desc: "Mon–Fri 8:30–17:30",
                label: "Start chat",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 rounded-2xl bg-card/70 backdrop-blur-lg border border-border/40 
                           hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-card ${item.color}`}>
                    <item.icon size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm font-medium text-primary group-hover:underline underline-offset-4 flex items-center gap-1">
                  {item.label}
                  <ChevronDown size={14} className="rotate-[-90deg]" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQs - Modern Accordion */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BookOpen className="text-primary" size={24} />
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group bg-card/60 backdrop-blur-lg rounded-xl border border-border/40 overflow-hidden transition-all duration-300 hover:border-primary/30"
                  >
                    <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                      <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                      <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="px-6 pb-6 pt-2 text-muted-foreground leading-relaxed border-t border-border/40">
                      {faq.answer}
                    </div>
                  </details>
                ))
              ) : (
                <div className="text-center py-16 bg-card/40 rounded-2xl border border-dashed border-border">
                  <p className="text-muted-foreground font-medium">
                    No matching questions found. Try different keywords or
                    contact support.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Resources & CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
            {/* Documentation */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                <ShieldCheck className="text-primary" />
                Useful Resources
              </h3>

              <div className="space-y-3">
                {[
                  { title: "Finance Division Guidelines", size: "2.4 MB PDF" },
                  { title: "System User Manual", size: "5.1 MB PDF" },
                  {
                    title: "Data Privacy & Security Policy",
                    size: "1.2 MB PDF",
                  },
                ].map((res, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FileText
                        className="text-muted-foreground group-hover:text-primary"
                        size={18}
                      />
                      <div>
                        <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {res.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 uppercase">
                          {res.size}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className="text-muted-foreground group-hover:text-primary -rotate-90"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA Card */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-cta-start to-cta-end text-white overflow-hidden shadow-2xl">
              <div className="absolute -top-10 -right-10 opacity-10">
                <HelpCircle size={140} />
              </div>

              <div className="relative space-y-4">
                <h3 className="text-2xl font-bold">Still need assistance?</h3>
                <p className="text-white/90">
                  Our finance support team is here for SLT Digital employees —
                  reach out anytime.
                </p>
                <button className="mt-2 px-8 py-3 bg-white text-primary font-semibold rounded-xl shadow-lg hover:bg-white/95 active:scale-98 transition-all">
                  Submit Support Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
