// src/app/jobs/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
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
  Edit2,
  Trash2,
  X,
  HardHat,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react";
import FormModal from "@/components/ui/FormModal";
import StatusBadge from "@/components/ui/StatusBadge";
import { useRouter } from "next/navigation";

const JOB_STATUS = {
  Pending: {
    accent: "from-amber-400 to-orange-400",
    pill: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  Active: {
    accent: "from-blue-500 to-indigo-500",
    pill: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  Completed: {
    accent: "from-emerald-400 to-teal-500",
    pill: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Cancelled: {
    accent: "from-gray-400 to-slate-400",
    pill: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
    dot: "bg-gray-400",
  },
};
const getJS = (s) => JOB_STATUS[s] || JOB_STATUS.Pending;

function JobCard({ job, onEdit, onDelete, onClick }) {
  const st = getJS(job.status);
  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${st.accent}`} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${st.pill}`}
              >
                <span className={`w-1 h-1 rounded-full ${st.dot}`} />
                {job.status}
              </span>
            </div>
            <h3
              className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {job.name}
            </h3>
          </div>
          <div
            className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit(job)}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(job.id)}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
          {job.customer?.name && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{job.customer.name}</span>
            </div>
          )}
          {job.tender?.tender_number && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{job.tender.tender_number}</span>
            </div>
          )}
          {(job.work_start_date || job.work_completion_date) && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>
                {job.work_start_date || "—"} → {job.work_completion_date || "—"}
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="pt-3 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Project Value
          </span>
          <span
            className="text-base font-black text-gray-900 dark:text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LKR {Number(job.project_value || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-200 dark:bg-gray-700" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-full" />
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-2/3" />
        <div className="h-px bg-gray-100 dark:bg-gray-700" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 ml-auto" />
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400";
const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
      {label}
    </label>
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
      const data = await fetchJobs({ page, search });
      setJobs(data.data || []);
      setMeta(data.meta || {});
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

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
          },
    );
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        project_value:
          form.project_value === "" ? 0 : Number(form.project_value),
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

  const total = meta.total ?? jobs.length;
  const pending = jobs.filter((j) => j.status === "Pending").length;
  const active = jobs.filter((j) => j.status === "Active").length;
  const completed = jobs.filter((j) => j.status === "Completed").length;

  return (
    <>
      <div className="min-h-full p-6 space-y-6">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-8 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">
                Project Execution
              </p>
              <h1
                className="text-3xl font-black text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Jobs & Projects
              </h1>
              <p className="text-indigo-200/60 text-sm mt-1">
                {total} project{total !== 1 ? "s" : ""} registered
              </p>
            </div>
            <button
              onClick={() => openDrawer()}
              className="flex items-center gap-2 bg-white hover:bg-indigo-50 text-slate-900 px-5 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Plus className="w-4 h-4" />
              New Job
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              icon: Target,
              label: "Total",
              value: total,
              color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600",
            },
            {
              icon: Clock,
              label: "Pending",
              value: pending,
              color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
            },
            {
              icon: HardHat,
              label: "Active",
              value: active,
              color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
            },
            {
              icon: CheckCircle,
              label: "Done",
              value: completed,
              color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div
                className="text-2xl font-bold text-gray-900 dark:text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {value}
              </div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : jobs.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <HardHat className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No jobs found</p>
            </div>
          ) : (
            jobs.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                onEdit={openDrawer}
                onDelete={(id) => setDeleteConfirm(id)}
                onClick={() => router.push(`/jobs/${j.id}`)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === p ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
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
        <div className="space-y-5">
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
                      <option value="">Select…</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={(e) => setF("status", e.target.value)}
                      className={inputCls}
                    >
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
                    <option value="">Select tender…</option>
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
                    placeholder="Brief scope…"
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
                      onChange={(e) =>
                        setF("work_completion_date", e.target.value)
                      }
                      className={inputCls}
                    />
                  </Field>
                </div>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3
                className="font-black text-gray-900 dark:text-white text-lg"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Delete Job?
              </h3>
              <p className="text-sm text-gray-500">
                Jobs with purchase orders cannot be deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-black transition-colors shadow-lg shadow-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
