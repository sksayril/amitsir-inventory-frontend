import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Loader2, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';
// Define interface for API response data
interface CreditPartyAPI {
  _id: string;
  partyName: string;
  partyAddress1: string;
  partyAddress2?: string;
  partyAddress3?: string;
  pinCode: string;
  country: string;
  port: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  customField1?: string;
  createdAt: string;
  updatedAt: string;
}

export const CreditPartyMaster: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Data and loading states
  const [creditParties, setCreditParties] = useState<CreditPartyAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  // Detail modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPartyDetails, setSelectedPartyDetails] = useState<CreditPartyAPI | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Edit modal states
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingParty, setEditingParty] = useState<CreditPartyAPI | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddCreditParty = async (partyData: {
    partyName: string;
    partyAddress1: string;
    partyAddress2: string;
    partyAddress3: string;
    pinCode: string;
    country: string;
    port: string;
    customField1: string;
  }) => {
    try {
      setIsSubmitting(true);
      setApiError(null);
      
      // Prepare the API request body
      const apiRequestBody = {
        partyName: partyData.partyName,
        partyAddress1: partyData.partyAddress1,
        partyAddress2: partyData.partyAddress2,
        partyAddress3: partyData.partyAddress3,
        pinCode: partyData.pinCode,
        country: partyData.country,
        port: partyData.port,
        customField1: partyData.customField1
      };

      // Call the API to create credit party
      const response = await api.post('/master-data/credit-parties', apiRequestBody);
      
      if (response.data.success) {
        // Success - credit party added
        setShowForm(false);
        // Refresh the credit parties list
        fetchCreditParties();
      } else {
        setApiError(response.data.message || 'Failed to add credit party');
      }
    } catch (error: any) {
      console.error('Error adding credit party:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add credit party';
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch credit parties from API
  const fetchCreditParties = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      const response = await api.get('/master-data/credit-parties', {
        params: {
          page: pagination.currentPage,
          limit: pagination.limit,
          search: searchTerm,
          isActive: isActiveFilter
        }
      });
      
      if (response.data.success) {
        const { data, pagination: paginationData } = response.data;
        setCreditParties(data);
        setPagination(prev => ({
          ...prev,
          currentPage: paginationData.currentPage,
          totalPages: paginationData.totalPages,
          totalItems: paginationData.totalItems
        }));
      } else {
        setApiError(response.data.message || 'Failed to fetch credit parties');
      }
    } catch (error: any) {
      console.error('Error fetching credit parties:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch credit parties';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch credit parties on component mount and when filters change
  useEffect(() => {
    fetchCreditParties();
  }, [pagination.currentPage, searchTerm, isActiveFilter]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle credit party row click to show details
  const handlePartyClick = async (partyId: string) => {
    try {
      setIsLoadingDetails(true);
      setApiError(null);
      
      const response = await api.get(`/master-data/credit-parties/${partyId}`);
      
      if (response.data.success) {
        setSelectedPartyDetails(response.data.data);
        setShowDetailsModal(true);
      } else {
        setApiError(response.data.message || 'Failed to fetch credit party details');
      }
    } catch (error: any) {
      console.error('Error fetching credit party details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch credit party details';
      setApiError(errorMessage);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPartyDetails(null);
  };

  // Handle edit button click
  const handleEditClick = (party: CreditPartyAPI) => {
    setEditingParty(party);
    setShowEditForm(true);
  };

  // Handle edit form submission
  const handleEditCreditParty = async (partyData: {
    partyName: string;
    country: string;
    port: string;
  }) => {
    if (!editingParty) return;

    try {
      setIsEditing(true);
      setApiError(null);
      
      // Prepare the API request body
      const apiRequestBody = {
        partyName: partyData.partyName,
        country: partyData.country,
        port: partyData.port
      };

      // Call the API to update credit party
      const response = await api.put(`/master-data/credit-parties/${editingParty._id}`, apiRequestBody);
      
      if (response.data.success) {
        // Success - credit party updated
        setShowEditForm(false);
        setEditingParty(null);
        // Refresh the credit parties list
        fetchCreditParties();
      } else {
        setApiError(response.data.message || 'Failed to update credit party');
      }
    } catch (error: any) {
      console.error('Error updating credit party:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update credit party';
      setApiError(errorMessage);
    } finally {
      setIsEditing(false);
    }
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingParty(null);
  };

  // Handle delete button click
  const handleDeleteClick = async (party: CreditPartyAPI) => {
    try {
      setApiError(null);
      
      // Call the API to delete credit party
      const response = await api.delete(`/master-data/credit-parties/${party._id}`);
      
      if (response.data.success) {
        // Success - credit party deleted
        // Refresh the credit parties list
        fetchCreditParties();
      } else {
        setApiError(response.data.message || 'Failed to delete credit party');
      }
    } catch (error: any) {
      console.error('Error deleting credit party:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete credit party';
      setApiError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credit Party Master</h1>
          <p className="text-gray-600 mt-2">Manage your customers, suppliers and credit relationships</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Credit Party</span>
        </Button>
      </div>
      
      {/* API Error Display */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <div className="text-red-700">
            <p className="font-medium">API Error</p>
            <p className="text-sm">{apiError}</p>
          </div>
          <button
            onClick={() => setApiError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by party name, country, or port..."
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActiveFilter}
                onChange={(e) => setIsActiveFilter(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active Only
              </label>
            </div>
            
            <Button
              onClick={fetchCreditParties}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Apply Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {!isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Credit Parties</h3>
              <p className="text-sm text-gray-600">
                {creditParties.length} of {pagination.totalItems} total parties
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Page</p>
              <p className="text-lg font-semibold text-gray-900">
                {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Credit Parties Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-500">Loading credit parties...</p>
        </div>
      ) : creditParties.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custom Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {creditParties.map((party) => (
                  <tr 
                    key={party._id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handlePartyClick(party._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{party.partyName}</div>
                        <div className="text-sm text-gray-500">Created by: {party.createdBy?.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>{party.partyAddress1}</div>
                        {party.partyAddress2 && <div className="text-sm text-gray-500">{party.partyAddress2}</div>}
                        {party.partyAddress3 && <div className="text-sm text-gray-500">{party.partyAddress3}</div>}
                        <div className="text-sm text-gray-500">PIN: {party.pinCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{party.country}</div>
                        <div className="text-sm text-gray-500">{party.port}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {party.customField1 || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(party.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        party.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {party.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(party);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                                                 <button 
                           className="text-red-600 hover:text-red-900"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDeleteClick(party);
                           }}
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </div>
      
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  variant="secondary"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  variant="secondary"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Parties Found</h3>
          <p className="text-gray-500">
            {searchTerm || !isActiveFilter 
              ? 'Try adjusting your search or filters.' 
              : 'Click "Add Credit Party" to start managing your credit relationships.'
            }
          </p>
        </div>
      )}

             {/* Credit Party Form Modal */}
       {showForm && (
         <CreditPartyForm
           onSubmit={handleAddCreditParty}
           onCancel={handleCancel}
           isSubmitting={isSubmitting}
         />
       )}

               {/* Credit Party Details Modal */}
        {showDetailsModal && (
          <CreditPartyDetailsModal
            party={selectedPartyDetails}
            onClose={handleCloseDetailsModal}
            isLoading={isLoadingDetails}
          />
        )}

        {/* Credit Party Edit Form Modal */}
        {showEditForm && editingParty && (
          <CreditPartyEditForm
            party={editingParty}
            onSubmit={handleEditCreditParty}
            onCancel={handleCloseEditForm}
            isSubmitting={isEditing}
          />
        )}
      </div>
    );
  };

// Credit Party Form Component
interface CreditPartyFormProps {
  onSubmit: (party: {
    partyName: string;
    partyAddress1: string;
    partyAddress2: string;
    partyAddress3: string;
    pinCode: string;
    country: string;
    port: string;
    customField1: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CreditPartyForm: React.FC<CreditPartyFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    partyName: '',
    partyAddress1: '',
    partyAddress2: '',
    partyAddress3: '',
    pinCode: '',
    country: '',
    port: '',
    customField1: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Add New Credit Party</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Party Name */}
          <Input
            label="Party Name"
            value={formData.partyName}
            onChange={(e) => setFormData(prev => ({ ...prev, partyName: e.target.value }))}
            placeholder="Enter party name (e.g., XYZ International Ltd)"
            required
          />

          {/* Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Address Line 1"
              value={formData.partyAddress1}
              onChange={(e) => setFormData(prev => ({ ...prev, partyAddress1: e.target.value }))}
              placeholder="Enter address line 1"
              required
            />
            <Input
              label="Address Line 2"
              value={formData.partyAddress2}
              onChange={(e) => setFormData(prev => ({ ...prev, partyAddress2: e.target.value }))}
              placeholder="Enter address line 2 (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Address Line 3"
              value={formData.partyAddress3}
              onChange={(e) => setFormData(prev => ({ ...prev, partyAddress3: e.target.value }))}
              placeholder="Enter address line 3 (optional)"
            />
            <Input
              label="PIN Code"
              value={formData.pinCode}
              onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
              placeholder="Enter PIN code"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              placeholder="Enter country name"
              required
            />
            <Input
              label="Port"
              value={formData.port}
              onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
              placeholder="Enter port name"
              required
            />
          </div>

          {/* Custom Field */}
          <Input
            label="Custom Field 1"
            value={formData.customField1}
            onChange={(e) => setFormData(prev => ({ ...prev, customField1: e.target.value }))}
            placeholder="Enter custom value"
          />

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting} isLoading={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Credit Party'
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
                 </form>
       </div>
     </div>
   );
 };

// Credit Party Details Modal Component
interface CreditPartyDetailsModalProps {
  party: CreditPartyAPI | null;
  onClose: () => void;
  isLoading: boolean;
}

const CreditPartyDetailsModal: React.FC<CreditPartyDetailsModalProps> = ({ party, onClose, isLoading }) => {
  if (!party) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Credit Party Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-500">Loading credit party details...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Party Name</label>
                    <p className="text-sm text-gray-900">{party.partyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      party.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {party.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Custom Field</label>
                    <p className="text-sm text-gray-900">{party.customField1 || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Country</label>
                    <p className="text-sm text-gray-900">{party.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Port</label>
                    <p className="text-sm text-gray-900">{party.port}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">PIN Code</label>
                    <p className="text-sm text-gray-900">{party.pinCode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Address Line 1</label>
                  <p className="text-sm text-gray-900">{party.partyAddress1}</p>
                </div>
                {party.partyAddress2 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 2</label>
                    <p className="text-sm text-gray-900">{party.partyAddress2}</p>
                  </div>
                )}
                {party.partyAddress3 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 3</label>
                    <p className="text-sm text-gray-900">{party.partyAddress3}</p>
                  </div>
                )}
              </div>
            </div>

            {/* System Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Created By</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900">{party.createdBy?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{party.createdBy?.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-sm text-gray-900">
                      {new Date(party.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm text-gray-900">
                      {new Date(party.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Credit Party Edit Form Component
interface CreditPartyEditFormProps {
  party: CreditPartyAPI;
  onSubmit: (party: {
    partyName: string;
    country: string;
    port: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CreditPartyEditForm: React.FC<CreditPartyEditFormProps> = ({ party, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    partyName: party.partyName,
    country: party.country,
    port: party.port,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Edit Credit Party</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Party Name */}
          <Input
            label="Party Name"
            value={formData.partyName}
            onChange={(e) => setFormData(prev => ({ ...prev, partyName: e.target.value }))}
            placeholder="Enter party name (e.g., XYZ International Ltd Updated)"
            required
          />

          {/* Country and Port */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              placeholder="Enter country name"
              required
            />
            <Input
              label="Port"
              value={formData.port}
              onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
              placeholder="Enter port name"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting} isLoading={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Credit Party'
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
