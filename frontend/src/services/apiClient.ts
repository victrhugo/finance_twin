import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { useAuthStore } from '../store/useAuthStore';

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  path: string;
  details?: ApiErrorDetail[];
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically inject X-User-Id
apiClient.interceptors.request.use(
  (config) => {
    const { currentUserId } = useAuthStore.getState();
    if (currentUserId) {
      config.headers['X-User-Id'] = currentUserId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const apiError: ApiErrorResponse = error.response.data;
      return Promise.reject(apiError);
    }
    
    // Something happened in setting up the request that triggered an Error
    const fallbackError: ApiErrorResponse = {
      timestamp: new Date().toISOString(),
      status: error.status || 500,
      error: 'Network Error',
      code: 'NETWORK_ERROR',
      message: error.message || 'Erro de conexão com o servidor.',
      path: '',
    };
    return Promise.reject(fallbackError);
  }
);
