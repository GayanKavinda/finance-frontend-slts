"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MessageSquare, LifeBuoy, Search, BookOpen, Download, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, FileText, Shield, Users, Settings } from "lucide-react";

const faqs = [
  {
    category: "Account & Access",
    items: [
      { q: "How do I reset my password?", a: "Go to Profile > Security tab and click 'Change Password'. You'll receive an email with reset instructions." },
      { q: "How do I enable 2FA?", a: "Navigate to Settings > Security > Two-Factor Authentication and toggle it on. Scan the QR code with your authenticator app." },
      { q: "I can't access certain pages", a: "Access is role-based. Contact your system administrator to request the necessary permissions." },
      { q: "How do I update my profile information?", a: "Go to Profile > Personal tab. Edit your name, email, phone, and department details." },
    ]
  },
  {
    category: "Jobs & Projects",
    items: [
      { q: "How do I create a new job?", a: "Go to Jobs & Projects and click 'New Job'. Fill in the job name, select customer and linked tender, set project value and dates." },
      { q: "Can I export jobs to CSV?", a: "Yes, click the 'Export CSV' button in the Jobs page header. Filters will be applied to the export." },
      { q: "What's the difference between Grid and List view?", a: "Grid view shows cards with more details. List view is a compact table format. Toggle using the view buttons." },
      { q: "How do I link a tender to a job?", a: "When creating or editing a job, select the tender from the 'Linked Tender' dropdown. Only active tenders are shown." },
      { q: "Can I delete a job with purchase orders?", a: "No, jobs with active purchase orders cannot be deleted. Archive or complete the POs first." },
    ]
  },
  {
    category: "Purchase Orders",
    items: [
      { q: "How do I issue a Purchase Order?", a: "Go to Purchase Orders > 'Issue PO'. Select job, tender, vendor, set amount and date, then submit." },
      { q: "What are the PO statuses?", a: "Draft → Approved → Sent → Received → Cancelled. Only valid lifecycle transitions are allowed." },
      { q: "How do I download a PO as PDF?", a: "Click the download icon on any PO row. The PDF includes all order details and terms." },
      { q: "Can I edit an approved PO?", a: "Only Draft POs can be fully edited. Approved+ POs can only transition status (not edit amounts)." },
    ]
  },
  {
    category: "Contractor Bills",
    items: [
      { q: "What is the bill verification workflow?", a: "Draft → Verified → Submitted → Approved → Paid. Each step requires specific permissions." },
      { q: "What documents are needed for verification?", a: "At least one document (Contractor Bill, Completion Certificate, or Site Photo) is required before verification." },
      { q: "How do I record a milestone payment?", a: "On an Approved bill, click 'Pay Bill'. Enter milestone name, amount, retention, reference, bank, and date." },
      { q: "Can I reject a submitted bill?", a: "Yes, Finance users can reject Submitted or Approved bills with a mandatory reason." },
    ]
  },
  {
    category: "Contractors & Vendors",
    items: [
      { q: "How do I add a new contractor?", a: "Go to Contractors > 'Add Contractor'. Enter company name, contact person, email, phone, banking details, and tax ID." },
      { q: "What does Blacklisted status mean?", a: "Blacklisted contractors cannot be selected for new bills or jobs. Used for compliance issues." },
      { q: "How is contractor rating calculated?", a: "Manual 1-5 star rating set internally. Used for vendor performance tracking." },
    ]
  },
  {
    category: "System & Settings",
    items: [
      { q: "How do I change notification preferences?", a: "Go to Settings > Notifications. Toggle email, browser, and critical alerts individually." },
      { q: "What is Maintenance Mode?", a: "Settings > System > Maintenance Mode. Restricts write operations system-wide for maintenance windows." },
      { q: "How do I report a bug?", a: "Use the 'Submit Ticket' button in Help Center or email finance-support@sltdigital.lk with details." },
    ]
  },
];

const contacts = [
  { icon: Mail, label: "Email Support", detail: "finance-support@sltdigital.lk", href: "mailto:finance-support@sltdigital.lk" },
  { icon: Phone, label: "IT Hotline", detail: "+94 11 234 5678", href: "tel:+94112345678" },
  { icon: MessageSquare, label: "Internal Helpdesk", detail: "Ext: 4402 (Mon-Fri 8:30-17:00)", href: null },
];

const resources = [
  { label: "User Guide (PDF)", icon: FileText, action: () => alert("Download User Guide") },
  { label: "API Documentation", icon: BookOpen, action: () => alert("Open API Docs") },
  { label: "Video Tutorials", icon: AlertCircle, action: () => alert("Open Tutorials") },
  { label: "Release Notes", icon: Shield, action: () => alert("View Release Notes") },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const categories = ["all", ...faqs.map((c) => c.category)];
  const filteredFaqs = faqs
    .flatMap((cat) => cat.items.map((item) => ({ ...item, category: cat.category })))
    .filter((faq) =>
      (activeCategory === "all" || faq.category === activeCategory) &&
      faq.q.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <ProtectedRoute>
      <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
        {/* Zen Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-widest mb-2">
              Support Center
            </div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Help Center
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Find answers, contact support, and access resources
            </p>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {contacts.map((item, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3.5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <item.icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-foreground truncate">{item.label}</h3>
                  <p className="text-[10px] text-muted-foreground truncate">{item.detail}</p>
                </div>
                {item.href && (
                  <a href={item.href} className="text-primary hover:underline text-xs font-medium">Contact</a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search + Category Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs pl-8 bg-card border-border"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenFaq(null); }}
                className={`px-2.5 py-1 text-[10px] rounded-md font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat === "all" ? "All Topics" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-2">
          {filteredFaqs.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">No articles found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter</p>
            </Card>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <Card key={idx} className="overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs font-medium text-foreground pr-4">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-3.5 pb-3.5 text-xs text-muted-foreground border-t border-border pt-2">{faq.a}</div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Resources & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5 pt-2 border-t border-border/50">
          <div className="lg:col-span-2 space-y-2.5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm"><BookOpen className="w-3.5 h-3.5 text-primary" /> Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {resources.map((r, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start gap-2 text-xs h-8"
                    onClick={r.action}
                  >
                    <r.icon className="w-3.5 h-3.5" />
                    {r.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-2.5">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-4.5 h-4.5" />
                  <span className="text-sm font-medium">Need Help?</span>
                </div>
                <p className="text-xs text-primary-foreground/80">Our IT team responds within 2 business hours during business days.</p>
                <Button className="w-full bg-white text-primary hover:bg-white/90 h-8 text-xs" onClick={() => alert("Submit Ticket")}>Submit Support Ticket</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3.5 space-y-2">
                <p className="text-xs font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> System Status: Operational</p>
                <p className="text-xs font-medium flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> Last updated: {new Date().toLocaleDateString()}</p>
                <p className="text-xs font-medium flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-amber-500" /> Version: 2.1.0</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}