import React, { useState, useEffect } from 'react';
import { DebitParty } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Search, Edit, Trash2, Building2, Filter, X, Loader2, Eye } from 'lucide-react';
import api from '../../services/api';

export const DebitPartyMaster: React.FC = () => {
  const [debitParties, setDebitParties] = useState<DebitParty[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingParty, setEditingParty] = useState<DebitParty | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPartyDetails, setSelectedPartyDetails] = useState<DebitParty | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // Fetch debit parties from API when component mounts
  useEffect(() => {
    fetchDebitParties();
  }, []);

  // Function to handle initial load and refresh
  const handleRefresh = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDebitParties();
  };

  // Function to fetch debit parties from API
  const fetchDebitParties = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        isActive: selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined
      };
      
      const response = await api.get('/debit-parties', { params });
      
      if (response.data.success) {
        const apiDebitParties = response.data.data.map((party: any) => ({
          id: party._id || party.id,
          partyName: party.partyName,
          partyAddress1: party.partyAddress1,
          partyAddress2: party.partyAddress2,
          partyAddress3: party.partyAddress3,
          pinCode: party.pinCode,
          gstNo: party.gstNo,
          panNo: party.panNo,
          iecNo: party.iecNo,
          epcgLicNo: {
            lic1: party.epcgLicNo?.lic1 || '',
            lic2: party.epcgLicNo?.lic2 || '',
            lic3: party.epcgLicNo?.lic3 || '',
          },
          epcgLicDate: party.epcgLicDate,
          epcgLicExpiryReminder: party.epcgLicExpiryReminder,
          customField1: party.customField1,
          status: party.isActive ? 'active' : 'inactive',
          createdAt: party.createdAt || new Date().toISOString(),
        }));
        
        setDebitParties(apiDebitParties);
        
        // Update pagination from API response
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination.totalItems || apiDebitParties.length,
            totalPages: response.data.pagination.totalPages || Math.ceil(apiDebitParties.length / prev.limit)
          }));
        }
      } else {
        setApiError(response.data.message || 'Failed to fetch debit parties');
      }
    } catch (error: any) {
      console.error('Error fetching debit parties:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch debit parties';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchDebitParties();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter effect
  useEffect(() => {
    if (selectedStatus !== '') {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchDebitParties();
    }
  }, [selectedStatus]);

  // Pagination effect
  useEffect(() => {
    if (pagination.page > 1) {
      fetchDebitParties();
    }
  }, [pagination.page]);

  const filteredDebitParties = debitParties;

  const handleAddDebitParty = async (partyData: Omit<DebitParty, 'id' | 'createdAt'>) => {
    try {
      setIsSubmitting(true);
      
      // Call the API to create debit party
      const response = await api.post('/debit-parties', partyData);
      
              if (response.data.success) {
          // Success - add the new party to the list
          const newParty: DebitParty = {
            ...response.data.data,
            id: response.data.data._id || Date.now().toString(),
            createdAt: response.data.data.createdAt || new Date().toISOString(),
          };
          
          setShowForm(false);
          setApiError(null); // Clear any previous errors
          setApiSuccess('Debit party added successfully!');
          
          // Auto-clear success message after 3 seconds
          setTimeout(() => setApiSuccess(null), 3000);
          
          // Refresh the list to get the latest data
          fetchDebitParties();
        } else {
          setApiError(response.data.message || 'Failed to add debit party');
        }
    } catch (error: any) {
      console.error('Error adding debit party:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add debit party';
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDebitParty = async (partyData: Omit<DebitParty, 'id' | 'createdAt'>) => {
    if (!editingParty) return;
    
    try {
      setIsSubmitting(true);
      setApiError(null);
      
      // Prepare the data for the API call (only the fields that can be edited)
      const editData = {
        partyName: partyData.partyName,
        partyAddress1: partyData.partyAddress1,
        isActive: partyData.status === 'active'
      };
      
      // Call the API to update debit party
      const response = await api.put(`/debit-parties/${editingParty.id}`, editData);
      
      if (response.data.success) {
        // Success - update the party in the list
        const updatedParty: DebitParty = {
          ...editingParty,
          ...partyData,
        };
        
        setDebitParties(prev => prev.map(party => 
          party.id === editingParty.id ? updatedParty : party
        ));
        
        setEditingParty(undefined);
        setApiSuccess('Debit party updated successfully!');
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => setApiSuccess(null), 3000);
      } else {
        setApiError(response.data.message || 'Failed to update debit party');
      }
    } catch (error: any) {
      console.error('Error updating debit party:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update debit party';
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDebitParty = async (id: string) => {
    try {
      setIsSubmitting(true);
      setApiError(null);
      
      // Call the API to delete debit party
      const response = await api.delete(`/debit-parties/${id}`);
      
      if (response.data.success) {
        // Success - remove the party from the list
        setDebitParties(prev => prev.filter(party => party.id !== id));
        
        // Update pagination
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1,
          totalPages: Math.ceil((prev.total - 1) / prev.limit)
        }));
        
        setApiSuccess('Debit party deleted successfully!');
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => setApiSuccess(null), 3000);
      } else {
        setApiError(response.data.message || 'Failed to delete debit party');
      }
    } catch (error: any) {
      console.error('Error deleting debit party:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete debit party';
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartyClick = async (party: DebitParty) => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      // Call the API to get debit party details
      const response = await api.get(`/debit-parties/${party.id}`);
      
      if (response.data.success) {
        // Map API response to DebitParty format
        const partyDetails: DebitParty = {
          id: response.data.data._id || response.data.data.id,
          partyName: response.data.data.partyName,
          partyAddress1: response.data.data.partyAddress1,
          partyAddress2: response.data.data.partyAddress2,
          partyAddress3: response.data.data.partyAddress3,
          pinCode: response.data.data.pinCode,
          gstNo: response.data.data.gstNo,
          panNo: response.data.data.panNo,
          iecNo: response.data.data.iecNo,
          epcgLicNo: {
            lic1: response.data.data.epcgLicNo?.lic1 || '',
            lic2: response.data.data.epcgLicNo?.lic2 || '',
            lic3: response.data.data.epcgLicNo?.lic3 || '',
          },
          epcgLicDate: response.data.data.epcgLicDate,
          epcgLicExpiryReminder: response.data.data.epcgLicExpiryReminder,
          customField1: response.data.data.customField1,
          status: response.data.data.isActive ? 'active' : 'inactive',
          createdAt: response.data.data.createdAt || new Date().toISOString(),
        };
        
        setSelectedPartyDetails(partyDetails);
        setShowDetailsModal(true);
      } else {
        setApiError(response.data.message || 'Failed to fetch debit party details');
      }
    } catch (error: any) {
      console.error('Error fetching debit party details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch debit party details';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (party: DebitParty) => {
    setEditingParty(party);
  };

  const handleDeleteClick = (id: string) => {
    // Automatically delete without confirmation dialog
    handleDeleteDebitParty(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Debit Party Master</h1>
          <p className="text-gray-600 mt-2">Manage your debit party information and details</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleRefresh}
            disabled={isLoading}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button onClick={() => {
            setShowForm(true);
            setApiError(null);
            setApiSuccess(null);
          }} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Debit Party</span>
          </Button>
        </div>
      </div>

      {/* API Error Display */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{apiError}</p>
              </div>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* API Success Display */}
      {apiSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{apiSuccess}</p>
              </div>
            </div>
            <button
              onClick={() => setApiSuccess(null)}
              className="text-green-400 hover:text-green-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by party name, GST No, PAN No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

             {/* Debit Parties Table */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         {isLoading ? (
           <div className="flex items-center justify-center py-12">
             <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
             <span className="ml-2 text-gray-600">Loading debit parties...</span>
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-gray-50 border-b border-gray-200">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Party Name
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     GST No
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     PAN No
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     IEC No
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
                 {filteredDebitParties.map((party) => (
                   <tr 
                     key={party.id} 
                     className="hover:bg-gray-50 cursor-pointer"
                     onClick={() => handlePartyClick(party)}
                   >
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div>
                         <div className="text-sm font-medium text-gray-900">{party.partyName}</div>
                         <div className="text-sm text-gray-500">{party.partyAddress1}</div>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       {party.gstNo}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       {party.panNo}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       {party.iecNo}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                         party.status === 'active' 
                           ? 'bg-green-100 text-green-800' 
                           : 'bg-red-100 text-red-800'
                       }`}>
                         {party.status}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex items-center space-x-2">
                         <button
                           className="text-blue-600 hover:text-blue-900"
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
                             handleDeleteClick(party.id);
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
         )}
        
                 {filteredDebitParties.length === 0 && !isLoading && (
           <div className="text-center py-12">
             <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">No Debit Parties Found</h3>
             <p className="text-gray-500">
               {searchTerm || selectedStatus ? 'Try adjusting your search or filters.' : 'Get started by adding your first debit party.'}
             </p>
           </div>
         )}
       </div>

       {/* Pagination Controls */}
       {pagination.totalPages > 1 && (
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
           <div className="flex items-center justify-between">
             <div className="text-sm text-gray-700">
               Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
             </div>
             <div className="flex items-center space-x-2">
               <button
                 onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                 disabled={pagination.page === 1}
                 className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Previous
               </button>
               <span className="px-3 py-2 text-sm text-gray-700">
                 Page {pagination.page} of {pagination.totalPages}
               </span>
               <button
                 onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                 disabled={pagination.page === pagination.totalPages}
                 className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Next
               </button>
             </div>
           </div>
         </div>
       )}

      {/* Add/Edit Form Modal */}
      {(showForm || editingParty) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingParty ? 'Edit Debit Party' : 'Add New Debit Party'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingParty(undefined);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

                             <DebitPartyForm
                 onSubmit={editingParty ? handleEditDebitParty : handleAddDebitParty}
                 onCancel={() => {
                   setShowForm(false);
                   setEditingParty(undefined);
                 }}
                 initialData={editingParty}
                 isSubmitting={isSubmitting}
                 isEditing={!!editingParty}
               />
            </div>
          </div>
        </div>
      )}

             {/* Details Modal */}
       {showDetailsModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-gray-900">Debit Party Details</h2>
                 <button
                   onClick={() => {
                     setShowDetailsModal(false);
                     setSelectedPartyDetails(null);
                   }}
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <X className="w-6 h-6" />
                 </button>
               </div>

               {isLoading ? (
                 <div className="flex items-center justify-center py-12">
                   <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                   <span className="ml-2 text-gray-600">Loading debit party details...</span>
                 </div>
               ) : selectedPartyDetails ? (
                 <div className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>
                       <p className="text-gray-900">{selectedPartyDetails.partyName}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                         selectedPartyDetails.status === 'active' 
                           ? 'bg-green-100 text-green-800' 
                           : 'bg-red-100 text-red-800'
                       }`}>
                         {selectedPartyDetails.status}
                       </span>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">GST No</label>
                       <p className="text-gray-900">{selectedPartyDetails.gstNo}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">PAN No</label>
                       <p className="text-gray-900">{selectedPartyDetails.panNo}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">IEC No</label>
                       <p className="text-gray-900">{selectedPartyDetails.iecNo}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                       <p className="text-gray-900">{selectedPartyDetails.pinCode}</p>
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                     <p className="text-gray-900">{selectedPartyDetails.partyAddress1}</p>
                     {selectedPartyDetails.partyAddress2 && (
                       <p className="text-gray-900">{selectedPartyDetails.partyAddress2}</p>
                     )}
                     {selectedPartyDetails.partyAddress3 && (
                       <p className="text-gray-900">{selectedPartyDetails.partyAddress3}</p>
                     )}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">EPCG License 1</label>
                       <p className="text-gray-900">{selectedPartyDetails.epcgLicNo.lic1}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">EPCG License 2</label>
                       <p className="text-gray-900">{selectedPartyDetails.epcgLicNo.lic2 || 'N/A'}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">EPCG License 3</label>
                       <p className="text-gray-900">{selectedPartyDetails.epcgLicNo.lic3 || 'N/A'}</p>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">License Date</label>
                       <p className="text-gray-900">{new Date(selectedPartyDetails.epcgLicDate).toLocaleDateString()}</p>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Reminder</label>
                       <p className="text-gray-900">{new Date(selectedPartyDetails.epcgLicExpiryReminder).toLocaleDateString()}</p>
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Custom Field 1</label>
                     <p className="text-gray-900">{selectedPartyDetails.customField1 || 'N/A'}</p>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                     <p className="text-gray-900">{new Date(selectedPartyDetails.createdAt).toLocaleDateString()}</p>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <div className="text-red-500 mb-4">
                     <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                     </svg>
                   </div>
                   <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Details</h3>
                   <p className="text-gray-500">Unable to fetch debit party details. Please try again.</p>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

interface DebitPartyFormProps {
  onSubmit: (data: Omit<DebitParty, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  initialData?: DebitParty;
  isSubmitting: boolean;
  isEditing: boolean;
}

const DebitPartyForm: React.FC<DebitPartyFormProps> = ({ onSubmit, onCancel, initialData, isSubmitting, isEditing }) => {
  const [formData, setFormData] = useState({
    partyName: initialData?.partyName || '',
    partyAddress1: initialData?.partyAddress1 || '',
    partyAddress2: initialData?.partyAddress2 || '',
    partyAddress3: initialData?.partyAddress3 || '',
    pinCode: initialData?.pinCode || '',
    gstNo: initialData?.gstNo || '',
    panNo: initialData?.panNo || '',
    iecNo: initialData?.iecNo || '',
    epcgLicNo: {
      lic1: initialData?.epcgLicNo?.lic1 || '',
      lic2: initialData?.epcgLicNo?.lic2 || '',
      lic3: initialData?.epcgLicNo?.lic3 || '',
    },
    epcgLicDate: initialData?.epcgLicDate || '',
    epcgLicExpiryReminder: initialData?.epcgLicExpiryReminder || '',
    customField1: initialData?.customField1 || '',
    status: initialData?.status || 'active' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isEditing ? (
        // Edit form - only show required fields
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Party Name *"
              value={formData.partyName}
              onChange={(e) => setFormData(prev => ({ ...prev, partyName: e.target.value }))}
              required
            />
            <Input
              label="Address Line 1 *"
              value={formData.partyAddress1}
              onChange={(e) => setFormData(prev => ({ ...prev, partyAddress1: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </>
      ) : (
        // Add form - show all fields
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Party Name *"
              value={formData.partyName}
              onChange={(e) => setFormData(prev => ({ ...prev, partyName: e.target.value }))}
              required
            />
            <Input
              label="PIN Code *"
              value={formData.pinCode}
              onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Address Line 1 *"
              value={formData.partyAddress1}
              onChange={(e) => setFormData(prev => ({ ...prev, partyAddress1: e.target.value }))}
              required
            />
            <Input
              label="Address Line 2"
              value={formData.partyAddress2}
              onChange={(e) => setFormData(prev => ({ ...prev, partyAddress2: e.target.value }))}
            />
            <Input
              label="Address Line 3"
              value={formData.partyAddress3}
              onChange={(e) => setFormData(prev => ({ ...prev, partyAddress3: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="GST No *"
              value={formData.gstNo}
              onChange={(e) => setFormData(prev => ({ ...prev, gstNo: e.target.value }))}
              required
            />
            <Input
              label="PAN No *"
              value={formData.panNo}
              onChange={(e) => setFormData(prev => ({ ...prev, panNo: e.target.value }))}
              required
            />
            <Input
              label="IEC No *"
              value={formData.iecNo}
              onChange={(e) => setFormData(prev => ({ ...prev, iecNo: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="EPCG License 1 *"
              value={formData.epcgLicNo.lic1}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                epcgLicNo: { ...prev.epcgLicNo, lic1: e.target.value }
              }))}
              required
            />
            <Input
              label="EPCG License 2"
              value={formData.epcgLicNo.lic2}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                epcgLicNo: { ...prev.epcgLicNo, lic2: e.target.value }
              }))}
            />
            <Input
              label="EPCG License 3"
              value={formData.epcgLicNo.lic3}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                epcgLicNo: { ...prev.epcgLicNo, lic3: e.target.value }
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="License Date *"
              type="date"
              value={formData.epcgLicDate}
              onChange={(e) => setFormData(prev => ({ ...prev, epcgLicDate: e.target.value }))}
              required
            />
            <Input
              label="License Expiry Reminder *"
              type="date"
              value={formData.epcgLicExpiryReminder}
              onChange={(e) => setFormData(prev => ({ ...prev, epcgLicExpiryReminder: e.target.value }))}
              required
            />
          </div>

          <div>
            <Input
              label="Custom Field 1"
              value={formData.customField1}
              onChange={(e) => setFormData(prev => ({ ...prev, customField1: e.target.value }))}
              placeholder="Enter custom value"
            />
          </div>
        </>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditing ? 'Update Debit Party' : 'Add Debit Party'}
        </Button>
      </div>
    </form>
  );
};
