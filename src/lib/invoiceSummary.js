import axios from "axios";

export const fetchInvoiceSummary = async () => {
  const res = await axios.get("/api/invoice-summary");
  return res.data;
};
