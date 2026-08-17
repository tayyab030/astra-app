import axios from 'axios';

import { getApiBaseUrl } from './config';

export const publicApi = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

export const authApi = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

publicApi.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

authApi.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});
