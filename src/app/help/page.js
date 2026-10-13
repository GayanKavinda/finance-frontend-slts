"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormModal from "@/components/ui/FormModal";
import api from "@/lib/axios";
import {
  Mail,
  Phone,
  MessageSquare,
  LifeBuoy,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  Users,
  Settings,
  LayoutDashboard,
  Gavel,
  Briefcase,
  ClipboardList,
  Receipt,
  FileSpreadsheet,
  Bell,
  Megaphone,
  Ticket as TicketIcon,
  Clock,
  Loader2,
  Wrench,
  Workflow,
  Library,
} from "lucide-react";

// ── Help articles — real guidance for every module in the system ──
const faqs = [
  {
    category: "Dashboard & Reporting",
    items: [
      {
        q: "What does the dashboard show?",
        a: "The executive summary: total invoiced vs collected, outstanding balance, collection efficiency %, monthly trend chart, status breakdown and approval velocity. All amounts and dates follow your regional preferences (currency, date format) from Settings.",
      },
      {
        q: "How do I track overall cash flow?",
        a: "Use the dashboard KPIs for the big picture (invoiced, received, outstanding) and the monthly trend line for direction. Drill into Invoices for the per-customer ledger and Contractor Bills for the payables side.",
      },
      {
        q: "Can I export data for reporting?",
        a: "Yes. The Jobs page has an Export CSV button that includes your current filters. Invoices support CSV export from the invoices list as well.",
      },
    ],
  },
  {
    category: "Tenders",
    items: [
      {
        q: "How do I create a new tender?",
        a: "Go to Tenders and click 'New Tender'. Enter the tender number, pick the customer, add a name and description, budget and awarded amount, plus start/end dates. New tenders start with status Open.",
      },
      {
        q: "What are the tender statuses?",
        a: "Open → Awarded, and Closed once the tender is fully billed. You move a tender to Awarded when you win it and fill in the Awarded Amount.",
      },
      {
        q: "How do I send an award letter to the customer?",
        a: "Once a tender is Awarded (awarded amount greater than zero), the row shows a Download action. Click it to generate the tender award letter PDF for that customer.",
      },
      {
        q: "Where do I see which jobs belong to a tender?",
        a: "Open the tender list for the linked jobs count, or open Jobs and check the linked tender column. Each job detail page shows its parent tender as well.",
      },
    ],
  },
  {
    category: "Jobs & Contractor Quotations",
    items: [
      {
        q: "How do I create a new job?",
        a: "Go to Jobs and click 'New Job'. Pick the tender and customer (the customer is auto-linked from the tender), then fill in the job name, project value, scope description and work start/completion dates. Jobs start as Pending with no contractor assigned.",
      },
      {
        q: "How does the bidding process work?",
        a: "Open a Pending job and use the Contractor Quotations panel. Click 'Add' to enter a bid: contractor, amount, date, duration in days and work scope. Repeat for at least 3 different contractors — the Next Steps card on the page recommends a minimum of 3 bids.",
      },
      {
        q: "How is the winning bid selected?",
        a: "On the job detail page, compare all bids in the bid comparison table (contractor, date, duration, amount) and click 'Select' on the winning bid, then confirm. That quotation becomes Selected, all other bids become Rejected, and the job moves to In Progress with the selected contractor and quoted amount recorded.",
      },
      {
        q: "What happens after awarding a job?",
        a: "An Award Letter button appears in the job header (downloads a PDF), and the quotations panel becomes read-only — the full bid history stays visible for comparison and audit.",
      },
      {
        q: "What is the difference between Grid and List view?",
        a: "Grid view shows cards with more detail; List view is a compact table. Toggle using the view buttons in the Jobs page header.",
      },
    ],
  },
  {
    category: "Purchase Orders",
    items: [
      {
        q: "How do I issue a Purchase Order?",
        a: "Go to Purchase Orders and click 'New PO'. Enter the PO number and date, select the job, add description, amount and billing address. POs are created as Draft.",
      },
      {
        q: "What are the PO statuses?",
        a: "Draft → Approved → Sent → Received, and Cancelled is possible at any point. Only valid lifecycle transitions are allowed — skipping a step (for example Draft straight to Sent) is rejected by design.",
      },
      {
        q: "How do I download a PO as PDF?",
        a: "Click the download icon on any PO row. The PDF contains all order details and terms, ready to send to the vendor.",
      },
      {
        q: "Where can I see the PO audit trail?",
        a: "Each PO detail shows the full status history (who moved it, when). The audit trail endpoint requires the view-audit-trail permission, held by Admin and Finance roles.",
      },
      {
        q: "What do the stats at the top of the page show?",
        a: "The PO register header summarises the register by status (drafts, approved, sent, received) so you can see what needs chase-up.",
      },
    ],
  },
  {
    category: "Contractor Bills",
    items: [
      {
        q: "What is the bill verification workflow?",
        a: "Draft → Verified → Submitted → Approved → Paid. Create the bill, upload the supporting document, verify it, submit it to finance, and finance either approves it (then pays) or rejects it with a reason so you can correct and resubmit.",
      },
      {
        q: "What documents are needed for verification?",
        a: "At least one supporting document — the contractor bill, completion certificate or site photo. A bill cannot be verified until a document is uploaded.",
      },
      {
        q: "How do I record a milestone payment?",
        a: "On an Approved bill, click 'Pay Bill'. Enter the milestone name, payment amount, retention, bank reference, bank name and date. Partial payments are supported and retention can be held back.",
      },
      {
        q: "Can a submitted bill be changed?",
        a: "Not directly. A submitted or approved bill that needs changes is rejected with a mandatory reason; the requester then updates it and resubmits through the same workflow.",
      },
    ],
  },
  {
    category: "Invoices & Payments",
    items: [
      {
        q: "What is the invoice lifecycle?",
        a: "Draft → Tax Generated → Submitted → Approved → Payment Received → Banked. You create the draft, generate the statutory tax invoice, submit to finance, finance approves, then the payment is recorded and finally marked banked once the funds arrive.",
      },
      {
        q: "How do I generate the tax invoice?",
        a: "Open a Draft invoice, go to the Tax Invoice tab and click 'Generate Tax Invoice'. This locks the VAT schedule (18%) and moves the invoice to Tax Generated.",
      },
      {
        q: "How do I record a payment?",
        a: "On an approved invoice, use Record Payment and choose bank transfer or cheque. Cheques are automatically registered in the cheque registry for clearing follow-up.",
      },
      {
        q: "What does 'Mark Banked' mean?",
        a: "It is the final step: the payment has actually landed in the company account. It is a terminal state and completes the money-in cycle for that invoice.",
      },
      {
        q: "Which documents and PDFs are available on an invoice?",
        a: "Invoice PDF, internal receipt, uploaded supporting documents, CSV export from the list, and the audit trail showing every status change with who made it.",
      },
    ],
  },
  {
    category: "Customers & Contractors",
    items: [
      {
        q: "How do I add a new customer?",
        a: "Go to Customers and click 'New Customer': name, email, phone, billing address, tax number and contact person.",
      },
      {
        q: "How do I add a new contractor?",
        a: "Go to Contractors and click 'Add Contractor': company name, contact person, email, phone, address, tax ID and bank details (bank details are required for payments), plus status and rating.",
      },
      {
        q: "What does the Blacklisted status mean?",
        a: "Blacklisted contractors cannot be selected for new bills or jobs. Use it when a contractor is suspended for compliance reasons.",
      },
      {
        q: "How is the contractor rating calculated?",
        a: "It is a manual 1–5 star rating set internally, used for vendor performance tracking when comparing bids.",
      },
    ],
  },
  {
    category: "Notifications",
    items: [
      {
        q: "How do notifications work?",
        a: "Every workflow transition notifies the next actor's role group in-app. The bell icon in the navbar shows your unread count (refreshed every 30 seconds) and lists the newest alerts.",
      },
      {
        q: "Where do I see the full notification history?",
        a: "Open the Notifications page from the sidebar. You can mark individual or all notifications as read, and delete the ones you no longer need.",
      },
      {
        q: "Can I control how I am alerted?",
        a: "Yes — Settings → Notifications lets you choose how workflow alerts reach you. Critical workflow alerts are always delivered because they drive the approval chain.",
      },
    ],
  },
];

// ── Quick contact details ──
const contacts = [
  { icon: Mail, label: "Email Support", detail: "finance-support@sltdigital.lk", href: "mailto:finance-support@sltdigital.lk" },
  { icon: Phone, label: "IT Hotline", detail: "+94 11 234 5678", href: "tel:+94112345678" },
  { icon: MessageSquare, label: "Internal Helpdesk", detail: "Ext: 4402 (Mon–Fri 08:30–17:00)", href: null },
];

// ── Resources — every entry opens a real part of the system ──
const resources = [
  {
    label: "Full System Walkthrough",
    description: "Complete step-by-step documentation: every module, workflow, field, status and download",
    icon: Workflow,
    href: "/help/guides",
    featured: true,
  },
  {
    label: "Documentation Library",
    description: "API reference, testing guide, setup & deployment guide and everything else",
    icon: Library,
    href: "/help/docs",
    featured: true,
  },
  {
    label: "Getting Started Walkthrough",
    description: "Executive dashboard: KPIs, collection efficiency and recent activity",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Tender Pipeline Guide",
    description: "Track tenders from Open to Awarded and issue customer award letters",
    icon: Gavel,
    href: "/tenders",
  },
  {
    label: "Jobs & Bid Comparison Guide",
    description: "Create jobs, collect 3+ contractor quotations and award the winner",
    icon: Briefcase,
    href: "/jobs",
  },
  {
    label: "Purchase Order Guide",
    description: "Issue POs, follow the Draft → Approved → Sent → Received flow, PDFs",
    icon: ClipboardList,
    href: "/purchase-orders",
  },
  {
    label: "Contractor Billing Guide",
    description: "Documents, verification, approval, milestone payments and retention",
    icon: Receipt,
    href: "/contractor-bills",
  },
  {
    label: "Invoice & Banking Guide",
    description: "Tax invoices, finance approval, payment recording and banking",
    icon: FileSpreadsheet,
    href: "/invoices",
  },
  {
    label: "Notifications Guide",
    description: "Workflow alerts for your role, unread tracking and read state",
    icon: Bell,
    href: "/notifications",
  },
];

// ── Release notes — matches the deployed build ──
const releases = [
  {
    version: "2.1.0",
    date: "Current release",
    notes: [
      "Tender-to-cash lifecycle: tenders, jobs, contractor quotations with bid comparison and job award",
      "Statutory tax invoice generation with locked VAT schedule",
      "Purchase orders with status machine, PDF download and audit trail",
      "Contractor bill workflow: documents, verification, approval, milestone payments and retention",
      "Invoice payments, cheque registry and banking with internal receipts",
      "Notifications center with shared bell state across the navbar and page",
      "Draft-model Settings, localized status badges (English / Sinhala / Tamil) and regional formatting",
    ],
  },
];

// ── Ticket meta (mirrors backend SupportTicket::CATEGORIES / PRIORITIES) ──
const ticketCategories = [
  "Account & Access",
  "Tenders & Jobs",
  "Purchase Orders",
  "Contractor Bills",
  "Invoices & Payments",
  "Notifications",
  "Report a Bug",
  "Feature Request",
  "Other",
];

const ticketPriorities = ["Low", "Medium", "High", "Critical"];

const ticketStatusMeta = {
  Open: { className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", icon: AlertCircle },
  "In Progress": { className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", icon: Clock },
  Resolved: { className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", icon: CheckCircle2 },
  Closed: { className: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

const priorityMeta = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  High: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  Critical: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

const emptyTicketForm = {
  category: "",
  priority: "Medium",
  subject: "",
  description: "",
};

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

  // ── Support tickets ──
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState(emptyTicketForm);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // ── System status (real maintenance-mode state from the API) ──
  const [maintenanceMode, setMaintenanceMode] = useState(null);
  const [releaseOpen, setReleaseOpen] = useState(false);

  const loadTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await api.get("/support-tickets");
      setTickets(res.data.data || []);
    } catch {
      toast.error("Failed to load your support tickets");
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setTicketsLoading(true);
      try {
        const res = await api.get("/support-tickets");
        if (!cancelled) setTickets(res.data.data || []);
      } catch {
        if (!cancelled) toast.error("Failed to load your support tickets");
      } finally {
        if (!cancelled) setTicketsLoading(false);
      }
    };
    load();

    api
      .get("/system/maintenance-status")
      .then((res) => {
        if (!cancelled) setMaintenanceMode(res.data.maintenance_mode);
      })
      .catch(() => {
        if (!cancelled) setMaintenanceMode(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTicketSubmit = async () => {
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      toast.error("Subject and description are required");
      return;
    }
    setSubmittingTicket(true);
    try {
      const res = await api.post("/support-tickets", ticketForm);
      toast.success(`Ticket ${res.data.ticket.ticket_number} submitted — the IT team will respond shortly`);
      setTicketForm(emptyTicketForm);
      setTicketModalOpen(false);
      loadTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit ticket");
    } finally {
      setSubmittingTicket(false);
    }
  };

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
              Find answers, contact support, and raise tickets
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/help/guides"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
            >
              <Workflow className="w-3.5 h-3.5" />
              Full Walkthrough Guide
            </Link>
            <Button className="h-8 gap-1.5 text-xs shadow-xs" onClick={() => setTicketModalOpen(true)}>
              <TicketIcon className="w-3.5 h-3.5" />
              Submit Support Ticket
            </Button>
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
              <CardContent className="space-y-1 pt-0">
                {resources.map((r, i) => (
                  <Link
                    key={i}
                    href={r.href}
                    className={`group flex items-start gap-3 p-2 rounded-lg border transition-colors ${
                      r.featured
                        ? "border-primary/30 bg-primary/[0.06] hover:bg-primary/10"
                        : "border-transparent hover:border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                      r.featured ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}>
                      <r.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{r.label}</h4>
                        {r.featured && (
                          <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[9px] font-semibold uppercase tracking-wide">
                            Complete guide
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{r.description}</p>
                    </div>
                  </Link>
                ))}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-xs h-8"
                  onClick={() => setReleaseOpen(true)}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  Release Notes
                </Button>
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
                <p className="text-xs text-primary-foreground/80">Our IT team responds within 2 business hours during business days. Include the tender, job or invoice number you are working on for a faster resolution.</p>
                <Button className="w-full bg-white text-primary hover:bg-white/90 h-8 text-xs" onClick={() => setTicketModalOpen(true)}>Submit Support Ticket</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3.5 space-y-2">
                {maintenanceMode === null ? (
                  <p className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking system status...</p>
                ) : maintenanceMode ? (
                  <p className="text-xs font-medium flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-amber-500" /> System Status: Maintenance Mode — write operations are temporarily disabled</p>
                ) : (
                  <p className="text-xs font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> System Status: Operational</p>
                )}
                <p className="text-xs font-medium flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> Support hours: Mon–Fri 08:30–17:00</p>
                <p className="text-xs font-medium flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-amber-500" /> Version: 2.1.0</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* My Tickets */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <TicketIcon className="w-3.5 h-3.5 text-primary" /> My Support Tickets
            </h2>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}</span>
          </div>
          <Card>
            <CardContent className="p-0">
              {ticketsLoading ? (
                <div className="p-6 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2.5">
                    <TicketIcon className="text-muted-foreground" size={18} />
                  </div>
                  <h3 className="text-xs font-medium text-foreground">No support tickets yet</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Raise a ticket and the IT team will respond here and by email</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tickets.map((ticket) => {
                    const statusMeta = ticketStatusMeta[ticket.status] || ticketStatusMeta.Open;
                    const StatusIcon = statusMeta.icon;
                    return (
                      <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-3.5 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-foreground">{ticket.subject}</span>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${statusMeta.className}`}>
                              <StatusIcon className="w-3 h-3" />
                              {ticket.status}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityMeta[ticket.priority] || ""}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {ticket.ticket_number} · {ticket.category} · raised {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Ticket Modal */}
      <FormModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Submit Support Ticket"
        description="Describe the issue and the IT team will respond within 2 business hours"
        onSubmit={handleTicketSubmit}
        submitText="Submit Ticket"
        isSubmitting={submittingTicket}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select
              value={ticketForm.category}
              onValueChange={(value) => setTicketForm((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {ticketCategories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Priority</Label>
            <Select
              value={ticketForm.priority}
              onValueChange={(value) => setTicketForm((prev) => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {ticketPriorities.map((p) => (
                  <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Subject</Label>
            <Input
              value={ticketForm.subject}
              onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="Short summary of the issue"
              maxLength={200}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={ticketForm.description}
              onChange={(e) => setTicketForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Include the tender, job, PO, bill or invoice number, what you expected to happen, and what actually happened"
              rows={5}
              maxLength={5000}
              className="text-xs"
            />
            <p className="text-[10px] text-muted-foreground text-right">{ticketForm.description.length}/5000</p>
          </div>
        </div>
      </FormModal>

      {/* Release Notes Modal */}
      <FormModal
        isOpen={releaseOpen}
        onClose={() => setReleaseOpen(false)}
        title="Release Notes"
        description="What shipped in each release of ProcureX"
        submitText="Close"
        onSubmit={() => setReleaseOpen(false)}
        cancelText="Close"
      >
        <div className="space-y-4">
          {releases.map((release) => (
            <div key={release.version} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Version {release.version}</span>
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">{release.date}</span>
              </div>
              <ul className="space-y-1.5">
                {release.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground">
              The complete end-to-end system guide (workflows, statuses, roles and demo data) is available from the administration team.
            </p>
          </div>
        </div>
      </FormModal>
    </ProtectedRoute>
  );
}
