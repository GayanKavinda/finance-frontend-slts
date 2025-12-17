// src/lib/axios.js

import Axios from "axios";

const axios = Axios.create({
  baseURL: '', // Proxied via Next.js
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Accept': 'application/json',
  },
});

export default axios;