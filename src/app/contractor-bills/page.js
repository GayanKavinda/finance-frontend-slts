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
import { Card } from "@/components/ui/Card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    retention_amount: "",
    milestone_name: "Progress Milestone",
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

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const [billRes, jobRes, contractorRes] = await Promise.all([
          fetchContractorBills(),
          fetchJobs({ page: 1 }),
          fetchContractors(),
        ]);
        if (!cancelled) {
          setBills(billRes || []);
          setJobs(jobRes.data || []);
          setContractors(contractorRes || []);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load bills");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const reloadData = useCallback(async () => {
    setLoading(true);
    try {
      const [billRes, jobRes, contractorRes] = await Promise.all([
        fetchContractorBills(),
        fetchJobs({ page: 1 }),
        fetchContractors(),
      ]);
      setBills(billRes || []);
      setJobs(jobRes.data || []);
      setContractors(contractorRes || []);
    } catch {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  }, []);

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
      reloadData();
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
      reloadData();
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (confirm("Delete this document?")) {
      try {
        await deleteBillDocument(docId);
        toast.success("Document deleted");
        reloadData();
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyContractorBill(id);
      toast.success("Bill verified successfully");
      reloadData();
    } catch {
      toast.error("Verification failed");
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveContractorBill(id);
      toast.success("Bill approved for payment");
      reloadData();
    } catch {
      toast.error("Approval failed");
    }
  };

  const handleSubmitToFinance = async (id) => {
    try {
      await submitContractorBill(id);
      toast.success("Bill submitted to finance");
      reloadData();
    } catch {
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
      reloadData();
    } catch {
      toast.error("Rejection failed");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await recordContractorPayment(selectedBill.id, paymentForm);
      toast.success("Payment recorded successfully");
      setIsPaymentModalOpen(false);
      reloadData();
    } catch {
      toast.error("Payment recording failed");
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
    <div className="min-h-full p-4 sm:p-6 space-y-4">
      {/* Zen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Contractor Bills
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Progress payment ledger, contractor claims verification, and disbursement approval.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
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
            className="h-8 text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Bill
          </Button>
        </div>
      </div>

      {/* Compact Search */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by bill # or contractor…"
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchInput(val);
              if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
              searchTimerRef.current = setTimeout(() => {
                setSearch(val);
              }, 300);
            }}
            className="h-8 w-full pl-8 pr-3 bg-card border border-border rounded-md text-xs font-medium text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          <span>{bills.length} total</span>
          <span className="mx-1.5">·</span>
          <span>{draftCount} draft</span>
          <span className="mx-1.5">·</span>
          <span className="text-foreground font-medium">{paidCount} paid</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-16 bg-muted rounded" />
            </Card>
          ))
        ) : filteredBills.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 rounded-lg bg-muted p-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No bills found
              </p>
            </div>
          </Card>
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
