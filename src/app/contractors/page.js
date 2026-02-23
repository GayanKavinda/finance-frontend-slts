"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchContractors,
  createContractor,
  updateContractor,
  deleteContractor,
} from "@/lib/contractor";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  Building2,
  Star,
  Banknote,
  MoreVertical,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function ContractorsPage() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    bank_name: "",
    bank_account_number: "",
    tax_id: "",
    status: "Active",
    rating: 0,
    notes: "",
  });

  const loadContractors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchContractors();
      setContractors(data || []);
    } catch (error) {
      toast.error("Failed to load contractors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContractors();
  }, [loadContractors]);

  const handleOpenModal = (contractor = null) => {
    if (contractor) {
      setSelectedContractor(contractor);
      setForm({
        name: contractor.name || "",
        contact_person: contractor.contact_person || "",
        email: contractor.email || "",
        phone: contractor.phone || "",
        address: contractor.address || "",
        bank_name: contractor.bank_name || "",
        bank_account_number: contractor.bank_account_number || "",
        tax_id: contractor.tax_id || "",
        status: contractor.status || "Active",
        rating: contractor.rating || 0,
        notes: contractor.notes || "",
      });
    } else {
      setSelectedContractor(null);
      setForm({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        bank_name: "",
        bank_account_number: "",
        tax_id: "",
        status: "Active",
        rating: 0,
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedContractor) {
        await updateContractor(selectedContractor.id, form);
        toast.success("Contractor updated successfully");
      } else {
        await createContractor(form);
        toast.success("Contractor added successfully");
      }
      setIsModalOpen(false);
      loadContractors();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save contractor");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this contractor?")) {
      try {
        await deleteContractor(id);
        toast.success("Contractor deleted successfully");
        loadContractors();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete contractor",
        );
      }
    }
  };

  const filteredContractors = contractors.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Contractor Registry
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Maintain master data for all external service providers
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Add Contractor
        </button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by name, email, or contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
        />
      </div>

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
          {filteredContractors.map((contractor) => (
            <Card
              key={contractor.id}
              className="hover:shadow-xl transition-all duration-300 border-gray-100 dark:border-gray-700 group overflow-hidden rounded-3xl"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${contractor.status === "Blacklisted" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(contractor)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(contractor.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-gray-900 dark:text-white truncate max-w-[180px]">
                      {contractor.name}
                    </h3>
                    {contractor.status === "Blacklisted" && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full">
                        Blacklisted
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm font-medium flex items-center gap-1.5 mt-1">
                    {contractor.contact_person || "No contact person"}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < (contractor.rating || 0) ? "fill-current" : "text-gray-200 dark:text-gray-700"}`}
                    />
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {contractor.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{contractor.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Banknote className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {contractor.bank_name || "Bank not set"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 shrink-0">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {selectedContractor ? "Edit Contractor" : "Add New Contractor"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-8 space-y-6 overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Company Name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Contact Person
                  </label>
                  <input
                    value={form.contact_person}
                    onChange={(e) =>
                      setForm({ ...form, contact_person: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Phone Number
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Tax / VAT Number
                  </label>
                  <input
                    value={form.tax_id}
                    onChange={(e) =>
                      setForm({ ...form, tax_id: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      Bank Name
                    </label>
                    <input
                      value={form.bank_name}
                      onChange={(e) =>
                        setForm({ ...form, bank_name: e.target.value })
                      }
                      className="w-full px-5 py-3.5 bg-white dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      Account Number
                    </label>
                    <input
                      value={form.bank_account_number}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          bank_account_number: e.target.value,
                        })
                      }
                      className="w-full px-5 py-3.5 bg-white dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Performance Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        className={`p-2 rounded-xl transition-all ${form.rating >= star ? "bg-amber-100 text-amber-500" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}
                      >
                        <Star
                          className={`w-6 h-6 ${form.rating >= star ? "fill-current" : ""}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Address
                  </label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none resize-none px-4"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-2xl font-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-lg shadow-primary/20 transition-all"
                >
                  Save Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
