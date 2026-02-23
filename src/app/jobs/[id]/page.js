"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchJobs } from "@/lib/procurement"; // Assuming fetchJob is not there, I will use fetchJobs and filter or add fetchJob to lib
import {
  fetchJobQuotations,
  submitQuotation,
  selectQuotation,
  fetchContractors,
} from "@/lib/contractor";
import { toast } from "react-hot-toast";
import {
  ChevronLeft,
  Plus,
  Target,
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
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import axios from "@/lib/axios";

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
      toast.error(
        error.response?.data?.message || "Failed to submit quotation",
      );
    }
  };

  const handleSelectContractor = async (quoteId) => {
    if (
      confirm(
        "Select this contractor and award the job? This will reject other bids.",
      )
    ) {
      try {
        await selectQuotation(quoteId);
        toast.success("Contractor selected successfully");
        loadData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Selection failed");
      }
    }
  };

  if (loading)
    return (
      <div className="p-8 animate-pulse space-y-8">
        <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-gray-100 dark:bg-gray-800 rounded-3xl" />
          <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-3xl" />
        </div>
      </div>
    );

  if (!job) return <div className="p-8 text-center">Job not found</div>;

  const profit = job.project_value - (job.contractor_quote_amount || 0);
  const margin = job.project_value > 0 ? (profit / job.project_value) * 100 : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/jobs")}
            className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                {job.name}
              </h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-gray-500 font-medium">
              #{job.id} • {job.customer?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details and Quotations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job Overview Card */}
          <Card className="rounded-[2.5rem] p-8 border-none shadow-xl shadow-gray-100 dark:shadow-none bg-white dark:bg-gray-800">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Project Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Customer
                    </p>
                    <p className="font-bold">{job.customer?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Tender No.
                    </p>
                    <p className="font-bold">{job.tender?.tender_number}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Project Value
                    </p>
                    <p className="font-bold text-xl">
                      LKR {Number(job.project_value).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Assigned Contractor
                    </p>
                    <p className="font-bold">
                      {job.selectedContractor?.name || "Not Assigned"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Scope of Work
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {job.description || "No description provided."}
              </p>
            </div>
          </Card>

          {/* Quotations List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-black flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Contractor Quotations
              </h2>
              {job.status === "Pending" && (
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 font-bold transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Quotation
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {quotations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-gray-500 font-medium">
                    No quotations received yet
                  </p>
                </div>
              ) : (
                quotations.map((quote) => (
                  <Card
                    key={quote.id}
                    className={`rounded-[2rem] p-6 border-none shadow-lg transition-all ${quote.status === "Selected" ? "ring-2 ring-green-500 bg-green-50/10" : "bg-white dark:bg-gray-800"}`}
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-lg">
                            {quote.contractor.name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-500 font-medium mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />{" "}
                              {new Date(
                                quote.quotation_date,
                              ).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />{" "}
                              {quote.estimated_days} Days
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                        <div className="text-right">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Bid Amount
                          </p>
                          <p className="text-xl font-black text-gray-900 dark:text-white">
                            LKR{" "}
                            {Number(quote.quotation_amount).toLocaleString()}
                          </p>
                        </div>
                        {quote.status === "Selected" ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-black uppercase text-xs tracking-tighter bg-green-100 px-3 py-1.5 rounded-full">
                            <CheckCircle2 className="w-4 h-4" /> Selected
                          </div>
                        ) : quote.status === "Rejected" ? (
                          <div className="text-red-500 font-black uppercase text-xs tracking-tighter bg-red-100 px-3 py-1.5 rounded-full">
                            Rejected
                          </div>
                        ) : (
                          job.status === "Pending" && (
                            <button
                              onClick={() => handleSelectContractor(quote.id)}
                              className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                            >
                              Select
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Financials and Milestones */}
        <div className="space-y-8">
          {/* PROFIT ANALYTICS */}
          <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-gradient-to-br from-primary to-primary/80 text-white">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2 opacity-90">
              <TrendingUp className="w-5 h-5" />
              Project Financials
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-70">
                  Estimated Margin
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black tracking-tighter">
                    LKR {profit.toLocaleString()}
                  </span>
                  <span
                    className={`text-sm font-bold mb-1 px-2 py-0.5 rounded-full ${margin > 20 ? "bg-white/20" : "bg-red-400/20 text-red-100"}`}
                  >
                    {margin.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold opacity-70">Project Revenue</span>
                  <span className="font-black">
                    {Number(job.project_value).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold opacity-70">Contractor Cost</span>
                  <span className="font-black">
                    -{Number(job.contractor_quote_amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* HELP CARD */}
          <Card className="rounded-[2.5rem] p-8 border-none bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
            <h3 className="text-amber-800 dark:text-amber-400 font-black flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5" />
              Next Steps
            </h3>
            <p className="text-amber-700/80 dark:text-amber-500/80 text-sm leading-relaxed font-medium">
              {job.status === "Pending"
                ? "Collect at least 3 quotations from different contractors before making a selection. Once selected, the job will transition to In Progress."
                : "The contractor has been selected. You can now start recording bills and tracking progress."}
            </p>
          </Card>
        </div>
      </div>

      {/* Quotation Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Submit Quotation
              </h2>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleQuoteSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Contractor
                </label>
                <select
                  required
                  value={quoteForm.contractor_id}
                  onChange={(e) =>
                    setQuoteForm({
                      ...quoteForm,
                      contractor_id: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold appearance-none"
                >
                  <option value="">Select a contractor</option>
                  {contractors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{" "}
                      {c.status === "Blacklisted" ? "(Blacklisted)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Quoted Amount
                  </label>
                  <input
                    type="number"
                    required
                    value={quoteForm.quotation_amount}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        quotation_amount: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Quote Date
                  </label>
                  <input
                    type="date"
                    required
                    value={quoteForm.quotation_date}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        quotation_date: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Est. Duration (Days)
                </label>
                <input
                  type="number"
                  value={quoteForm.estimated_days}
                  onChange={(e) =>
                    setQuoteForm({
                      ...quoteForm,
                      estimated_days: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Work Scope / Notes
                </label>
                <textarea
                  rows={3}
                  value={quoteForm.work_scope}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, work_scope: e.target.value })
                  }
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none resize-none font-medium"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="flex-1 px-8 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-2xl font-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-lg shadow-primary/20 transition-all"
                >
                  Submit Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
