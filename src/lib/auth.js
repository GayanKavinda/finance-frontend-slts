// src/lib/auth.js

import axios from "axios";

// Use direct Laravel URL to ensure cookies are set correctly
const LARAVEL_URL = 'http://127.0.0.1:8000';

// Fetch CSRF cookie (call before register/login)
export const fetchCsrf = async () => {
  await axios.get(`${LARAVEL_URL}/sanctum/csrf-cookie`);
};

// Check if user is authenticated (call on app load or protected pages)
export const getIser = async () => {
    try {
    const response = await axios.get(`${LARAVEL_URL}/api/user`);
    return response.data;
  } catch (error) {
    return null; // Unauthenticated
  }
}

// Logout
export const logout = async () => {
  await axios.post(LARAVEL_URL + '/api/logout');
};

