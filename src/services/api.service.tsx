import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // ✅ Ensures cookies (accessToken) are sent automatically
});

/**
 * ✅ Axios Request Interceptor
 * No need to manually set Authorization, token will be sent via cookies.
 */
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken'); // Get token from cookies
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config.url.includes('/auth/login'); // ✅ Check if it's a login request

      if (!isLoginRequest) {
        // ✅ Token expired - clear token & redirect
        Cookies.remove('accessToken');

        if (typeof window !== 'undefined') {
          toast.error('Session expired. Please login again.');
          window.location.href = '/auth/login';
        }
      } else {
        // ❌ Wrong credentials - just show an error
        toast.error('Invalid email or password. Please try again.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
