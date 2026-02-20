// src/app/tenders/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchTenders,
  createTender,
  updateTender,
  deleteTender,
  fetchCustomers,
} from "@/lib/procurement";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Briefcase,
  Calendar,
  DollarSign,
  Filter,
} from "lucide-react";
// Removed duplicate Layout wrapper
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [form, setForm] = useState({
    tender_number: "",
    customer_id: "",
    name: "",
    description: "",
    awarded_amount: "",
    budget: "",
    start_date: "",
    end_date: "",
    status: "Open",
  });

  const loadTenders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTenders({ page, status, search });
      setTenders(data.data || []);
      setMeta(data.meta || {});
    } catch (error) {
      toast.error("Failed to load tenders");
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  const loadCustomersData = async () => {
    try {
      const res = await fetchCustomers({ page: 1 }); // Just get some for dropdown
      setCustomers(res.data || []);
    } catch (error) {
      console.error("Failed to load customers for dropdown");
    }
  };

  useEffect(() => {
    loadTenders();
  }, [loadTenders]);

  useEffect(() => {
    loadCustomersData();
  }, []);

  const handleOpenModal = (tender = null) => {
    if (tender) {
      setSelectedTender(tender);
      setForm({
        tender_number: tender.tender_number || "",
        customer_id: tender.customer_id || "",
        name: tender.name || "",
        description: tender.description || "",
        awarded_amount: tender.awarded_amount || "",
        budget: tender.budget || "",
        start_date: tender.start_date || "",
        end_date: tender.end_date || "",
        status: tender.status || "Open",
      });
    } else {
      setSelectedTender(null);
      setForm({
        tender_number: "",
        customer_id: "",
        name: "",
        description: "",
        awarded_amount: "",
        budget: "",
        start_date: "",
        end_date: "",
        status: "Open",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTender) {
        await updateTender(selectedTender.id, form);
        toast.success("Tender updated successfully");
      } else {
        await createTender(form);
        toast.success("Tender created successfully");
      }
      setIsModalOpen(false);
      loadTenders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save tender");
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        "Are you sure? This will delete the tender if no jobs are attached.",
      )
    ) {
      try {
        await deleteTender(id);
        toast.success("Tender deleted successfully");
        loadTenders();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete tender");
      }
    }
  };

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tenders Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Track bids, budgets, and awarded contracts
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            Add Tender
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search tender number or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-sm font-medium outline-none text-gray-700 dark:text-gray-300"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tender Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Budget / Awarded
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-8">
                      <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded-full w-full" />
                    </td>
                  </tr>
                ))
              ) : tenders.length > 0 ? (
                tenders.map((tender) => (
                  <tr
                    key={tender.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-tight">
                            {tender.tender_number}
                          </div>
                          <div className="text-gray-500 text-sm font-medium">
                            {tender.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-900 dark:text-gray-300 font-medium">
                        {tender.customer?.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                        {tender.customer?.contact_person}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-green-500" />
                          {Number(
                            tender.budget || tender.awarded_amount,
                          ).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">
                          Budgeted
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={tender.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(tender)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tender.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No tenders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="text-xl font-bold">
                  {selectedTender ? "Edit Tender" : "Create Tender"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tender Number
                    </label>
                    <input
                      required
                      name="tender_number"
                      value={form.tender_number}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          tender_number: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="e.g. SLT/2026/001"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Customer
                    </label>
                    <select
                      required
                      name="customer_id"
                      value={form.customer_id}
                      onChange={(e) =>
                        setForm({ ...form, customer_id: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tender Name
                  </label>
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Brief title of the tender"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    name="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Estimated Budget
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                        LKR
                      </span>
                      <input
                        type="number"
                        name="budget"
                        value={form.budget}
                        onChange={(e) =>
                          setForm({ ...form, budget: e.target.value })
                        }
                        className="w-full pl-14 pr-4 py-3 bg-gray-100 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Start Date
                    </label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm({ ...form, start_date: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> End Date
                    </label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) =>
                        setForm({ ...form, end_date: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-2xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all"
                  >
                    Save Tender
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
