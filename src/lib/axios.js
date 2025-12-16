import Axios from "axios";

const axios = Axios.create({
  baseURL: '/', // Uses proxy in dev, same domain in prod
  withCredentials: true, // Crucial: Sends/receives cookies
  withXSRFToken: true,   // Auto-adds X-XSRF-TOKEN header from cookie
});

export default axios;