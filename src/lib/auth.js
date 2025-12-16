import axios from "axios";

// Fetch CSRF cookie (call before register/login)
export const fetchCsrf = async () => {
    await axios.get('/api/sanctum/csrf-cookie');
};

// Check if user is authenticated (call on app load or protected pages)
export const getIser = async () => {
    try {
    const response = await axios.get('/api/user');
    return response.data;
  } catch (error) {
    return null; // Unauthenticated
  }
}

// Logout
export const logout = async () => {
  await axios.post('/api/logout');
};

