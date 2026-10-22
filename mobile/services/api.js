import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error reading token from storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract data and handle refresh token on 401
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized for token refresh
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${CONFIG.API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          if (res.data && res.data.success && res.data.data.accessToken) {
            await AsyncStorage.setItem('accessToken', res.data.data.accessToken);
            if (res.data.data.refreshToken) {
              await AsyncStorage.setItem('refreshToken', res.data.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshErr) {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      }
    }

    const message = error.response?.data?.message || error.message || 'Network request failed';
    return Promise.reject(new Error(message));
  }
);

export default api;
