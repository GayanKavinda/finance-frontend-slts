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
import { exportJobs } from "@/lib/procurement";
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
  FileText,
  ShoppingCart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import JobGridCard from "./components/JobGridCard";
import JobListCard from "./components/JobListCard";
import JobStatsCards from "./components/JobStatsCards";
import JobFilterPanel from "./components/JobFilterPanel";
import JobFormModal from "./components/JobFormModal";
import DeleteJobModal from "./components/DeleteJobModal";

const STATUS_FILTERS = [
  "",
  "Pending",
  "Active",
  "Completed",
  "Cancelled",
];

function SkeletonCard({ viewMode }) {
  if (viewMode === "list") {
    return (
      <div className="bg-card border border-border rounded-lg animate-pulse">
        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-1 bg-muted h-6" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-2.5 bg-muted rounded w-1/2" />
            </div>
            <div className="h-6 w-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg animate-pulse">
      <div className="p-3 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-3 bg-muted rounded w-24" />
          </div>
        </div>
        <div className="h-8 bg-muted rounded" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-8 bg-muted rounded" />
          <div className="h-8 bg-muted rounded" />
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
    const run = async () => {
      await loadMetadata();
    };
    run();
  }, [loadMetadata]);

  useEffect(() => {
    const run = async () => {
      await loadJobs();
    };
    run();
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

  const handleExport = async () => {
    try {
      const blob = await exportJobs({
        status: filters.status,
        customer_id: filters.customer_id,
        tender_id: filters.tender_id,
        search,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `jobs_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Export started");
    } catch (err) {
      toast.error(err.response?.data?.message || "Export failed");
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
    <div className="min-h-full bg-background p-4 sm:p-6 space-y-4">
      {/* Zen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Jobs & Projects
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage project execution and contractor assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleExport}
            variant="outline"
            className="h-8 text-xs gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => openDrawer()}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Job
          </Button>
        </div>
      </div>

      {/* Stat Strip */}
      <JobStatsCards
        total={total}
        pending={pending}
        active={active}
        completed={completed}
      />

      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-auto flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
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
            className="h-8 text-xs pl-8 bg-card border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters || hasActiveFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 h-8 text-xs"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center px-1">
                {[filters.status, filters.customer_id, filters.tender_id].filter(Boolean).length}
              </span>
            )}
          </Button>

          <div className="flex items-center bg-muted/30 border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground">
            Active filters:
          </span>
          {filters.status && (
            <button
              onClick={() => setFilters((f) => ({ ...f, status: "" }))}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded"
            >
              Status: {filters.status}
              <X className="w-3 h-3" />
            </button>
          )}
          {filters.customer_id && (
            <button
              onClick={() => setFilters((f) => ({ ...f, customer_id: "" }))}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded"
            >
              {customers.find((c) => c.id == filters.customer_id)?.name || "Customer"}
              <X className="w-3 h-3" />
            </button>
          )}
          {filters.tender_id && (
            <button
              onClick={() => setFilters((f) => ({ ...f, tender_id: "" }))}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded"
            >
              {tenders.find((t) => t.id == filters.tender_id)?.tender_number || "Tender"}
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={clearFilters}
            className="text-[10px] text-muted-foreground hover:text-foreground underline"
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
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5"
          >
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} viewMode="grid" />
              ))
            ) : jobs.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 bg-card border border-border rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  No jobs found
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">
                  Create your first job to get started
                </p>
                <Button
                  onClick={() => openDrawer()}
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Job
                </Button>
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
            className="space-y-2.5"
          >
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} viewMode="list" />
              ))
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-card border border-border rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  No jobs found
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">
                  Create your first job to get started
                </p>
                <Button
                  onClick={() => openDrawer()}
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Job
                </Button>
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
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
          <span>
            Page {page} of {meta.last_page} ({total} jobs)
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7 w-7"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="h-7 w-7"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

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
    </div>
  );
}