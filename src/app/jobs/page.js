// src/app/jobs/page.js
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  fetchJobs,
  createJob,
  updateJob,
  deleteJob,
  fetchCustomers,
  fetchTenders,
} from "@/lib/procurement";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Filter,
  X,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Decomposed Sub-components
import JobGridCard from "./components/JobGridCard";
import JobListCard from "./components/JobListCard";
import JobStatsCards from "./components/JobStatsCards";
import JobFilterPanel from "./components/JobFilterPanel";
import JobFormModal from "./components/JobFormModal";
import DeleteJobModal from "./components/DeleteJobModal";

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

export default function JobsPage() {
  const router = useRouter();
  const searchTimerRef = useRef(null);

  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(() => {
    if (typeof window !== "undefined") {
      return Number(new URLSearchParams(window.location.search).get("page")) || 1;
    }
    return 1;
  });
  const [search, setSearch] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("search") || "";
    }
    return "";
  });
  const [searchInput, setSearchInput] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("search") || "";
    }
    return "";
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return {
        status: params.get("status") || "",
        customer_id: params.get("customer_id") || "",
        tender_id: params.get("tender_id") || "",
      };
    }
    return {
      status: "",
      customer_id: "",
      tender_id: "",
    };
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

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const p = Number(params.get("page")) || 1;
      const q = params.get("search") || "";
      const f = {
        status: params.get("status") || "",
        customer_id: params.get("customer_id") || "",
        tender_id: params.get("tender_id") || "",
      };
      setPage(p);
      setSearch(q);
      setSearchInput(q);
      setFilters(f);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (search) params.set("search", search);
    if (filters.status) params.set("status", filters.status);
    if (filters.customer_id) params.set("customer_id", filters.customer_id);
    if (filters.tender_id) params.set("tender_id", filters.tender_id);
    const qs = params.toString();
    const targetUrl = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    if (window.location.href !== targetUrl) {
      router.replace(targetUrl, { scroll: false });
    }
  }, [page, search, filters, router]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, search };
      if (filters.status) params.status = filters.status;
      if (filters.customer_id) params.customer_id = filters.customer_id;
      if (filters.tender_id) params.tender_id = filters.tender_id;

      const res = await fetchJobs(params);
      setJobs(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  const loadMetadata = useCallback(async () => {
    try {
      const [cRes, tRes] = await Promise.all([
        fetchCustomers(),
        fetchTenders(),
      ]);
      setCustomers(cRes.data || cRes || []);
      setTenders(tRes.data || tRes || []);
    } catch (err) {
      console.error("Failed to load metadata:", err);
    }
  }, []);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const openDrawer = (job = null) => {
    if (job) {
      setSelectedJob(job);
      setForm({
        tender_id: job.tender_id || "",
        customer_id: job.customer_id || "",
        name: job.name || "",
        project_value: job.project_value || "",
        description: job.description || "",
        status: job.status || "Pending",
        work_start_date: job.work_start_date || "",
        work_completion_date: job.work_completion_date || "",
      });
    } else {
      setSelectedJob(null);
      setForm({
        tender_id: "",
        customer_id: "",
        name: "",
        project_value: "",
        description: "",
        status: "Pending",
        work_start_date: "",
        work_completion_date: "",
      });
    }
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        project_value: form.project_value ? Number(form.project_value) : null,
      };

      if (selectedJob) {
        await updateJob(selectedJob.id, payload);
        toast.success("Job updated successfully");
      } else {
        await createJob(payload);
        toast.success("Job created successfully");
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

  const hasActiveFilters =
    filters.status || filters.customer_id || filters.tender_id;

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
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Jobs & Projects
                </h1>
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
          <JobStatsCards
            total={total}
            pending={pending}
            active={active}
            completed={completed}
          />

          {/* Search, Filters & View Toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs by name, customer..."
                value={searchInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchInput(val);
                  if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                  searchTimerRef.current = setTimeout(() => {
                    setSearch(val);
                    setPage(1);
                  }, 300);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>

            {/* Filter & View Controls */}
            <div className="flex items-center gap-2">
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
                    {
                      [
                        filters.status,
                        filters.customer_id,
                        filters.tender_id,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </button>

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
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Active filters:
              </span>
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
                  {customers.find((c) => c.id == filters.customer_id)?.name ||
                    "Customer"}
                  <X className="w-3 h-3" />
                </button>
              )}
              {filters.tender_id && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, tender_id: "" }))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg"
                >
                  {tenders.find((t) => t.id == filters.tender_id)
                    ?.tender_number || "Tender"}
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
          <JobFilterPanel
            showFilters={showFilters}
            filters={filters}
            setFilters={setFilters}
            customers={customers}
            tenders={tenders}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
          />

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
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} viewMode="grid" />
                  ))
                ) : jobs.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 flex items-center justify-center mb-4">
                      <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      No jobs found
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 mb-4">
                      Create your first job to get started
                    </p>
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
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} viewMode="list" />
                  ))
                ) : jobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 flex items-center justify-center mb-4">
                      <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      No jobs found
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 mb-4">
                      Create your first job to get started
                    </p>
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
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(
                  (p) => (
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
                  ),
                )}
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
      <JobFormModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedJob={selectedJob}
        form={form}
        setF={setF}
        customers={customers}
        tenders={tenders}
        onSubmit={handleSubmit}
        isSubmitting={saving}
      />

      {/* Delete Confirmation */}
      <DeleteJobModal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        jobId={deleteConfirm}
        onConfirm={handleDelete}
      />
    </>
  );
}
