"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchContractorBills,
  createContractorBill,
  uploadBillDocument,
  deleteBillDocument,
  verifyContractorBill,
  approveContractorBill,
  recordContractorPayment,
  fetchContractors,
} from "@/lib/contractor";
import { fetchJobs } from "@/lib/procurement";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  X,
  Upload,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
  DollarSign,
  Verified,
  CreditCard,
  Building2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ContractorBillsPage() {
  const [bills, setBills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [form, setForm] = useState({
    job_id: "",
    contractor_id: "",
    bill_number: "",
    amount: "",
    bill_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [uploadForm, setUploadForm] = useState({
    file: null,
    document_type: "Contractor Bill",
    description: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    payment_reference: "",
    paid_at: new Date().toISOString().split("T")[0],
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [billRes, jobRes, contractorRes] = await Promise.all([
        fetchContractorBills(),
        fetchJobs({ page: 1 }), // Assuming this returns {data: []}
        fetchContractors(), // Assuming this returns []
      ]);
      setBills(billRes || []);
      setJobs(jobRes.data || []);
      setContractors(contractorRes || []);
    } catch (error) {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: form.amount === "" ? 0 : Number(form.amount),
      };
      await createContractorBill(payload);
      toast.success("Bill registered successfully");
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create bill");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error("Please select a file");

    const formData = new FormData();
    formData.append("file", uploadForm.file);
    formData.append("document_type", uploadForm.document_type);
    formData.append("description", uploadForm.description);

    try {
      await uploadBillDocument(selectedBill.id, formData);
      toast.success("Document uploaded successfully");
      setIsUploadModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (confirm("Delete this document?")) {
      try {
        await deleteBillDocument(docId);
        toast.success("Document deleted");
        loadData();
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyContractorBill(id);
      toast.success("Bill verified successfully");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveContractorBill(id);
      toast.success("Bill approved for payment");
      loadData();
    } catch (error) {
      toast.error("Approval failed");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await recordContractorPayment(selectedBill.id, paymentForm);
      toast.success("Payment recorded successfully");
      setIsPaymentModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Payment recording failed");
    }
  };

  const filteredBills = bills.filter(
    (b) =>
      b.bill_number.toLowerCase().includes(search.toLowerCase()) ||
      b.contractor.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Contractor Bills
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Manage vendor invoices and multi-document attachments
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Register New Bill
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by bill number or contractor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-medium"
          />
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button className="px-4 py-2 bg-white dark:bg-gray-700 rounded-lg text-sm font-bold shadow-sm">
            All Bills
          </button>
          <button className="px-4 py-2 text-gray-500 text-sm font-bold hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all">
            Pending
          </button>
          <button className="px-4 py-2 text-gray-500 text-sm font-bold hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-all">
            Paid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-100 dark:bg-gray-800 rounded-3xl"
              />
            ))}
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-black">No bills found</p>
          </div>
        ) : (
          filteredBills.map((bill) => (
            <Card
              key={bill.id}
              className="rounded-[2.5rem] p-8 hover:shadow-2xl transition-all duration-500 group border-none shadow-xl shadow-gray-100 dark:shadow-none bg-white dark:bg-gray-800 overflow-hidden relative"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">
                          #{bill.bill_number}
                        </h3>
                        <p className="font-bold text-gray-500">
                          {bill.contractor.name}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={bill.status} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Job / Project
                      </p>
                      <p className="font-bold text-sm truncate">
                        {bill.job.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Amount
                      </p>
                      <p className="font-black text-sm">
                        LKR {Number(bill.amount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Date
                      </p>
                      <p className="font-bold text-sm">
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {bill.documents?.map((doc) => (
                        <a
                          key={doc.id}
                          href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${doc.file_path}`}
                          target="_blank"
                          className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:text-primary transition-colors"
                          title={doc.document_type}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ))}
                      {bill.status === "Draft" && (
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setIsUploadModalOpen(true);
                          }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:w-64 flex flex-col justify-center gap-3">
                  {bill.status === "Draft" && (
                    <button
                      onClick={() => handleVerify(bill.id)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black transition-all"
                    >
                      <Verified className="w-4 h-4" /> Verify (Proc.)
                    </button>
                  )}
                  {bill.status === "Verified" && (
                    <button
                      onClick={() => handleApprove(bill.id)}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-black transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve (Fin.)
                    </button>
                  )}
                  {bill.status === "Approved" && (
                    <button
                      onClick={() => {
                        setSelectedBill(bill);
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-2xl font-black transition-all"
                    >
                      <CreditCard className="w-4 h-4" /> Record Payment
                    </button>
                  )}
                  {bill.status === "Paid" && (
                    <div className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Payment Ref
                      </p>
                      <p className="font-bold text-xs truncate">
                        {bill.payment_reference}
                      </p>
                      <p className="text-[10px] font-medium text-gray-500 mt-1">
                        Paid on {new Date(bill.paid_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* MODALS */}
      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-black">Register Contractor Bill</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-gray-400">
                    Job
                  </label>
                  <select
                    required
                    value={form.job_id}
                    onChange={(e) =>
                      setForm({ ...form, job_id: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold"
                  >
                    <option value="">Select Job</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-gray-400">
                    Contractor
                  </label>
                  <select
                    required
                    value={form.contractor_id}
                    onChange={(e) =>
                      setForm({ ...form, contractor_id: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold"
                  >
                    <option value="">Select Contractor</option>
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-400">
                  Bill Number
                </label>
                <input
                  required
                  value={form.bill_number}
                  onChange={(e) =>
                    setForm({ ...form, bill_number: e.target.value })
                  }
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-gray-400">
                    Amount (LKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-gray-400">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.bill_date}
                    onChange={(e) =>
                      setForm({ ...form, bill_date: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20"
              >
                Create Bill Draft
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">Upload Document</h2>
              <button onClick={() => setIsUploadModalOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900/50">
              <Upload className="w-12 h-12 text-primary/40" />
              <input
                type="file"
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, file: e.target.files[0] })
                }
                className="text-sm font-medium"
              />
            </div>
            <select
              value={uploadForm.document_type}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, document_type: e.target.value })
              }
              className="w-full px-5 py-3.5 bg-gray-100 dark:bg-gray-900 rounded-2xl border-none font-bold"
            >
              <option>Contractor Bill</option>
              <option>Completion Certificate</option>
              <option>Site Photo</option>
              <option>Other Attachment</option>
            </select>
            <button
              onClick={handleUpload}
              className="w-full py-4.5 bg-primary text-white rounded-2xl font-black"
            >
              Confirm Upload
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">Record Payment</h2>
              <button onClick={() => setIsPaymentModalOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-sm font-bold text-primary">
                Paying #{selectedBill?.bill_number}
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                LKR {Number(selectedBill?.amount).toLocaleString()}
              </p>
            </div>
            <form onSubmit={handlePayment} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                  Payment Reference (e.g. Chq No)
                </label>
                <input
                  required
                  value={paymentForm.payment_reference}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      payment_reference: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-black"
                  placeholder="C123..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={paymentForm.paid_at}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, paid_at: e.target.value })
                  }
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4.5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20"
              >
                Mark as Paid
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
