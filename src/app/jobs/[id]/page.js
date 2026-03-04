"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchJobQuotations, submitQuotation, selectQuotation, fetchContractors } from "@/lib/contractor";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  User,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  FileText,
  Download,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import StatusBadge from "@/components/ui/StatusBadge";
import axios from "@/lib/axios";
import FormModal from "@/components/ui/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    contractor_id: "",
    quotation_amount: "",
    quotation_date: new Date().toISOString().split("T")[0],
    work_scope: "",
    estimated_days: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobRes, quoteRes, contractorRes] = await Promise.all([
        axios.get(`/jobs/${id}`),
        fetchJobQuotations(id),
        fetchContractors(),
      ]);
      setJob(jobRes.data);
      setQuotations(quoteRes);
      setContractors(contractorRes);
    } catch (error) {
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitQuotation({ ...quoteForm, job_id: id });
      toast.success("Quotation submitted successfully");
      setIsQuoteModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit quotation");
    }
  };

  const handleSelectContractor = async (quoteId) => {
    if (confirm("Select this contractor and award the job? This will reject other bids.")) {
      try {
        await selectQuotation(quoteId);
        toast.success("Contractor selected successfully");
        loadData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Selection failed");
      }
    }
  };

  const handleDownloadAwardLetter = async () => {
    try {
      const res = await axios.get(`/jobs/${id}/award-letter`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Award-Letter-${job.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download award letter");
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-pulse space-y-6">
        <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) return <div className="p-8 text-center text-slate-500">Job not found</div>;

  const profit = job.project_value - (job.contractor_quote_amount || 0);
  const margin = job.project_value > 0 ? (profit / job.project_value) * 100 : 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/jobs")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                {job.name}
              </h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              #{job.id} • {job.customer?.name}
            </p>
          </div>

          {job.selected_contractor_id && (
            <button
              onClick={handleDownloadAwardLetter}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Award Letter
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Project Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-sky-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Customer
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {job.customer?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-violet-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Tender No.
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {job.tender?.tender_number}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Project Value
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    LKR {Number(job.project_value).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Contractor
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {job.selectedContractor?.name || "Not Assigned"}
                  </p>
                </div>
              </div>
            </div>

            {job.description && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-700/50">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Scope of Work
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {job.description}
                </p>
              </div>
            )}
          </div>

          {/* Quotations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Contractor Quotations
              </h2>
              {job.status === "Pending" && (
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {quotations.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">No quotations yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Add contractor quotations to compare bids
                  </p>
                </div>
              ) : (
                quotations.map((quote) => (
                  <div
                    key={quote.id}
                    className={`p-4 transition-colors ${
                      quote.status === "Selected"
                        ? "bg-emerald-50/50 dark:bg-emerald-500/5"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {quote.contractor.name}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                              <Calendar className="w-3 h-3" />
                              {new Date(quote.quotation_date).toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="w-3 h-3" />
                              {quote.estimated_days} days
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Amount
                          </p>
                          <p className="text-base font-semibold text-slate-900 dark:text-white">
                            LKR {Number(quote.quotation_amount).toLocaleString()}
                          </p>
                        </div>

                        {quote.status === "Selected" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Selected
                          </span>
                        ) : quote.status === "Rejected" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400 text-xs font-medium">
                            Rejected
                          </span>
                        ) : (
                          job.status === "Pending" && (
                            <button
                              onClick={() => handleSelectContractor(quote.id)}
                              className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
                            >
                              Select
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-5 text-white">
            <h2 className="text-sm font-medium mb-4 flex items-center gap-2 opacity-90">
              <TrendingUp className="w-4 h-4" />
              Financial Summary
            </h2>

            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-wider opacity-70">Estimated Margin</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-semibold">LKR {profit.toLocaleString()}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md ${
                    margin > 20 ? "bg-white/20" : "bg-red-400/30"
                  }`}
                >
                  {margin.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Revenue</span>
                <span className="font-medium">{Number(job.project_value).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70">Contractor Cost</span>
                <span className="font-medium">-{Number(job.contractor_quote_amount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl p-5">
            <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" />
              Next Steps
            </h3>
            <p className="text-sm text-amber-600/80 dark:text-amber-500/80 leading-relaxed">
              {job.status === "Pending"
                ? "Collect at least 3 quotations from different contractors before making a selection."
                : "The contractor has been selected. You can now start recording bills and tracking progress."}
            </p>
          </div>
        </div>
      </div>

      {/* Quotation Modal */}
      <FormModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title="Submit Quotation"
        description="Add a contractor quotation for this job"
        onSubmit={handleQuoteSubmit}
        submitText="Submit Quote"
        size="lg"
      >
        <div className="space-y-2">
          <Label htmlFor="contractor_id">Contractor *</Label>
          <select
            id="contractor_id"
            required
            value={quoteForm.contractor_id}
            onChange={(e) => setQuoteForm({ ...quoteForm, contractor_id: e.target.value })}
            className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a contractor</option>
            {contractors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.status === "Blacklisted" ? "(Blacklisted)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quotation_amount">Amount (LKR) *</Label>
            <Input
              id="quotation_amount"
              type="number"
              step="0.01"
              required
              value={quoteForm.quotation_amount}
              onChange={(e) => setQuoteForm({ ...quoteForm, quotation_amount: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quotation_date">Date *</Label>
            <Input
              id="quotation_date"
              type="date"
              required
              value={quoteForm.quotation_date}
              onChange={(e) => setQuoteForm({ ...quoteForm, quotation_date: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_days">Duration (Days)</Label>
          <Input
            id="estimated_days"
            type="number"
            value={quoteForm.estimated_days}
            onChange={(e) => setQuoteForm({ ...quoteForm, estimated_days: e.target.value })}
            placeholder="e.g. 30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="work_scope">Work Scope / Notes</Label>
          <Textarea
            id="work_scope"
            rows={3}
            value={quoteForm.work_scope}
            onChange={(e) => setQuoteForm({ ...quoteForm, work_scope: e.target.value })}
            placeholder="Describe the work scope..."
          />
        </div>
      </FormModal>
    </div>
  );
}