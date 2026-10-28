import axios from 'axios';

let apiBaseUrl = import.meta.env.VITE_API_URL || '';

// If running in development without explicit URL, use local proxy /api
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  apiBaseUrl = '/api';
} else if (
  !apiBaseUrl ||
  apiBaseUrl === '/api' ||
  apiBaseUrl.includes('campusx-backend.onrender.com')
) {
  // Production fallback: automatically point to your actual live backend
  apiBaseUrl = 'https://campusx-project.onrender.com/api';
}

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
  timeout: 60000, // 60s timeout to gracefully allow Render free-tier cold starts
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
    if (error.message === 'Network Error') {
      return Promise.reject(
        new Error(
          'Network Error: Unable to reach backend server. If using Render free tier, the backend may be waking up from sleep (takes ~45s), or check if your backend is live.'
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
