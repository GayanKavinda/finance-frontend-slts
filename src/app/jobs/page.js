// src/app/jobs/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchJobs, createJob, updateJob, deleteJob, fetchCustomers, fetchTenders } from "@/lib/procurement";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  HardHat,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  CheckCircle,
  Clock,
  Target,
  DollarSign,
  ArrowRight,
  LayoutGrid,
  List,
  Filter,
  X,
  TrendingUp,
  FolderOpen,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FormModal from "@/components/ui/FormModal";
import StatusBadge from "@/components/ui/StatusBadge";
import { useRouter } from "next/navigation";

const STATUS_CONFIG = {
  Pending: {
    bg: "bg-amber-500",
    light: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/20",
    gradient: "from-amber-400 to-amber-500",
    dot: "bg-amber-500",
  },
  Active: {
    bg: "bg-blue-500",
    light: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-500/20",
    gradient: "from-blue-400 to-blue-500",
    dot: "bg-blue-500",
  },
  "On Hold": {
    bg: "bg-orange-500",
    light: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-500/20",
    gradient: "from-orange-400 to-orange-500",
    dot: "bg-orange-500",
  },
  Completed: {
    bg: "bg-emerald-500",
    light: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/20",
    gradient: "from-emerald-400 to-emerald-500",
    dot: "bg-emerald-500",
  },
  Cancelled: {
    bg: "bg-rose-500",
    light: "bg-rose-50 dark:bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-500/20",
    gradient: "from-rose-400 to-rose-500",
    dot: "bg-rose-500",
  },
};

// Grid Card View
function JobGridCard({ job, onEdit, onDelete, onClick }) {
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.Pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Top Accent Bar */}
      <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${config.light} ${config.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.bg}`} />
                {job.status}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-1 leading-snug mb-1">
              {job.name}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              #{job.id} • {job.customer?.name || "No customer"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(job)}
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(job.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Value Highlight */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Project Value</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  LKR {Number(job.project_value || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {job.tender?.tender_number && (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-violet-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">Tender</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{job.tender.tender_number}</p>
              </div>
            </div>
          )}
          {(job.work_start_date || job.work_completion_date) && (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">Duration</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {job.work_start_date?.split("-")[0] || "—"} → {job.work_completion_date?.split("-")[0] || "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            View details
          </span>
          <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

// List View
function JobListCard({ job, onEdit, onDelete, onClick }) {
  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.Pending;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="flex items-stretch">
        {/* Status Bar */}
        <div className={`w-1.5 bg-gradient-to-b ${config.gradient}`} />

        <div className="flex-1 p-4">
          <div className="flex items-center gap-4">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{job.name}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${config.light} ${config.text}`}>
                  {job.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="text-slate-300 dark:text-slate-600">#{job.id}</span>
                </span>
                {job.customer?.name && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {job.customer.name}
                  </span>
                )}
                {job.tender?.tender_number && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {job.tender.tender_number}
                  </span>
                )}
              </div>
            </div>

            {/* Value */}
            <div className="text-right hidden sm:block min-w-[140px]">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Value</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                LKR {Number(job.project_value || 0).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEdit(job)}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(job.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard({ viewMode }) {
  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
        <div className="flex items-stretch">
          <div className="w-1.5 bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        </div>
        <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400";

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
    {children}
  </div>
);

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    customer_id: "",
    tender_id: "",
  });
  const [form, setForm] = useState({
    tender_id: "",
    customer_id: "",
    name: "",
    project_value: "",
    description: "",
    status: "Pending",
    work_start_date: "",
    work_completion_date: "",
  });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJobs({ page, search, ...filters });
      setJobs(data.data || []);
      setMeta(data.meta || {});
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);
  useEffect(() => {
    Promise.all([fetchCustomers({ page: 1 }), fetchTenders({ page: 1 })])
      .then(([c, t]) => {
        setCustomers(c.data || []);
        setTenders(t.data || []);
      })
      .catch(() => {});
  }, []);

  const openDrawer = (job = null) => {
    setSelectedJob(job);
    setForm(
      job
        ? {
            tender_id: job.tender_id || "",
            customer_id: job.customer_id || "",
            name: job.name || "",
            project_value: job.project_value || "",
            description: job.description || "",
            status: job.status || "Pending",
            work_start_date: job.work_start_date || "",
            work_completion_date: job.work_completion_date || "",
          }
        : {
            tender_id: "",
            customer_id: "",
            name: "",
            project_value: "",
            description: "",
            status: "Pending",
            work_start_date: "",
            work_completion_date: "",
          }
    );
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        project_value: form.project_value === "" ? 0 : Number(form.project_value),
      };
      if (selectedJob) {
        await updateJob(selectedJob.id, payload);
        toast.success("Job updated");
      } else {
        await createJob(payload);
        toast.success("Job created");
      }
      setDrawerOpen(false);
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJob(id);
      toast.success("Job deleted");
      setDeleteConfirm(null);
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const clearFilters = () => {
    setFilters({ status: "", customer_id: "", tender_id: "" });
    setPage(1);
  };

  const hasActiveFilters = filters.status || filters.customer_id || filters.tender_id;

  const total = meta.total ?? jobs.length;
  const pending = jobs.filter((j) => j.status === "Pending").length;
  const active = jobs.filter((j) => j.status === "Active").length;
  const completed = jobs.filter((j) => j.status === "Completed").length;

  return (
    <>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Jobs & Projects</h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage project execution and contractor assignments
              </p>
            </div>
            <button
              onClick={() => openDrawer()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              New Job
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Jobs</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{pending}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pending</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-500/20 dark:to-sky-500/10 flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-sky-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{active}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{completed}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Completed</p>
            </div>
          </div>

          {/* Search, Filters & View Toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs by name, customer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>

            {/* Filter & View Controls */}
            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  showFilters || hasActiveFilters
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="min-w-[20px] h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {[filters.status, filters.customer_id, filters.tender_id].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* View Toggle */}
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-primary/10 text-primary"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-primary/10 text-primary"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 dark:text-slate-500">Active filters:</span>
              {filters.status && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, status: "" }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg"
                >
                  Status: {filters.status}
                  <X className="w-3 h-3" />
                </button>
              )}
              {filters.customer_id && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, customer_id: "" }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg"
                >
                  {customers.find((c) => c.id == filters.customer_id)?.name || "Customer"}
                  <X className="w-3 h-3" />
                </button>
              )}
              {filters.tender_id && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, tender_id: "" }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg"
                >
                  {tenders.find((t) => t.id == filters.tender_id)?.tender_number || "Tender"}
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Filter Jobs
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Customer</label>
                      <select
                        value={filters.customer_id}
                        onChange={(e) => setFilters((f) => ({ ...f, customer_id: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      >
                        <option value="">All Customers</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Tender</label>
                      <select
                        value={filters.tender_id}
                        onChange={(e) => setFilters((f) => ({ ...f, tender_id: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      >
                        <option value="">All Tenders</option>
                        {tenders.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.tender_number}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Jobs Grid/List */}
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} viewMode="grid" />)
                ) : jobs.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 flex items-center justify-center mb-4">
                      <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">No jobs found</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 mb-4">Create your first job to get started</p>
                    <button
                      onClick={() => openDrawer()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Job
                    </button>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <JobGridCard
                      key={job.id}
                      job={job}
                      onEdit={openDrawer}
                      onDelete={(id) => setDeleteConfirm(id)}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    />
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} viewMode="list" />)
                ) : jobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 flex items-center justify-center mb-4">
                      <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">No jobs found</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 mb-4">Create your first job to get started</p>
                    <button
                      onClick={() => openDrawer()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Job
                    </button>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <JobListCard
                      key={job.id}
                      job={job}
                      onEdit={openDrawer}
                      onDelete={(id) => setDeleteConfirm(id)}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-[40px] h-10 rounded-xl text-sm font-medium transition-all ${
                      page === p
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Job Form Modal */}
      <FormModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedJob ? "Update Job" : "Create Job"}
        description={selectedJob ? "Edit job details" : "Create a new project job"}
        onSubmit={handleSubmit}
        submitText={selectedJob ? "Update" : "Create"}
        isSubmitting={saving}
        size="lg"
      >
        <div className="space-y-4">
          <Field label="Job / Project Name *">
            <input
              required
              value={form.name}
              onChange={(e) => setF("name", e.target.value)}
              placeholder="e.g. Fiber Backbone Phase 1"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Customer *">
              <select
                required
                value={form.customer_id}
                onChange={(e) => setF("customer_id", e.target.value)}
                className={inputCls}
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setF("status", e.target.value)} className={inputCls}>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </Field>
          </div>

          <Field label="Linked Tender *">
            <select
              required
              value={form.tender_id}
              onChange={(e) => setF("tender_id", e.target.value)}
              className={inputCls}
            >
              <option value="">Select tender...</option>
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tender_number} — {t.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Project Value (LKR)">
            <input
              type="number"
              value={form.project_value}
              onChange={(e) => setF("project_value", e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setF("description", e.target.value)}
              placeholder="Brief scope..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Work Start Date">
              <input
                type="date"
                value={form.work_start_date}
                onChange={(e) => setF("work_start_date", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Completion Date">
              <input
                type="date"
                value={form.work_completion_date}
                onChange={(e) => setF("work_completion_date", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
          >
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 dark:from-red-500/20 dark:to-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Job?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                This action cannot be undone. Jobs with purchase orders cannot be deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}