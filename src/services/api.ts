import axios from 'axios';
import { authStorage } from '../utils/storage';

// Base API configuration
const API_BASE_URL = 'https://t0nzmsdd-3100.inc1.devtunnels.ms';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from authStorage first, then fallback to localStorage
    let token = authStorage.getToken();
    if (!token) {
      token = localStorage.getItem('authToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear token and redirect on 401 if it's an authentication error
    if (error.response?.status === 401) {
      // Check if this is a real auth error or just a missing token
      const token = authStorage.getToken() || localStorage.getItem('authToken');
      
      if (token) {
        // Token exists but server rejected it - clear and redirect
        console.log('Token expired or invalid, redirecting to login');
        authStorage.clear();
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // If no token, don't redirect - just let the error propagate
    }
    return Promise.reject(error);
  }
);

// Company API endpoints
export const companyAPI = {
  // Get all companies with pagination and search
  getCompanies: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => api.get('/companies', { params }),

  // Get individual company by ID
  getCompanyById: (id: string) => api.get(`/companies/${id}`),

  // Create new company
  createCompany: (data: {
    firmId: string;
    companyName: string;
    firmAddress1: string;
    firmAddress2?: string;
    firmAddress3?: string;
    pinCode: string;
    gstNo: string;
    panNo: string;
    contactNo: string;
    emailId: string;
  }) => api.post('/companies', data),

  // Update company
  updateCompany: (id: string, data: {
    firmId: string;
    companyName: string;
    firmAddress1: string;
    firmAddress2?: string;
    firmAddress3?: string;
    pinCode: string;
    gstNo: string;
    panNo: string;
    contactNo: string;
    emailId: string;
  }) => api.put(`/companies/${id}`, data),

  // Delete company
  deleteCompany: (id: string) => api.delete(`/companies/${id}`),
};

export default api;
