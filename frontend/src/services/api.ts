import axios from 'axios';
import { storage } from '@/utils/storage';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://molttip-api.onrender.com/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
