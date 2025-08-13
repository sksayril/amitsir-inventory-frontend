import api from './api';
import { authStorage } from '../utils/storage';

// Types for authentication
export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

// Authentication service class
class AuthService {
  // User registration
  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/signup', userData);
      
      if (response.data.success) {
        // Store token and user data using storage utility
        authStorage.setToken(response.data.data.token);
        authStorage.setUser(response.data.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        message: 'Network error occurred. Please try again.'
      } as ErrorResponse;
    }
  }

  // User login
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.success) {
        // Store token and user data using storage utility
        authStorage.setToken(response.data.data.token);
        authStorage.setUser(response.data.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        message: 'Network error occurred. Please try again.'
      } as ErrorResponse;
    }
  }

  // Logout user
  logout(): void {
    authStorage.clear();
    // Redirect to login page
    window.location.href = '/login';
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    return authStorage.getUser<User>();
  }

  // Get auth token from localStorage
  getAuthToken(): string | null {
    return authStorage.getToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Update user data in localStorage (useful after profile updates)
  updateUserData(user: User): void {
    authStorage.setUser(user);
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
