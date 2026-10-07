"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/Card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/Separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";

const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "Go to your Profile → Security tab. Enter your current password, then your new one. You will receive a confirmation email for security purposes.",
  },
  {
    question: "How are transactions automatically categorized?",
    answer:
      "Our system uses intelligent classification based on merchant data and historical patterns. You can manually override any category in the Transactions view.",
  },
  {
    question: "Can I export financial reports?",
    answer:
      "Yes. Navigate to the Reports page and use the Export button. We support CSV, PDF, and Excel formats for departmental auditing.",
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
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ProtectedRoute>
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-widest">
                Support Center
              </div>
              <h1 className="text-2xl font-medium tracking-tight text-foreground">
                How can we help you?
              </h1>
              <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                Access internal resources, technical support, and financial
                guidelines for the SLT Digital Procurement Division.
              </p>

              {/* Search Bar */}
              <div className="w-full max-w-xl mt-6 relative">
                <input
                  type="text"
                  placeholder="Search for guidelines, security, or technical help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: "Mail",
              label: "Email Support",
              detail: "finance-support@sltdigital.lk",
            },
            {
              icon: "Phone",
              label: "Internal Hotline",
              detail: "+94 11 234 5678",
            },
            {
              icon: "MessageSquare",
              label: "IT Helpdesk",
              detail: "Ext: 4402 (Mon-Fri)",
            },
          ].map((item, i) => (
            <Card key={i}>
              <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                <div className="p-2.5 rounded-lg bg-muted text-foreground">
                  {item.icon === "Mail" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  )}
                  {item.icon === "Phone" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  )}
                  {item.icon === "MessageSquare" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {item.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.detail}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: FAQs */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              </div>
              <h2 className="text-base font-medium text-foreground">Common Questions</h2>
            </div>

            <div className="space-y-2">
              {filteredFaqs.map((faq, idx) => (
                <Card key={idx}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {faq.question}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-muted-foreground transition-transform ${
                        openFaq === idx ? "rotate-180" : ""
                      }`}
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3 bg-muted/30">
                      {faq.answer}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Right Side: Resources & CTA */}
          <div className="lg:col-span-4 space-y-4">
            {/* Resources Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                </div>
                <h2 className="text-base font-medium text-foreground">Resources</h2>
              </div>
              <div className="space-y-2">
                {[
                  { title: "Finance Guidelines", size: "2.4 MB" },
                  { title: "User Manual v2.0", size: "5.1 MB" },
                  { title: "Security Protocols", size: "1.2 MB" },
                ].map((res, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-muted text-muted-foreground">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {res.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">
                            {res.size} • PDF
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Support CTA Card */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-base font-medium">
                  Need Technical Assistance?
                </h3>
                <p className="text-xs text-primary-foreground/80 leading-relaxed">
                  Can not find what you are looking for? Raise a ticket
                  and our IT team will respond within 2 hours.
                </p>
                <Button className="w-full bg-white text-primary hover:bg-white/90">
                  Submit Support Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
