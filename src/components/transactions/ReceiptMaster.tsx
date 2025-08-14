import React, { useState, useEffect } from 'react';
import { Receipt, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';

export const ReceiptMaster: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    receiptDate: '',
    creditPartyId: '',
    billNumber: '',
    billAmount: '',
    receiptAmount: '',
    currency: 'USD',
    exchangeRate: '',
    utrNumber: '',
    remarks: '',
    customField1: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Credit parties state
  const [creditParties, setCreditParties] = useState<any[]>([]);
  const [isLoadingCreditParties, setIsLoadingCreditParties] = useState(false);
  
  // Receipt transactions state
  const [receiptTransactions, setReceiptTransactions] = useState<any[]>([]);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  const [receiptsError, setReceiptsError] = useState<string | null>(null);

  // Fetch credit parties when component mounts
  useEffect(() => {
    fetchCreditParties();
    fetchReceiptTransactions();
  }, []);

  // Function to fetch credit parties from API
  const fetchCreditParties = async () => {
    try {
      setIsLoadingCreditParties(true);
      
      const response = await api.get('/master-data/credit-parties', {
        params: {
          page: 1,
          limit: 10,
          search: '',
          isActive: true
        }
      });
      
      if (response.data.success) {
        setCreditParties(response.data.data || []);
      } else {
        console.error('Failed to fetch credit parties:', response.data.message);
      }
    } catch (error: any) {
      console.error('Error fetching credit parties:', error);
    } finally {
      setIsLoadingCreditParties(false);
    }
  };

  // Function to fetch receipt transactions from API
  const fetchReceiptTransactions = async () => {
    try {
      setIsLoadingReceipts(true);
      setReceiptsError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/receipt-transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setReceiptTransactions(response.data.data || []);
      } else {
        setReceiptsError(response.data.message || 'Failed to fetch receipt transactions');
      }
    } catch (error: any) {
      console.error('Error fetching receipt transactions:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch receipt transactions';
      setReceiptsError(errorMessage);
    } finally {
      setIsLoadingReceipts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get token from localStorage - try multiple possible keys
      let token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('accessToken') ||
                  localStorage.getItem('userToken');
      
      if (!token) {
        console.error('Available localStorage keys:', Object.keys(localStorage));
        throw new Error('No authentication token found in localStorage');
      }

      console.log('Token found and will be sent:', token.substring(0, 20) + '...');

      // Call the API to create receipt transaction with token
      const response = await api.post('/receipt-transactions', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Success - reset form and close modal
        setFormData({
          receiptDate: '',
          creditPartyId: '',
          billNumber: '',
          billAmount: '',
          receiptAmount: '',
          currency: 'USD',
          exchangeRate: '',
          utrNumber: '',
          remarks: '',
          customField1: ''
        });
        setShowForm(false);
        
        // Refresh the receipt list to show the new transaction
        fetchReceiptTransactions();
        console.log('Receipt transaction created successfully:', response.data);
      } else {
        // Handle API error response
        console.error('API Error:', response.data.message);
        // TODO: Show error message to user
      }
    } catch (error: any) {
      console.error('Error creating receipt transaction:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create receipt transaction';
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      receiptDate: '',
      creditPartyId: '',
      billNumber: '',
      billAmount: '',
      receiptAmount: '',
      currency: 'USD',
      exchangeRate: '',
      utrNumber: '',
      remarks: '',
      customField1: ''
    });
    setShowForm(false);
  };

  // Function to handle refresh
  const handleRefresh = () => {
    fetchReceiptTransactions();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receipt Transactions</h1>
          <p className="text-gray-600 mt-2">Manage your payment receipts and financial transactions</p>
        </div>
                 <div className="flex items-center space-x-3">
           <Button 
             onClick={handleRefresh}
             disabled={isLoadingReceipts}
             variant="secondary"
             className="flex items-center space-x-2"
           >
             <Loader2 className={`w-4 h-4 ${isLoadingReceipts ? 'animate-spin' : ''}`} />
             <span>Refresh</span>
           </Button>
           <Button 
             onClick={() => setShowForm(true)}
             className="flex items-center space-x-2"
           >
             <Plus className="w-4 h-4" />
             <span>Receipt Transaction</span>
           </Button>
         </div>
             </div>
       
       {/* API Error Display */}
       {receiptsError && (
         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center">
               <div className="flex-shrink-0">
                 <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                 </svg>
               </div>
               <div className="ml-3">
                 <p className="text-sm text-red-800">{receiptsError}</p>
               </div>
             </div>
             <button
               onClick={() => setReceiptsError(null)}
               className="text-red-400 hover:text-red-600"
             >
               <X className="h-4 w-4" />
             </button>
           </div>
         </div>
       )}

       {/* Receipt Transactions Table */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         {isLoadingReceipts ? (
           <div className="flex items-center justify-center py-12">
             <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
             <span className="ml-2 text-gray-600">Loading receipt transactions...</span>
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-gray-50 border-b border-gray-200">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Receipt Date
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Bill Number
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Bill Amount
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Receipt Amount
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Currency
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     UTR Number
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Created At
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {receiptTransactions.length > 0 ? (
                   receiptTransactions.map((receipt) => (
                     <tr key={receipt._id || receipt.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-medium text-gray-900">
                           {receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : 'N/A'}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {receipt.billNumber || 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {receipt.billAmount ? `$${receipt.billAmount.toFixed(2)}` : 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {receipt.receiptAmount ? `$${receipt.receiptAmount.toFixed(2)}` : 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {receipt.currency || 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {receipt.utrNumber || 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : 'N/A'}
                       </td>
                     </tr>
                   ))
                 ) : (
                   <tr>
                     <td colSpan={7} className="px-6 py-12 text-center">
                       <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                       <h3 className="text-lg font-medium text-gray-900 mb-2">No Receipt Transactions Found</h3>
                       <p className="text-gray-500">Get started by creating your first receipt transaction.</p>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
         )}
       </div>

      {/* Receipt Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Receipt Transaction</h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <Input
                     label="Receipt Date *"
                     type="date"
                     value={formData.receiptDate}
                     onChange={(e) => setFormData(prev => ({ ...prev, receiptDate: e.target.value }))}
                     required
                   />

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Credit Party Name *
                     </label>
                     {isLoadingCreditParties ? (
                       <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                         <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                         <span className="text-sm text-gray-500">Loading credit parties...</span>
                       </div>
                     ) : (
                       <select
                         value={formData.creditPartyId}
                         onChange={(e) => setFormData(prev => ({ ...prev, creditPartyId: e.target.value }))}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         required
                       >
                         <option value="">Select Credit Party</option>
                         {creditParties.map((party) => (
                           <option key={party._id} value={party._id}>
                             {party.partyName}
                           </option>
                         ))}
                       </select>
                     )}
                   </div>

                   <Input
                    label="Bill Number *"
                    value={formData.billNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, billNumber: e.target.value }))}
                    placeholder="Enter bill number"
                    required
                  />

                  <Input
                    label="Bill Amount *"
                    type="number"
                    step="0.01"
                    value={formData.billAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, billAmount: e.target.value }))}
                    placeholder="Enter bill amount"
                    required
                  />

                  <Input
                    label="Receipt Amount *"
                    type="number"
                    step="0.01"
                    value={formData.receiptAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, receiptAmount: e.target.value }))}
                    placeholder="Enter receipt amount"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency *
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <Input
                    label="Exchange Rate"
                    type="number"
                    step="0.01"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, exchangeRate: e.target.value }))}
                    placeholder="Enter exchange rate"
                  />

                  <Input
                    label="UTR Number"
                    value={formData.utrNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, utrNumber: e.target.value }))}
                    placeholder="Enter UTR number"
                  />
                </div>

                <Input
                  label="Remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Enter remarks"
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
                    Create Receipt
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
