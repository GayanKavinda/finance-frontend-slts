//src/lib/invoice.js

import axios from "@/lib/axios";

export const downloadInvoicePdf = async (invoiceId) => {
  const response = await axios.get(`/api/invoices/${invoiceId}/pdf`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Invoice-${invoiceId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
