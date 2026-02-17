//src/lib/invoice.js

import axios from "@/lib/axios";

export const downloadInvoicePdf = async (invoiceId) => {
  try {
    const response = await axios.get(`/invoices/${invoiceId}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Invoice-${invoiceId}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF download failed:", error);
    throw error;
  }
};

export const fetchMonthlyInvoiceTrend = async () => {
  const res = await axios.get("/invoices/monthly-trend");
  return res.data;
};

export const fetchInvoiceSubmit = async (invoiceId) => {
  const res = await axios.post(`/invoices/${invoiceId}/submit-to-finance`);
  return res.data;
};

export const approveInvoice = async (invoiceId) => {
  const res = await axios.post(`/invoices/${invoiceId}/approve`);
  return res.data;
};

export const fetchInvoices = async ({ page = 1, status = "", search = "" }) => {
  const params = new URLSearchParams();
  params.append("page", page);
  if (status) params.append("status", status);
  if (search) params.append("search", search);

  const res = await axios.get(`/invoices?${params.toString()}`);
  return res.data;
};

export const getInvoiceById = async (id) => {
  const { data } = await axios.get(`/invoices/${id}`);
  return data;
};
