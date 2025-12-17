// src/lib/auth.js

import axios from './axios';

export const fetchCsrf = async () => {
  await axios.get('/sanctum/csrf-cookie');
};