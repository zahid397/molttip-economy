/**
 * API Client Utilities
 * Centralized Axios configuration for Molttip Economy
 */

import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/shared/constants';
import type { ApiResponse } from '@/shared/types';

/* ─────────────────────────────────────────────── */
/* 🌐 Axios Instance */
/* ─────────────────────────────────────────────── */

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ─────────────────────────────────────────────── */
/* 🔐 Request Interceptor (Attach Token Safely) */
/* ─────────────────────────────────────────────── */

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Prevent SSR crash
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─────────────────────────────────────────────── */
/* ⚠️ Response Interceptor (Handle 401 Globally) */
/* ─────────────────────────────────────────────── */

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        // Clear auth data
        localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);

        // Redirect to home
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

/* ─────────────────────────────────────────────── */
/* 🚀 Generic API Methods */
/* ─────────────────────────────────────────────── */

export const api = {
  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  },
};

/* ─────────────────────────────────────────────── */
/* ❌ Centralized Error Handler */
/* ─────────────────────────────────────────────── */

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error;

    return message || error.message || 'An unexpected error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
