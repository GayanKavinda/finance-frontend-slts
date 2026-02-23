import axios from "@/lib/axios";

// Contractor CRUD
export const fetchContractors = async () => {
  const res = await axios.get("/contractors");
  return res.data;
};

export const fetchContractor = async (id) => {
  const res = await axios.get(`/contractors/${id}`);
  return res.data;
};

export const createContractor = async (data) => {
  const res = await axios.post("/contractors", data);
  return res.data;
};

export const updateContractor = async (id, data) => {
  const res = await axios.put(`/contractors/${id}`, data);
  return res.data;
};

export const deleteContractor = async (id) => {
  const res = await axios.delete(`/contractors/${id}`);
  return res.data;
};

// Quotations
export const fetchJobQuotations = async (jobId) => {
  const res = await axios.get(`/jobs/${jobId}/quotations`);
  return res.data;
};

export const submitQuotation = async (data) => {
  const res = await axios.post("/quotations", data);
  return res.data;
};

export const selectQuotation = async (id) => {
  const res = await axios.post(`/quotations/${id}/select`);
  return res.data;
};

// Contractor Bills
export const fetchContractorBills = async () => {
  const res = await axios.get("/contractor-bills");
  return res.data;
};

export const createContractorBill = async (data) => {
  const res = await axios.post("/contractor-bills", data);
  return res.data;
};

export const uploadBillDocument = async (billId, formData) => {
  const res = await axios.post(
    `/contractor-bills/${billId}/upload-document`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data;
};

export const deleteBillDocument = async (documentId) => {
  const res = await axios.delete(`/contractor-bills/documents/${documentId}`);
  return res.data;
};

export const verifyContractorBill = async (id) => {
  const res = await axios.post(`/contractor-bills/${id}/verify`);
  return res.data;
};

export const approveContractorBill = async (id) => {
  const res = await axios.post(`/contractor-bills/${id}/approve`);
  return res.data;
};

export const recordContractorPayment = async (id, data) => {
  const res = await axios.post(`/contractor-bills/${id}/pay`, data);
  return res.data;
};
