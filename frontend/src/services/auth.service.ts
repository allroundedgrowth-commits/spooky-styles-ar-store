import api from './apiService';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '../types/user';

/**
 * Authentication Service
 * Uses the new API integration layer with automatic loading states and error handling
 */
class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const authData = await api.auth.register(data);
    
    // Store token in localStorage
    localStorage.setItem('auth_token', authData.token);
    
    return authData;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const authData = await api.auth.login(data);
    
    // Store token in localStorage
    localStorage.setItem('auth_token', authData.token);
    
    return authData;
  }

  async logout(): Promise<void> {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API fails
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  async getCurrentUser(): Promise<User> {
    return await api.auth.getCurrentUser();
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    return await api.auth.updateProfile(updates);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export default new AuthService();
