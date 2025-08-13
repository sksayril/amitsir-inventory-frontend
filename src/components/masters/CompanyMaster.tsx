import React, { useState, useEffect } from 'react';
import { Company } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Search, Edit, Trash2, Building2, Eye, X, Loader2, AlertCircle } from 'lucide-react';
import { companyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { authStorage } from '../../utils/storage';

export const CompanyMaster: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Check if user has valid token
  const hasValidToken = () => {
    const token = authStorage.getToken() || localStorage.getItem('authToken');
    return !!token;
  };

  // Fetch companies from API
  const fetchCompanies = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user has valid token before making API call
      if (!hasValidToken()) {
        setError('Authentication required. Please login again.');
        return;
      }

      const params: any = { page, limit };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (selectedStatus !== '') {
        params.isActive = selectedStatus === 'active';
      }

      const response = await companyAPI.getCompanies(params);
      
      if (response.data.success) {
        setCompanies(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.data.message || 'Failed to fetch companies');
      }
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch companies';
      setError(errorMessage);
      
      // Only redirect to login if it's a real authentication error
      if (error.response?.status === 401 && hasValidToken()) {
        console.log('Token expired, redirecting to login');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch individual company data when component loads
  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user has valid token before making API call
      if (!hasValidToken()) {
        setError('Authentication required. Please login again.');
        return;
      }

      // First fetch all companies
      const companiesResponse = await companyAPI.getCompanies({ page: 1, limit: 10 });
      
      if (companiesResponse.data.success) {
        setCompanies(companiesResponse.data.data);
        setPagination(companiesResponse.data.pagination);
        
        // If there are companies, fetch detailed data for the first one as an example
        if (companiesResponse.data.data.length > 0) {
          const firstCompany = companiesResponse.data.data[0];
          console.log('Fetching detailed data for company:', firstCompany.companyName);
          
          try {
            const detailedResponse = await companyAPI.getCompanyById(firstCompany._id);
            if (detailedResponse.data.success) {
              console.log('Detailed company data:', detailedResponse.data.data);
              // You can use this detailed data for additional functionality
            }
          } catch (detailError: any) {
            console.log('Could not fetch detailed company data:', detailError.message);
            // This is not critical, so we don't show error to user
          }
        }
      } else {
        setError(companiesResponse.data.message || 'Failed to fetch companies');
      }
    } catch (error: any) {
      console.error('Error fetching company data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch company data';
      setError(errorMessage);
      
      // Only redirect to login if it's a real authentication error
      if (error.response?.status === 401 && hasValidToken()) {
        console.log('Token expired, redirecting to login');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasValidToken()) {
      fetchCompanyData();
    }
  }, [user]);

  // Debounced search effect
  useEffect(() => {
    if (!user || !hasValidToken()) return;
    
    const timer = setTimeout(() => {
      fetchCompanies(1, pagination.itemsPerPage);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedStatus, user]);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.firmId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.gstNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.panNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.emailId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || 
                         (selectedStatus === 'active' ? company.isActive : !company.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleAddCompany = async (companyData: {
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
  }) => {
    try {
      setFormLoading(true);
      setError(null);
      
      // Check if user has valid token before making API call
      if (!hasValidToken()) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await companyAPI.createCompany(companyData);
      
      if (response.data.success) {
        // Refresh the companies list
        fetchCompanies(pagination.currentPage, pagination.itemsPerPage);
        setShowForm(false);
        // You can add success toast here
        alert('Company created successfully!');
      } else {
        setError(response.data.message || 'Failed to create company');
      }
    } catch (error: any) {
      console.error('Error creating company:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create company';
      setError(errorMessage);
      
      // Only redirect to login if it's a real authentication error
      if (error.response?.status === 401 && hasValidToken()) {
        console.log('Token expired, redirecting to login');
        window.location.href = '/login';
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCompany = async (companyData: {
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
  }) => {
    if (editingCompany) {
      try {
        setFormLoading(true);
        setError(null);
        
        // Check if user has valid token before making API call
        if (!hasValidToken()) {
          setError('Authentication required. Please login again.');
          return;
        }

        const response = await companyAPI.updateCompany(editingCompany._id, companyData);
        
        if (response.data.success) {
          // Refresh the companies list
          fetchCompanies(pagination.currentPage, pagination.itemsPerPage);
          setEditingCompany(undefined);
          setShowForm(false);
          // You can add success toast here
          alert('Company updated successfully!');
        } else {
          setError(response.data.message || 'Failed to update company');
        }
      } catch (error: any) {
        console.error('Error updating company:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update company';
        setError(errorMessage);
        
        // Only redirect to login if it's a real authentication error
        if (error.response?.status === 401 && hasValidToken()) {
          console.log('Token expired, redirecting to login');
          window.location.href = '/login';
        }
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        setError(null);
        
        // Check if user has valid token before making API call
        if (!hasValidToken()) {
          setError('Authentication required. Please login again.');
          return;
        }

        const response = await companyAPI.deleteCompany(id);
        
        if (response.data.success) {
          // Refresh the companies list
          fetchCompanies(pagination.currentPage, pagination.itemsPerPage);
          // You can add success toast here
          alert('Company deleted successfully!');
        } else {
          setError(response.data.message || 'Failed to delete company');
        }
      } catch (error: any) {
        console.error('Error deleting company:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete company';
        setError(errorMessage);
        
        // Only redirect to login if it's a real authentication error
        if (error.response?.status === 401 && hasValidToken()) {
          console.log('Token expired, redirecting to login');
          window.location.href = '/login';
        }
      }
    }
  };

  const startEdit = (company: Company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCompany(undefined);
    setError(null);
  };

  const handlePageChange = (page: number) => {
    fetchCompanies(page, pagination.itemsPerPage);
  };

  // Show loading state if user is not loaded yet
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show authentication error if no valid token
  if (!hasValidToken()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-500 mb-4">Please login to access the Company Master.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Master</h1>
          <p className="text-gray-600 mt-2">Manage your business partners and suppliers</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div className="text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies by name, ID, GST, PAN, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST/PAN
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Loading companies...</p>
                  </td>
                </tr>
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <Building2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{company.companyName}</div>
                          <div className="text-sm text-gray-500">ID: {company.firmId}</div>
                          <div className="text-sm text-gray-500">{company.firmAddress1}</div>
                          {company.firmAddress2 && <div className="text-sm text-gray-500">{company.firmAddress2}</div>}
                          {company.firmAddress3 && <div className="text-sm text-gray-500">{company.firmAddress3}</div>}
                          <div className="text-sm text-gray-500">Pin: {company.pinCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{company.contactNo}</div>
                        <div className="text-sm text-gray-500">{company.emailId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>GST: {company.gstNo}</div>
                        <div>PAN: {company.panNo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEdit(company)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit Company"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete Company"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                    <p className="text-gray-500">Start by adding your first company to the system.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1"
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Company Form Modal */}
      {showForm && (
        <CompanyForm
          company={editingCompany}
          onSubmit={editingCompany ? handleEditCompany : handleAddCompany}
          onCancel={handleCancel}
          loading={formLoading}
        />
      )}
    </div>
  );
};

// Company Form Component
interface CompanyFormProps {
  company?: Company;
  onSubmit: (company: {
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
  }) => void;
  onCancel: () => void;
  loading: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    firmId: '',
    companyName: '',
    firmAddress1: '',
    firmAddress2: '',
    firmAddress3: '',
    pinCode: '',
    gstNo: '',
    panNo: '',
    contactNo: '',
    emailId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (company) {
      setFormData({
        firmId: company.firmId || '',
        companyName: company.companyName || '',
        firmAddress1: company.firmAddress1 || '',
        firmAddress2: company.firmAddress2 || '',
        firmAddress3: company.firmAddress3 || '',
        pinCode: company.pinCode || '',
        gstNo: company.gstNo || '',
        panNo: company.panNo || '',
        contactNo: company.contactNo || '',
        emailId: company.emailId || '',
      });
    }
  }, [company]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firmId.trim()) {
      newErrors.firmId = 'FIRM ID is required';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.firmAddress1.trim()) {
      newErrors.firmAddress1 = 'Address is required';
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Please enter a valid 6-digit PIN code';
    }

    if (!formData.gstNo.trim()) {
      newErrors.gstNo = 'GST number is required';
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNo)) {
      newErrors.gstNo = 'Please enter a valid GST number';
    }

    if (!formData.panNo.trim()) {
      newErrors.panNo = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo)) {
      newErrors.panNo = 'Please enter a valid PAN number';
    }

    if (!formData.contactNo.trim()) {
      newErrors.contactNo = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNo)) {
      newErrors.contactNo = 'Please enter a valid 10-digit contact number';
    }

    if (!formData.emailId.trim()) {
      newErrors.emailId = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      newErrors.emailId = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {company ? 'Edit Company' : 'Add New Company'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="Enter company name"
              required
              error={errors.companyName}
            />
            <Input
              label="Firm ID"
              value={formData.firmId}
              onChange={(e) => setFormData(prev => ({ ...prev, firmId: e.target.value }))}
              placeholder="Enter firm ID"
              required
              error={errors.firmId}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Number"
              value={formData.contactNo}
              onChange={(e) => setFormData(prev => ({ ...prev, contactNo: e.target.value }))}
              placeholder="Enter 10-digit contact number"
              required
              error={errors.contactNo}
            />
            <Input
              label="Pin Code"
              value={formData.pinCode}
              onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
              placeholder="Enter 6-digit pin code"
              required
              error={errors.pinCode}
            />
          </div>

          <Input
            label="Firm Address Line 1"
            value={formData.firmAddress1}
            onChange={(e) => setFormData(prev => ({ ...prev, firmAddress1: e.target.value }))}
            placeholder="Enter address line 1"
            required
            error={errors.firmAddress1}
          />

          <Input
            label="Firm Address Line 2"
            value={formData.firmAddress2}
            onChange={(e) => setFormData(prev => ({ ...prev, firmAddress2: e.target.value }))}
            placeholder="Enter address line 2 (optional)"
          />

          <Input
            label="Firm Address Line 3"
            value={formData.firmAddress3}
            onChange={(e) => setFormData(prev => ({ ...prev, firmAddress3: e.target.value }))}
            placeholder="Enter address line 3 (optional)"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={formData.emailId}
              onChange={(e) => setFormData(prev => ({ ...prev, emailId: e.target.value }))}
              placeholder="Enter email address"
              required
              error={errors.emailId}
            />
            <Input
              label="GST Number"
              value={formData.gstNo}
              onChange={(e) => setFormData(prev => ({ ...prev, gstNo: e.target.value.toUpperCase() }))}
              placeholder="Enter GST number"
              required
              error={errors.gstNo}
            />
          </div>

          <Input
            label="PAN Number"
            value={formData.panNo}
            onChange={(e) => setFormData(prev => ({ ...prev, panNo: e.target.value.toUpperCase() }))}
            placeholder="Enter PAN number"
            required
            error={errors.panNo}
          />

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {company ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                company ? 'Update Company' : 'Add Company'
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
