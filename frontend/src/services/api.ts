import axios, { AxiosError } from 'axios';
import { storage } from '@/utils/storage';

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://molttip-api.onrender.com/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/* -----------------------------
   REQUEST INTERCEPTOR
------------------------------*/
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* -----------------------------
   RESPONSE INTERCEPTOR
------------------------------*/
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status;

    // ✅ Network error (server down / timeout / cors) -> silent reject
    if (!error.response) {
      return Promise.reject(new Error('NETWORK_ERROR'));
    }

    // Handle unauthorized globally
    if (status === 401) {
      storage.clearToken();

      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    return Promise.reject(new Error(message));
  }
);

export default api;
