import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Smart API URL detection for both desktop and mobile
const getApiBaseUrl = (): string => {
  // If explicitly set in env, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on current hostname
  const hostname = window.location.hostname;
  
  // If accessing via IP address (mobile), use that IP for backend
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5000/api`;
  }
  
  // Default to localhost for desktop
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// API Error types
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: AxiosError
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Track retry count in config metadata instead of headers
    if (!(config as any)._retryCount) {
      (config as any)._retryCount = 0;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to delay retry
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Response interceptor for error handling and retry logic
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (!originalRequest) {
      return Promise.reject(new APIError('Request configuration is missing', 0, error));
    }

    // Get retry count from config metadata
    const retryCount = (originalRequest as any)._retryCount || 0;
    
    // Handle specific error responses
    if (error.response) {
      const status = error.response.status;
      const errorMessage = (error.response.data as any)?.error?.message || error.message;

      // Retry logic for retryable status codes
      if (
        RETRYABLE_STATUS_CODES.includes(status) &&
        retryCount < MAX_RETRIES &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        (originalRequest as any)._retryCount = retryCount + 1;
        
        // Exponential backoff
        const delayTime = RETRY_DELAY * Math.pow(2, retryCount);
        await delay(delayTime);
        
        return apiClient(originalRequest);
      }

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token but keep remembered credentials
          const rememberedEmail = localStorage.getItem('remembered_email');
          const rememberedPassword = localStorage.getItem('remembered_password');
          localStorage.removeItem('auth_token');
          if (rememberedEmail) localStorage.setItem('remembered_email', rememberedEmail);
          if (rememberedPassword) localStorage.setItem('remembered_password', rememberedPassword);
          
          if (window.location.pathname !== '/account') {
            window.location.href = '/account';
          }
          throw new APIError('Session expired. Please log in again.', 401, error);
        
        case 403:
          throw new APIError('Access denied. You do not have permission to perform this action.', 403, error);
        
        case 404:
          throw new APIError('Resource not found.', 404, error);
        
        case 429:
          throw new APIError('Too many requests. Please try again later.', 429, error);
        
        case 500:
          throw new APIError('Server error. Please try again.', 500, error);
        
        default:
          throw new APIError(errorMessage || 'An error occurred', status, error);
      }
    }

    // Network error or timeout
    if (error.code === 'ECONNABORTED') {
      throw new APIError('Request timeout. Please check your connection.', 0, error);
    }
    
    if (!error.response) {
      throw new APIError('Network error. Please check your internet connection.', 0, error);
    }

    return Promise.reject(error);
  }
);

// Loading state management
type LoadingState = {
  [key: string]: boolean;
};

class LoadingStateManager {
  private loadingStates: LoadingState = {};
  private listeners: Set<(states: LoadingState) => void> = new Set();

  setLoading(key: string, isLoading: boolean): void {
    this.loadingStates[key] = isLoading;
    this.notifyListeners();
  }

  isLoading(key: string): boolean {
    return this.loadingStates[key] || false;
  }

  subscribe(listener: (states: LoadingState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.loadingStates }));
  }

  getAll(): LoadingState {
    return { ...this.loadingStates };
  }
}

export const loadingStateManager = new LoadingStateManager();

// Wrapper function for API calls with loading state
export async function apiCall<T>(
  key: string,
  apiFunction: () => Promise<AxiosResponse<T>>
): Promise<T> {
  try {
    loadingStateManager.setLoading(key, true);
    const response = await apiFunction();
    return response.data;
  } finally {
    loadingStateManager.setLoading(key, false);
  }
}
