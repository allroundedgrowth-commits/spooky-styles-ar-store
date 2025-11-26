import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { apiClient, APIError, loadingStateManager } from '../api';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('API Integration Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('APIError', () => {
    it('should create APIError with status code', () => {
      const error = new APIError('Test error', 404);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('APIError');
    });
  });

  describe('Authentication Interceptor', () => {
    it('should attach JWT token to requests', () => {
      const token = 'test-token-123';
      localStorage.setItem('auth_token', token);

      const config = {
        headers: {} as any,
      };

      // Get the request interceptor
      const requestInterceptor = (apiClient.interceptors.request as any).handlers[0];
      const result = requestInterceptor.fulfilled(config);

      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not attach token if not present', () => {
      const config = {
        headers: {} as any,
      };

      const requestInterceptor = (apiClient.interceptors.request as any).handlers[0];
      const result = requestInterceptor.fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Loading State Manager', () => {
    it('should track loading states', () => {
      loadingStateManager.setLoading('test.key', true);
      expect(loadingStateManager.isLoading('test.key')).toBe(true);

      loadingStateManager.setLoading('test.key', false);
      expect(loadingStateManager.isLoading('test.key')).toBe(false);
    });

    it('should notify subscribers on state change', () => {
      const listener = vi.fn();
      const unsubscribe = loadingStateManager.subscribe(listener);

      loadingStateManager.setLoading('test.key', true);
      expect(listener).toHaveBeenCalledWith({ 'test.key': true });

      unsubscribe();
      loadingStateManager.setLoading('test.key', false);
      expect(listener).toHaveBeenCalledTimes(1); // Should not be called after unsubscribe
    });

    it('should return all loading states', () => {
      loadingStateManager.setLoading('key1', true);
      loadingStateManager.setLoading('key2', false);

      const states = loadingStateManager.getAll();
      expect(states).toEqual({ key1: true, key2: false });
    });
  });
});
