"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { exportToCSV } from "@/lib/exportUtils";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import ContractorBillCard from "./components/ContractorBillCard";
import RegisterBillModal from "./components/RegisterBillModal";
import UploadDocumentModal from "./components/UploadDocumentModal";
import RecordPaymentModal from "./components/RecordPaymentModal";
import RejectBillModal from "./components/RejectBillModal";

export default function ContractorBillsPage() {
  const { user } = useAuth();
  const permissions = user?.permissions || [];
  const router = useRouter();
  const searchTimerRef = useRef(null);

  const canVerify = usePermission(["verify-contractor-bill", "submit-contractor-bill"]);
  const canSubmitToFinance = usePermission("submit-contractor-bill");
  const canApprove = usePermission(["approve-contractor-payment", "approve-payment"]);
  const canRecordPayment = usePermission(["mark-contractor-paid", "record-payment"]);

  const [bills, setBills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("search") || "";
      setSearch(q);
      setSearchInput(q);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const qs = params.toString();
    const targetUrl = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    if (window.location.href !== targetUrl) {
      router.replace(targetUrl, { scroll: false });
    }
  }, [search, router]);

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
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                exportToCSV(bills, "contractor_bills_export", [
                  { key: "bill_number", label: "Bill #" },
                  { key: "contractor.name", label: "Contractor" },
                  { key: "job.name", label: "Job" },
                  { key: "amount", label: "Amount" },
                  { key: "bill_date", label: "Bill Date" },
                  { key: "status", label: "Status" },
                ])
              }
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all shadow-md"
            >
              <Download className="w-4 h-4 text-rose-300" />
              Export CSV
            </button>
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
          value={searchInput}
          onChange={(e) => {
            const val = e.target.value;
            setSearchInput(val);
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
            searchTimerRef.current = setTimeout(() => {
              setSearch(val);
            }, 300);
          }}
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
            <ContractorBillCard
              key={bill.id}
              bill={bill}
              canVerify={canVerify}
              canSubmitToFinance={canSubmitToFinance}
              canApprove={canApprove}
              canRecordPayment={canRecordPayment}
              onOpenUpload={(selected) => {
                setSelectedBill(selected);
                setIsUploadModalOpen(true);
              }}
              onVerify={handleVerify}
              onSubmitToFinance={handleSubmitToFinance}
              onApprove={handleApprove}
              onOpenReject={(selected) => {
                setSelectedBill(selected);
                setIsRejectModalOpen(true);
              }}
              onOpenPayment={(selected) => {
                setSelectedBill(selected);
                setPaymentForm({
                  ...paymentForm,
                  payment_amount: selected.amount,
                });
                setIsPaymentModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <RegisterBillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        jobs={jobs}
        contractors={contractors}
      />

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        uploadForm={uploadForm}
        setUploadForm={setUploadForm}
        handleUpload={handleUpload}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedBill={selectedBill}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        handlePayment={handlePayment}
      />

      <RejectBillModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        handleReject={handleReject}
      />
    </div>
  );
}

