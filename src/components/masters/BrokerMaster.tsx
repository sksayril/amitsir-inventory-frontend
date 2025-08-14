import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, X, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';

export const BrokerMaster: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    brokerName: '',
    customField1: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Broker list state
  const [brokers, setBrokers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch brokers from API when component mounts
  useEffect(() => {
    fetchBrokers();
  }, []);

  // Function to fetch brokers from API
  const fetchBrokers = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        isActive: selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined
      };
      
      const response = await api.get('/master-data/brokers', { params });
      
      if (response.data.success) {
        setBrokers(response.data.data || []);
        
        // Update pagination from API response
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination.totalItems || 0,
            totalPages: response.data.pagination.totalPages || 0
          }));
        }
      } else {
        setApiError(response.data.message || 'Failed to fetch brokers');
      }
    } catch (error: any) {
      console.error('Error fetching brokers:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch brokers';
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
        fetchBrokers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter effect
  useEffect(() => {
    if (selectedStatus !== '') {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchBrokers();
    }
  }, [selectedStatus]);

  // Pagination effect
  useEffect(() => {
    if (pagination.page > 1) {
      fetchBrokers();
    }
  }, [pagination.page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call the API to create broker
      const response = await api.post('/master-data/brokers', formData);
      
             if (response.data.success) {
         // Success - reset form and close modal
         setFormData({ brokerName: '', customField1: '' });
         setShowForm(false);
         
         // Refresh the broker list to show the new broker
         fetchBrokers();
         console.log('Broker created successfully:', response.data);
       } else {
        // Handle API error response
        console.error('API Error:', response.data.message);
        // TODO: Show error message to user
      }
    } catch (error: any) {
      console.error('Error creating broker:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create broker';
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ brokerName: '', customField1: '' });
    setShowForm(false);
  };

  // Function to handle refresh
  const handleRefresh = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchBrokers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Broker Master</h1>
          <p className="text-gray-600 mt-2">Manage your broker relationships and commission structures</p>
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
           <Button 
             onClick={() => setShowForm(true)}
             className="flex items-center space-x-2"
           >
             <Plus className="w-4 h-4" />
             <span>Add Broker Master</span>
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

       {/* Search and Filters */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
         <div className="flex flex-col sm:flex-row gap-4">
           <div className="flex-1">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
               <Input
                 type="text"
                 placeholder="Search by broker name..."
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
       
              {/* Brokers Table */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         {isLoading ? (
           <div className="flex items-center justify-center py-12">
             <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
             <span className="ml-2 text-gray-600">Loading brokers...</span>
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-gray-50 border-b border-gray-200">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Broker Name
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Custom Field 1
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Status
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Created At
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {brokers.length > 0 ? (
                   brokers.map((broker) => (
                     <tr key={broker._id || broker.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-medium text-gray-900">{broker.brokerName}</div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {broker.customField1 || 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           broker.isActive 
                             ? 'bg-green-100 text-green-800' 
                             : 'bg-red-100 text-red-800'
                         }`}>
                           {broker.isActive ? 'Active' : 'Inactive'}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {broker.createdAt ? new Date(broker.createdAt).toLocaleDateString() : 'N/A'}
                       </td>
                     </tr>
                   ))
                 ) : (
                   <tr>
                     <td colSpan={4} className="px-6 py-12 text-center">
                       <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                       <h3 className="text-lg font-medium text-gray-900 mb-2">No Brokers Found</h3>
                       <p className="text-gray-500">
                         {searchTerm || selectedStatus ? 'Try adjusting your search or filters.' : 'Get started by adding your first broker.'}
                       </p>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
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

       {/* Add Broker Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Broker</h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Broker Name *"
                  value={formData.brokerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brokerName: e.target.value }))}
                  required
                />

                <Input
                  label="Custom Field 1"
                  value={formData.customField1}
                  onChange={(e) => setFormData(prev => ({ ...prev, customField1: e.target.value }))}
                  placeholder="Enter custom value"
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Add Broker
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
