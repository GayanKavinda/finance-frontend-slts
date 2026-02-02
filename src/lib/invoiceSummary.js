import axios from "@/lib/axios";

export const fetchInvoiceSummary = async () => {
  const res = await axios.get("/api/invoice-summary");
  return res.data;
};

export const fetchRecentInvoices = async (limit = 5) => {
  const res = await axios.get(`/api/invoices?page=1&limit=${limit}`);
  return res.data;
};

// export const getInvoiceSummary = async () => {
//   const response = await axios.get("/api/invoice-summary");
//   return response.data;
// };
