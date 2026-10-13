import Axios from "axios";
import { isDebugEnabled } from "@/lib/preferences";

/**
 * Service Gateway Configuration
 * In a full microservices architecture, these would point to different hosts.
 * Example: PROCUREMENT: "https://procurement.api.finance.com"
 */
const SERVICE_URLS = {
  DEFAULT: "/api",
  BILLING: "/api", 
  PROCUREMENT: "/api",
  AUTH: "/api",
};

const axios = Axios.create({
  baseURL: SERVICE_URLS.DEFAULT,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    Accept: "application/json",
  },
});

// Helper to switch service URLs dynamically if needed
export const setServiceUrl = (service, url) => {
  if (SERVICE_URLS[service]) {
    SERVICE_URLS[service] = url;
  }
};

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    if (isDebugEnabled()) {
      config.metadata = { startTime: Date.now() };
      console.log(
        `[Axios] Request: ${config.method.toUpperCase()} ${config.url}`,
        config.data ? { data: config.data } : "",
      );
    }
    return config;
  },
  function (error) {
    if (isDebugEnabled()) {
      console.error("[Axios] Request Error:", error);
    }
    return Promise.reject(error);
  },
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    if (isDebugEnabled()) {
      const duration = response.config.metadata?.startTime
        ? Date.now() - response.config.metadata.startTime
        : null;
      console.log(
        `[Axios] Response: ${response.status} ${response.config.url}` +
          (duration !== null ? ` (${duration}ms)` : ""),
        response.data,
      );
    }
    return response;
  },
  function (error) {
    if (error.response?.status === 401 && error.config?.url === "/user") {
      // expected for unauthenticated users
    } else if (isDebugEnabled()) {
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
