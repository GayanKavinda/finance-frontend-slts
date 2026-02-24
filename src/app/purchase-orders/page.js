// src/app/purchase-orders/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  fetchJobs,
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
  FileText,
  Target,
  User,
  Download,
} from "lucide-react";
// Removed duplicate Layout wrapper
import StatusBadge from "@/components/ui/StatusBadge";
import axios from "@/lib/axios";

export default function POPage() {
  const [pos, setPos] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [form, setForm] = useState({
    po_number: "",
    job_id: "",
    tender_id: "",
    customer_id: "",
    po_amount: "",
    po_date: "",
    po_description: "",
    billing_address: "",
    status: "Draft",
  });

  const loadPOs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPurchaseOrders({ page, search });
      setPos(data.data || []);
      setMeta(data.meta || {});
    } catch (error) {
      toast.error("Failed to load POs");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const loadDependencies = async () => {
    try {
      const [jRes, cRes, tRes] = await Promise.all([
        fetchJobs({ page: 1 }),
        fetchCustomers({ page: 1 }),
        fetchTenders({ page: 1 }),
      ]);
      setJobs(jRes.data || []);
      setCustomers(cRes.data || []);
      setTenders(tRes.data || []);
    } catch (error) {
      console.error("Failed to load dependencies");
    }
  };

  useEffect(() => {
    loadPOs();
  }, [loadPOs]);

  useEffect(() => {
    loadDependencies();
  }, []);

  const handleOpenModal = (po = null) => {
    if (po) {
      setSelectedPO(po);
      setForm({
        po_number: po.po_number || "",
        job_id: po.job_id || "",
        tender_id: po.tender_id || "",
        customer_id: po.customer_id || "",
        po_amount: po.po_amount || "",
        po_date: po.po_date || "",
        po_description: po.po_description || "",
        billing_address: po.billing_address || "",
        status: po.status || "Draft",
      });
    } else {
      setSelectedPO(null);
      setForm({
        po_number: "",
        job_id: "",
        tender_id: "",
        customer_id: "",
        po_amount: "",
        po_date: "",
        po_description: "",
        billing_address: "",
        status: "Draft",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        po_amount: form.po_amount === "" ? 0 : Number(form.po_amount),
      };

      if (selectedPO) {
        await updatePurchaseOrder(selectedPO.id, payload);
        toast.success("PO updated successfully");
      } else {
        await createPurchaseOrder(payload);
        toast.success("PO created successfully");
      }
      setIsModalOpen(false);
      loadPOs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save PO");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this PO? Only possible if no invoices are linked.")) {
      try {
        await deletePurchaseOrder(id);
        toast.success("PO deleted");
        loadPOs();
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const downloadPO = async (id) => {
    try {
      const res = await axios.get(`/purchase-orders/${id}/download-pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `PO-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("PDF download failed");
    }
  };

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Purchase Orders
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage vendor commitments linked to project jobs
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            Issue PO
          </button>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 font-bold text-[11px] text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">PO Information</th>
                <th className="px-8 py-5">Project Job</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading
                ? [1, 2].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-8 py-10">
                        <div className="h-4 bg-gray-50 dark:bg-gray-900 rounded-full w-full" />
                      </td>
                    </tr>
                  ))
                : pos.map((po) => (
                    <tr
                      key={po.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-black text-gray-900 dark:text-white text-sm uppercase">
                              {po.po_number}
                            </div>
                            <div className="text-xs text-gray-400 font-bold mt-0.5">
                              {po.po_date}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-200">
                            <Target className="w-3.5 h-3.5 text-primary" />
                            {po.job?.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                            <User className="w-3 h-3" />
                            {po.customer?.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-extrabold text-gray-900 dark:text-white">
                          LKR {Number(po.po_amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => downloadPO(po.id)}
                            className="p-2.5 bg-gray-100 hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(po)}
                            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all shadow-sm"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(po.id)}
                            className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="px-10 py-8 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="text-2xl font-black">
                  {selectedPO ? "Edit PO" : "Issue New PO"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 rounded-2xl transition-colors shrink-0 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      PO Number
                    </label>
                    <input
                      required
                      name="po_number"
                      value={form.po_number}
                      onChange={(e) =>
                        setForm({ ...form, po_number: e.target.value })
                      }
                      className="input-modern"
                      placeholder="e.g. PO/001/2026"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      PO Date
                    </label>
                    <input
                      type="date"
                      required
                      name="po_date"
                      value={form.po_date}
                      onChange={(e) =>
                        setForm({ ...form, po_date: e.target.value })
                      }
                      className="input-modern"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      Project Job
                    </label>
                    <select
                      required
                      name="job_id"
                      value={form.job_id}
                      onChange={(e) => {
                        const selectedJob = jobs.find(
                          (j) => j.id === Number(e.target.value),
                        );
                        setForm({
                          ...form,
                          job_id: e.target.value,
                          tender_id: selectedJob?.tender_id || "",
                          customer_id:
                            selectedJob?.customer_id || form.customer_id,
                        });
                      }}
                      className="input-modern appearance-none"
                    >
                      <option value="">Select Job</option>
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      Customer
                    </label>
                    <select
                      required
                      name="customer_id"
                      value={form.customer_id}
                      onChange={(e) =>
                        setForm({ ...form, customer_id: e.target.value })
                      }
                      className="input-modern appearance-none"
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

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      Amount (LKR)
                    </label>
                    <input
                      type="number"
                      required
                      name="po_amount"
                      value={form.po_amount}
                      onChange={(e) =>
                        setForm({ ...form, po_amount: e.target.value })
                      }
                      className="input-modern"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="input-modern"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400 ml-1">
                    Billing Address
                  </label>
                  <textarea
                    rows={2}
                    name="billing_address"
                    value={form.billing_address}
                    onChange={(e) =>
                      setForm({ ...form, billing_address: e.target.value })
                    }
                    className="input-modern resize-none"
                    placeholder="Enter manual billing address if different from default..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-400 ml-1">
                    Description / Terms
                  </label>
                  <textarea
                    rows={3}
                    name="po_description"
                    value={form.po_description}
                    onChange={(e) =>
                      setForm({ ...form, po_description: e.target.value })
                    }
                    className="input-modern resize-none"
                    placeholder="Enter PO details or terms..."
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 bg-gray-100 hover:bg-gray-200 rounded-3xl font-black uppercase text-xs tracking-widest transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-5 bg-primary hover:bg-primary/90 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 transition-all transform active:scale-[0.98]"
                  >
                    Issue Purchase Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        .input-modern {
          width: 100%;
          padding: 1rem 1.25rem;
          background: #f9fafb;
          border-radius: 1.25rem;
          border: 1px solid #f3f4f6;
          outline: none;
          transition: all 0.2s;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .dark .input-modern {
          background: #111827;
          border-color: #1f2937;
          color: white;
        }
        .input-modern:focus {
          background: white;
          border-color: #004a99;
          box-shadow: 0 0 0 4px rgba(0, 74, 153, 0.1);
        }
        .dark .input-modern:focus {
          background: #0f172a;
        }
      `}</style>
    </>
  );
}
