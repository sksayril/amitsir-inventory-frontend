import axios from 'axios';
import { authStorage } from '../utils/storage';

// Base API configuration
const API_BASE_URL = 'http://localhost:3100';

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

// Sales Transactions API endpoints
export const salesAPI = {
  // Get all sales transactions with pagination and filters
  getSalesTransactions: (params: {
    page?: number;
    limit?: number;
    search?: string;
    companyId?: string;
    startDate?: string;
    endDate?: string;
    currency?: string;
    status?: string;
    isActive?: boolean;
  }) => api.get('/sales-transactions', { params }),

  // Get sales transaction by ID
  getSalesTransactionById: (id: string) => api.get(`/sales-transactions/${id}`),

  // Create new sales transaction
  createSalesTransaction: (data: any) => api.post('/sales-transactions', data),

  // Update sales transaction
  updateSalesTransaction: (id: string, data: any) => api.put(`/sales-transactions/${id}`, data),

  // Delete sales transaction
  deleteSalesTransaction: (id: string) => api.delete(`/sales-transactions/${id}`),

  // Search by invoice number
  searchByInvoiceNumber: (invoiceNumber: string) => api.get(`/sales-transactions/search/invoice/${invoiceNumber}`),

  // Search by transaction number
  searchByTransactionNumber: (transactionNumber: string) => api.get(`/sales-transactions/search/transaction/${transactionNumber}`),

  // Get transactions by company
  getTransactionsByCompany: (companyId: string) => api.get(`/sales-transactions/company/${companyId}`),

  // Get export summary
  getExportSummary: (params: {
    startDate?: string;
    endDate?: string;
    companyId?: string;
  }) => api.get('/sales-transactions/export/summary', { params }),
};

// Invoices API endpoints
export const invoicesAPI = {
  // Get invoice by invoice number
  getInvoiceByNumber: (invoiceNumber: string) => api.get(`/invoices/${invoiceNumber}`),

  // Get invoice series for company
  getInvoiceSeries: (companyId: string, params: { year?: number }) => api.get(`/invoices/company/${companyId}/series`, { params }),

  // Get export statistics
  getExportStatistics: (params: {
    startDate?: string;
    endDate?: string;
    companyId?: string;
  }) => api.get('/invoices/export/statistics', { params }),

  // Advanced invoice search
  advancedSearch: (params: {
    search?: string;
    companyId?: string;
    startDate?: string;
    endDate?: string;
    currency?: string;
    status?: string;
    country?: string;
    minAmount?: number;
    maxAmount?: number;
    exporter?: string;
    consignee?: string;
    page?: number;
    limit?: number;
  }) => api.get('/invoices/search/advanced', { params }),

  // Get invoice template
  getInvoiceTemplate: (companyId: string) => api.get('/invoices/export/template', { params: { companyId } }),
};

// Master Data API endpoints
export const masterDataAPI = {
  // Companies
  getCompanies: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => api.get('/companies', { params }),

  // Debit Parties
  getDebitParties: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => api.get('/debit-parties', { params }),

  // Credit Parties
  getCreditParties: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => api.get('/master-data/credit-parties', { params }),

  // Items
  getItems: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => api.get('/master-data/items', { params }),

  // Brokers
  getBrokers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => api.get('/master-data/brokers', { params }),

  // CHAs
  getChas: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) => api.get('/master-data/chas', { params }),
};

export default api;
