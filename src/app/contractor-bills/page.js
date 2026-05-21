"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchContractorBills,
  createContractorBill,
  uploadBillDocument,
  deleteBillDocument,
  verifyContractorBill,
  submitContractorBill,
  approveContractorBill,
  rejectContractorBill,
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
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";

export default function ContractorBillsPage() {
  const { user } = useAuth();
  const permissions = user?.permissions || [];

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
    bank_name: "",
    payment_amount: "",
    paid_at: new Date().toISOString().split("T")[0],
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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

  const handleSubmitToFinance = async (id) => {
    try {
      await submitContractorBill(id);
      toast.success("Bill submitted to finance");
      loadData();
    } catch (error) {
      toast.error("Submission failed");
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return toast.error("Please provide a reason");
    try {
      await rejectContractorBill(selectedBill.id, rejectionReason);
      toast.success("Bill rejected");
      setIsRejectModalOpen(false);
      setRejectionReason("");
      loadData();
    } catch (error) {
      toast.error("Rejection failed");
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
      toast.error(error.response?.data?.message || "Payment recording failed");
    }
  };

  const filteredBills = bills.filter(
    (b) =>
      b.bill_number.toLowerCase().includes(search.toLowerCase()) ||
      b.contractor.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalAmt = bills.reduce((s, b) => s + Number(b.amount || 0), 0);
  const draftCount = bills.filter((b) => b.status === "Draft").length;
  const paidCount = bills.filter((b) => b.status === "Paid").length;

  return (
    <div className="min-h-full p-6 space-y-6">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-rose-900 via-pink-900 to-slate-900 rounded-3xl p-8 overflow-hidden">
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
            <p className="text-rose-300 text-xs font-bold uppercase tracking-widest mb-1">
              Vendor Payments
            </p>
            <h1
              className="text-3xl font-black text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Contractor Bills
            </h1>
            <p className="text-rose-200/60 text-sm mt-1">
              {bills.length} bill{bills.length !== 1 ? "s" : ""} registered
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-rose-50 text-slate-900 px-5 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <Plus className="w-4 h-4" />
            Register Bill
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: FileText,
            label: "Total",
            value: bills.length,
            color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600",
          },
          {
            icon: Clock,
            label: "Draft",
            value: draftCount,
            color: "bg-gray-100 dark:bg-gray-700 text-gray-500",
          },
          {
            icon: CheckCircle2,
            label: "Paid",
            value: paidCount,
            color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
          },
          {
            icon: DollarSign,
            label: "Total Value",
            value: totalAmt > 0 ? `LKR ${(totalAmt / 1e6).toFixed(1)}M` : "—",
            color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
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
              className="text-xl font-bold text-gray-900 dark:text-white"
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
          placeholder="Search by bill number or contractor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-sm"
        />
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
                        <p className="font-bold text-gray-500 dark:text-gray-400">
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
                      <p className="font-bold text-sm truncate text-gray-800 dark:text-gray-200">
                        {bill.job.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Amount
                      </p>
                      <p className="font-black text-sm text-gray-800 dark:text-gray-100">
                        LKR {Number(bill.amount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Date
                      </p>
                      <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {bill.documents?.map((doc) => (
                        <a
                          key={doc.id}
                          href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${doc.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold"
                          title={doc.document_type}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">DL</span>
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

                <div className="lg:w-72 flex flex-col justify-center gap-3">
                  {bill.status === "Draft" &&
                    permissions.includes("enter-quotations") && (
                      <button
                        onClick={() => handleVerify(bill.id)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-black transition-all"
                      >
                        <Verified className="w-4 h-4" /> Verify (Proc.)
                      </button>
                    )}
                  {bill.status === "Verified" &&
                    permissions.includes("submit-contractor-bill") && (
                      <button
                        onClick={() => handleSubmitToFinance(bill.id)}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-2xl font-black transition-all"
                      >
                        <Plus className="w-4 h-4" /> Submit to Finance
                      </button>
                    )}
                  {bill.status === "Verified" &&
                    permissions.includes("enter-quotations") && (
                      <button
                        className="w-full py-2 text-xs text-gray-400 font-bold hover:text-gray-600 underline"
                        onClick={() => {
                          setSelectedBill(bill);
                          setIsUploadModalOpen(true);
                        }}
                      >
                        Edit Attachments
                      </button>
                    )}
                  {bill.status === "Submitted" &&
                    permissions.includes("approve-payment") && (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleApprove(bill.id)}
                          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-black transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve (Fin.)
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setIsRejectModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-2xl font-bold transition-all"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  {bill.status === "Approved" &&
                    permissions.includes("mark-contractor-paid") && (
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setPaymentForm({
                              ...paymentForm,
                              payment_amount: bill.amount,
                            });
                            setIsPaymentModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-2xl font-black transition-all"
                        >
                          <CreditCard className="w-4 h-4" /> Record Payment
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setIsRejectModalOpen(true);
                          }}
                          className="w-full text-xs text-red-400 font-bold hover:text-red-500 underline"
                        >
                          Reject Approved Bill
                        </button>
                      </div>
                    )}
                  {bill.status === "Rejected" && (
                    <div className="w-full p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
                        Rejection Reason
                      </p>
                      <p className="text-xs font-bold text-red-700 italic">
                        &quot;{bill.rejection_reason}&quot;
                      </p>
                      <button
                        onClick={() => handleVerify(bill.id)}
                        className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold text-xs transition-all"
                      >
                        Re-Verify
                      </button>
                    </div>
                  )}
                  {bill.status === "Paid" && (
                    <div className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Ref
                          </p>
                          <p className="font-bold text-xs truncate text-gray-800 dark:text-gray-200">
                            {bill.payment_reference}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Bank
                          </p>
                          <p className="font-bold text-xs truncate text-gray-800 dark:text-gray-200">
                            {bill.bank_name}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-2">
                        Paid LKR {Number(bill.payment_amount).toLocaleString()}{" "}
                        on {new Date(bill.paid_at).toLocaleDateString()}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                    Reference
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
                    placeholder="Chq No..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                    Bank Name
                  </label>
                  <input
                    required
                    value={paymentForm.bank_name}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        bank_name: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-black"
                    placeholder="e.g. BOC, Sampath"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                    Amount Paid
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentForm.payment_amount}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        payment_amount: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.paid_at}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        paid_at: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-bold"
                  />
                </div>
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
      {/* Rejection Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-red-600">Reject Bill</h2>
              <button onClick={() => setIsRejectModalOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleReject} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest">
                  Reason for Rejection
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none font-bold resize-none"
                  placeholder="Explain why this bill is being rejected..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-4.5 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200"
              >
                Confirm Rejection
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
