import axios from 'axios';

let apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

// Normalize URL: ensure leading http/https URLs always point to /api cleanly
if (typeof apiBaseUrl === 'string' && apiBaseUrl.startsWith('http')) {
  apiBaseUrl = apiBaseUrl.replace(/\/+$/, ''); // remove trailing slash
  if (!apiBaseUrl.endsWith('/api')) {
    apiBaseUrl = `${apiBaseUrl}/api`;
  }
}

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Provide a clearer message if it's a network error (e.g. backend sleeping or unreachable)
    if (error.message === 'Network Error') {
      return Promise.reject(
        new Error(
          'Network Error: Unable to reach the backend server. If using Render free tier, the backend may be waking up from sleep (takes ~45s). Please wait a moment and try again.'
        )
      );
    }
    const customMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(customMessage));
  }
);

export default api;
