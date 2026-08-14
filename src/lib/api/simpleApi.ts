import type { InternalAxiosRequestConfig } from 'axios';

import {
  logoutSession,
  refreshAccessToken,
  resolveAccessToken,
} from '@/lib/auth/tokenManager';
import { authApi } from './simpleApiClient';

export { publicApi, authApi } from './simpleApiClient';

authApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await resolveAccessToken();
    if (!token) {
      await logoutSession();
      return Promise.reject(new Error('Session expired'));
    }

    config.headers.authorization = `JWT ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.authorization = `JWT ${newAccessToken}`;
        return authApi(originalRequest);
      }

      await logoutSession();
    }

    return Promise.reject(error);
  },
);
