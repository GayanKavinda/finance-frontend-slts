// src/lib/axios.js

import Axios from "axios";

const axios = Axios.create({
  baseURL: "/api", // Proxied via Next.js
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    Accept: "application/json",
  },
});

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    console.log(
      `[Axios] Request: ${config.method.toUpperCase()} ${config.url}`,
      config.data ? { data: config.data } : "",
    );
    return config;
  },
  function (error) {
    console.error("[Axios] Request Error:", error);
    return Promise.reject(error);
  },
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    console.log(
      `[Axios] Response: ${response.status} ${response.config.url}`,
      response.data,
    );
    return response;
  },
  function (error) {
    if (error.response?.status === 401 && error.config?.url === "/user") {
      // expected for unauthenticated users
    } else {
      console.error(
        `[Axios] Response Error: ${error.response?.status || "Network Error"} ${
          error.config?.url
        }`,
        error.response?.data,
      );
    }
    return Promise.reject(error);
  },
);

export default axios;
