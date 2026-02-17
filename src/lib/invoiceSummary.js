import axios from "@/lib/axios";

export const fetchInvoiceSummary = async () => {
  const res = await axios.get("/invoice-summary");
  return res.data;
};

// ✅ Fixed: removed /api prefix — baseURL in axios.js already includes /api
export const fetchRecentInvoices = async (limit = 5) => {
  const res = await axios.get(`/invoices?page=1&limit=${limit}`);
  return res.data;
};

export const fetchStatusBreakdown = async () => {
  const res = await axios.get("/invoices/status-breakdown");
  return res.data;
};
