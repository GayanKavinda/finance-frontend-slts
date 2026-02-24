// src/app/customers/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/lib/procurement";
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
  User as UserIcon,
} from "lucide-react";
// import Layout from "@/components/Layout"; // Removed duplicate layout
import { Card } from "@/components/ui/Card";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    billing_address: "",
    tax_number: "",
    contact_person: "",
  });

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers({ page, search });
      setCustomers(data.data || []);
      setMeta(data.meta || {});
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setSelectedCustomer(customer);
      setForm({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        billing_address: customer.billing_address || "",
        tax_number: customer.tax_number || "",
        contact_person: customer.contact_person || "",
      });
    } else {
      setSelectedCustomer(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        billing_address: "",
        tax_number: "",
        contact_person: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, form);
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(form);
        toast.success("Customer created successfully");
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save customer");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(id);
        toast.success("Customer deleted successfully");
        loadCustomers();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete customer",
        );
      }
    }
  };

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:white">
              Customers Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage your client registry and billing details
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, or contact..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
          />
        </div>

        {/* Customers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <Card
                key={customer.id}
                className="hover:shadow-xl transition-all duration-300 border-gray-100 dark:border-gray-700 group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenModal(customer)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                      {customer.name}
                    </h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
                      <UserIcon className="w-3.5 h-3.5" />{" "}
                      {customer.contact_person || "No contact person"}
                    </p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                      <span className="truncate">
                        {customer.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{customer.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">
                        {customer.billing_address}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination placeholder */}
        {meta.last_page > 1 && (
          <div className="flex justify-center gap-2 pt-6">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${page === p ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                >
                  {p}
                </button>
              ),
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-8 py-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold">
                  {selectedCustomer ? "Edit Customer" : "Add New Customer"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Customer Name
                  </label>
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="email@company.com"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+94 ..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Contact Person
                  </label>
                  <input
                    name="contact_person"
                    value={form.contact_person}
                    onChange={(e) =>
                      setForm({ ...form, contact_person: e.target.value })
                    }
                    placeholder="Full name"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Billing Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    name="billing_address"
                    value={form.billing_address}
                    onChange={(e) =>
                      setForm({ ...form, billing_address: e.target.value })
                    }
                    placeholder="Full postal address"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tax / VAT Number
                  </label>
                  <input
                    name="tax_number"
                    value={form.tax_number}
                    onChange={(e) =>
                      setForm({ ...form, tax_number: e.target.value })
                    }
                    placeholder="e.g. VAT123456789"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-2xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-3 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all"
                  >
                    Save Customer
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
