import { apiClient } from './api';

export interface UserAddress {
  phone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserProfile extends UserAddress {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

class UserService {
  /**
   * Get current user profile including saved address
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/user/profile');
    return response.data;
  }

  /**
   * Update user's saved shipping address
   */
  async updateAddress(address: UserAddress): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/user/address', address);
    return response.data;
  }
}

export const userService = new UserService();
export default userService;
