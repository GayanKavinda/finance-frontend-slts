// src/lib/procurement.js

import axios from "@/lib/axios";

// Customers
export const fetchCustomers = async ({ page = 1, search = "" } = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  if (search) params.append("search", search);
  const res = await axios.get(`/customers?${params.toString()}`);
  return res.data;
};

export const createCustomer = async (data) => {
  const res = await axios.post("/customers", data);
  return res.data;
};

export const updateCustomer = async (id, data) => {
  const res = await axios.put(`/customers/${id}`, data);
  return res.data;
};

export const deleteCustomer = async (id) => {
  const res = await axios.delete(`/customers/${id}`);
  return res.data;
};

// Tenders
export const fetchTenders = async ({
  page = 1,
  status = "",
  search = "",
} = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  if (status) params.append("status", status);
  if (search) params.append("search", search);
  const res = await axios.get(`/tenders?${params.toString()}`);
  return res.data;
};

export const createTender = async (data) => {
  const res = await axios.post("/tenders", data);
  return res.data;
};

export const updateTender = async (id, data) => {
  const res = await axios.put(`/tenders/${id}`, data);
  return res.data;
};

export const deleteTender = async (id) => {
  const res = await axios.delete(`/tenders/${id}`);
  return res.data;
};

// Jobs
export const fetchJobs = async ({
  page = 1,
  customer_id = "",
  search = "",
} = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  if (customer_id) params.append("customer_id", customer_id);
  if (search) params.append("search", search);
  const res = await axios.get(`/jobs?${params.toString()}`);
  return res.data;
};

export const createJob = async (data) => {
  const res = await axios.post("/jobs", data);
  return res.data;
};

export const updateJob = async (id, data) => {
  const res = await axios.put(`/jobs/${id}`, data);
  return res.data;
};

export const deleteJob = async (id) => {
  const res = await axios.delete(`/jobs/${id}`);
  return res.data;
};

// Purchase Orders
export const fetchPurchaseOrders = async ({
  page = 1,
  job_id = "",
  search = "",  
} = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  if (job_id) params.append("job_id", job_id);
  if (search) params.append("search", search);
  const res = await axios.get(`/purchase-orders?${params.toString()}`);
  return res.data;
};

export const createPurchaseOrder = async (data) => {
  const res = await axios.post("/purchase-orders", data);
  return res.data;
};

export const updatePurchaseOrder = async (id, data) => {
  const res = await axios.put(`/purchase-orders/${id}`, data);
  return res.data;
};

export const deletePurchaseOrder = async (id) => {
  const res = await axios.delete(`/purchase-orders/${id}`);
  return res.data;
};
