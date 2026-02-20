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
  User,
  Briefcase,
  Target,
} from "lucide-react";
// Removed duplicate Layout wrapper
import StatusBadge from "@/components/ui/StatusBadge";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form, setForm] = useState({
    tender_id: "",
    customer_id: "",
    name: "",
    project_value: "",
    description: "",
    status: "Pending",
  });

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJobs({ page, search });
      setJobs(data.data || []);
      setMeta(data.meta || {});
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const loadDependencies = async () => {
    try {
      const [cRes, tRes] = await Promise.all([
        fetchCustomers({ page: 1 }),
        fetchTenders({ page: 1 }),
      ]);
      setCustomers(cRes.data || []);
      setTenders(tRes.data || []);
    } catch (error) {
      console.error("Failed to load dependencies");
    }
  };

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    loadDependencies();
  }, []);

  const handleOpenModal = (job = null) => {
    if (job) {
      setSelectedJob(job);
      setForm({
        tender_id: job.tender_id || "",
        customer_id: job.customer_id || "",
        name: job.name || "",
        project_value: job.project_value || "",
        description: job.description || "",
        status: job.status || "Pending",
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
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedJob) {
        await updateJob(selectedJob.id, form);
        toast.success("Job updated successfully");
      } else {
        await createJob(form);
        toast.success("Job created successfully");
      }
      setIsModalOpen(false);
      loadJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save job");
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        "Permanently delete this job? This will only work if there are no associated Purchase Orders.",
      )
    ) {
      try {
        await deleteJob(id);
        toast.success("Job deleted");
        loadJobs();
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Jobs & Projects
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage project execution linked to customers and tenders
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            New Job
          </button>
        </div>

        {/* Search */}
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => handleOpenModal(job)}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                        {job.name}
                      </h3>
                      <StatusBadge status={job.status} />
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium truncate">
                        {job.customer?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="truncate">
                        {job.tender?.tender_number}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Value
                      </span>
                      <span className="text-lg font-black text-gray-900 dark:text-white">
                        LKR {Number(job.project_value).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-10 py-8 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                    {selectedJob ? "Edit Project" : "New Project"}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">
                    Link this job to a tender & customer
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 rounded-2xl shadow-sm transition-colors border border-gray-100 dark:border-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-tighter">
                    Job / Project Name
                  </label>
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Fiber Backbone Phase 1"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-tighter">
                      Customer
                    </label>
                    <select
                      required
                      name="customer_id"
                      value={form.customer_id}
                      onChange={(e) =>
                        setForm({ ...form, customer_id: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium appearance-none"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-tighter">
                      Linked Tender
                    </label>
                    <select
                      required
                      name="tender_id"
                      value={form.tender_id}
                      onChange={(e) =>
                        setForm({ ...form, tender_id: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium appearance-none"
                    >
                      <option value="">Select Tender</option>
                      {tenders.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.tender_number} - {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-tighter">
                      Project Value (LKR)
                    </label>
                    <input
                      type="number"
                      name="project_value"
                      value={form.project_value}
                      onChange={(e) =>
                        setForm({ ...form, project_value: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-tighter">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-3xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4.5 bg-primary hover:bg-primary/90 text-white rounded-3xl font-bold shadow-xl shadow-primary/20 transition-all"
                  >
                    Confirm Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
