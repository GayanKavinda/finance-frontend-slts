"use client";

import { motion } from "framer-motion";
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  ChevronRight,
  Search,
  BookOpen,
  LifeBuoy,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "You can reset your password by going to the Profile page and selecting the 'Security' tab. Enter your current password and your new desired password.",
  },
  {
    question: "How are my transactions categorized?",
    answer:
      "Our system automatically categorizes your transactions using AI. However, you can manually override any category by clicking on the transaction in the Transactions page.",
  },
  {
    question: "Can I export my financial reports?",
    answer:
      "Yes, you can export your data in CSV or PDF format. Navigate to the Reports page and look for the 'Export' button at the top right.",
  },
  {
    question: "Who should I contact for budget approvals?",
    answer:
      "For all budget-related approvals, please contact the Finance Division manager directly or submit a request through the 'Budgets' module.",
  },
  {
    question: "Is my data secure?",
    answer:
      "We use banking-grade encryption and secure authentication protocols to ensure your financial data is always protected.",
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
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
            >
              <LifeBuoy size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Support Center
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              How can we <span className="text-primary">help you?</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Welcome to the SLT Digital Finance Support Center. Find answers,
              get in touch, or learn how to use our internal financial tools.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search for help articles, FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base shadow-sm font-medium"
            />
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ContactCard
              icon={<Mail className="text-blue-500" />}
              title="Email Support"
              description="finance-support@sltdigital.lk"
              action="Email Us"
              delay={0.1}
            />
            <ContactCard
              icon={<Phone className="text-emerald-500" />}
              title="Hotline"
              description="+94 11 234 5678"
              action="Call Now"
              delay={0.2}
            />
            <ContactCard
              icon={<MessageSquare className="text-amber-500" />}
              title="Internal Chat"
              description="Available 8:30 AM - 5:30 PM"
              action="Open Chat"
              delay={0.3}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
            {/* FAQs */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="text-primary" /> Common Questions
                </h2>
              </div>

              <div className="space-y-4">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 hover:bg-white/60 dark:hover:bg-slate-950/60 transition-all"
                    >
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 font-medium">
                      No results matching your search.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resources Sidebar */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="text-primary" /> Documentation
              </h2>

              <div className="space-y-3">
                <ResourceLink
                  icon={<FileText size={18} />}
                  title="Finance Division Guidelines"
                  size="2.4 MB PDF"
                />
                <ResourceLink
                  icon={<FileText size={18} />}
                  title="System User Manual"
                  size="5.1 MB PDF"
                />
                <ResourceLink
                  icon={<ShieldCheck size={18} />}
                  title="Data Privacy Policy"
                  size="1.2 MB PDF"
                />
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <HelpCircle size={80} />
                </div>
                <h3 className="text-lg font-bold mb-2">Still need help?</h3>
                <p className="text-sm text-white/80 mb-4 leading-relaxed">
                  Our team is dedicated to providing the best financial tools
                  for SLT Digital employees.
                </p>
                <button className="w-full py-2.5 bg-white text-primary rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-all shadow-xl">
                  Submit a Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function ContactCard({ icon, title, description, action, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 text-center space-y-3 hover:shadow-xl hover:-translate-y-1 transition-all"
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mx-auto text-2xl">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {description}
        </p>
      </div>
      <button className="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1 mx-auto cursor-pointer">
        {action} <ChevronRight size={12} />
      </button>
    </motion.div>
  );
}

function ResourceLink({ icon, title, size }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/20 dark:bg-slate-900/10 hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="text-slate-400 group-hover:text-primary transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {title}
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tighter">
            {size}
          </p>
        </div>
      </div>
      <ChevronRight
        size={14}
        className="text-slate-300 group-hover:text-primary transition-colors"
      />
    </div>
  );
}
