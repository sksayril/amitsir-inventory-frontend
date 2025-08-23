import React, { useState, useEffect } from 'react';
import { Receipt, Plus, X, Loader2, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';

export const ReceiptMaster: React.FC = () => {
  // Helper function to format amounts, handling both numbers and strings
  const formatAmount = (amount: any) => {
    if (typeof amount === 'number') {
      return amount.toFixed(2);
    }
    if (typeof amount === 'string' && !isNaN(parseFloat(amount))) {
      return parseFloat(amount).toFixed(2);
    }
    return amount || 'N/A';
  };

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

  const handlePendingBillsClick = () => {
    setShowCreditPartySelectionModal(true);
  };

      const fetchPendingBills = async () => {
    if (!selectedCreditPartyForPending) {
      setNotification({
        type: 'info',
        message: 'Please select a credit party.',
        show: true,
      });
      return;
    }

    setShowCreditPartySelectionModal(false);
    setShowPendingBillsModal(true);
    setIsLoadingPendingBills(true);
    setPendingBillsData([]);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken') || localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/receipt-transactions/pending-bills', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { creditPartyId: selectedCreditPartyForPending }
      });

      if (response.data.success) {
        setPendingBillsData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch pending bills.');
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred while fetching pending bills.',
        show: true
      });
      setPendingBillsData([]);
    } finally {
      setIsLoadingPendingBills(false);
    }
  };

  const handleAddNewClick = () => {
    setFormData({
      receiptDate: '2024-01-15',
      creditPartyId: '64f8a1b2c3d4e5f6a7b8c9d0',
      billNumber: 'ABC0001',
      billAmount: '18812.50',
      receiptAmount: '2500.00',
      currency: 'USD',
      exchangeRate: '83.25',
      utrNumber: 'UTR123456789012',
      remarks: 'Partial payment received for cotton fabric order',
      customField1: 'Custom Value 1'
    });
    setShowForm(true);
  };
  
  // Credit parties state
  const [creditParties, setCreditParties] = useState<any[]>([]);
  const [isLoadingCreditParties, setIsLoadingCreditParties] = useState(false);
  
  // Receipt transactions state
  const [receiptTransactions, setReceiptTransactions] = useState<any[]>([]);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);
  const [receiptsError, setReceiptsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreditPartyForSearch, setSelectedCreditPartyForSearch] = useState<string>('');
  const [showCreditPartySearchModal, setShowCreditPartySearchModal] = useState(false);
  const [paymentStatuses, setPaymentStatuses] = useState<{ [key: string]: string }>({});
  
  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Status modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalData, setStatusModalData] = useState<any>(null);
  const [isLoadingStatusModal, setIsLoadingStatusModal] = useState(false);

  // Delete confirmation modal state
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<any>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    show: boolean;
  } | null>(null);

  // Fetch credit parties when component mounts
  useEffect(() => {
    fetchCreditParties();
    fetchReceiptTransactions();
  }, []);

  // Pending bills modal state
  const [showPendingBillsModal, setShowPendingBillsModal] = useState(false);
  const [pendingBillsData, setPendingBillsData] = useState<any[]>([]);
  const [isLoadingPendingBills, setIsLoadingPendingBills] = useState(false);
  const [showCreditPartySelectionModal, setShowCreditPartySelectionModal] = useState(false);
  const [selectedCreditPartyForPending, setSelectedCreditPartyForPending] = useState<string>('');
  


  // Notification state

  // Function to search receipts by bill number
  const searchReceiptsByBillNumber = async (billNumber: string) => {
    try {
      setIsLoadingReceipts(true);
      setReceiptsError(null);
      
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get(`/receipt-transactions/search/bill-number/${billNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // API might return a single object or an array, ensure it's always an array
        const result = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setReceiptTransactions(result.filter(Boolean)); // Filter out null/undefined if single not found
      } else {
        setReceiptTransactions([]); // Clear results if not found or error
        setReceiptsError(response.data.message || 'Failed to search for receipt');
      }
    } catch (error: any) {
      console.error('Error searching for receipt:', error);
      setReceiptTransactions([]);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to search for receipt';
      setReceiptsError(errorMessage);
    } finally {
      setIsLoadingReceipts(false);
    }
  };

  // Function to search receipts by credit party ID
  const searchReceiptsByCreditParty = async (partyId: string) => {
    try {
      setIsLoadingReceipts(true);
      setReceiptsError(null);
      
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get(`/receipt-transactions/credit-party/${partyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const result = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setReceiptTransactions(result.filter(Boolean));
      } else {
        setReceiptTransactions([]);
        setReceiptsError(response.data.message || 'Failed to search for receipts');
      }
    } catch (error: any) {
      console.error('Error searching for receipts:', error);
      setReceiptTransactions([]);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to search for receipts';
      setReceiptsError(errorMessage);
    } finally {
      setIsLoadingReceipts(false);
    }
  };

  // Debounced search effects
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery) {
        searchReceiptsByBillNumber(searchQuery);
      } else {
        // If search query is cleared and no party is selected for search, fetch all.
        if (!selectedCreditPartyForSearch) {
          fetchReceiptTransactions();
        }
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Effect to fetch bill payment status for each transaction
  useEffect(() => {
    const fetchPaymentStatuses = async () => {
      if (receiptTransactions.length === 0) return;

      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('userToken');

      if (!token) return;

      const initialStatuses: { [key: string]: string } = {};
      receiptTransactions.forEach(receipt => {
        if (receipt.billNumber) {
          initialStatuses[receipt.billNumber] = 'Loading...';
        }
      });
      setPaymentStatuses(prev => ({ ...prev, ...initialStatuses }));

      const promises = receiptTransactions.map(async (receipt) => {
        if (!receipt.billNumber) return null;

        try {
          const response = await api.get(`/receipt-transactions/bill-adjustment/${receipt.billNumber}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.data.success && response.data.data?.paymentSummary?.paymentStatus) {
            return { billNumber: receipt.billNumber, status: response.data.data.paymentSummary.paymentStatus };
          } else {
            return { billNumber: receipt.billNumber, status: 'Not Found' };
          }
        } catch (error) {
          return { billNumber: receipt.billNumber, status: 'Error' };
        }
      });

      const results = await Promise.all(promises);
      const newStatuses: { [key: string]: string } = {};
      results.forEach(result => {
        if (result) {
          newStatuses[result.billNumber] = result.status;
        }
      });

      setPaymentStatuses(prev => ({ ...prev, ...newStatuses }));
    };

    fetchPaymentStatuses();
  }, [receiptTransactions]);

  // Function to handle clicking on a payment status
  const handleStatusClick = async (e: React.MouseEvent, billNumber: string) => {
    e.stopPropagation(); // Prevent row click from firing
    if (!billNumber) return;

    setShowStatusModal(true);
    setIsLoadingStatusModal(true);
    setStatusModalData(null);

    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get(`/receipt-transactions/bill-adjustment/${billNumber}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setStatusModalData(response.data);
    } catch (error: any) {
      setStatusModalData({ error: true, message: error.message || 'Failed to fetch status details.' });
    } finally {
      setIsLoadingStatusModal(false);
    }
  };

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

      let response;
      const isEditing = selectedReceipt && (selectedReceipt._id || selectedReceipt.id);

      if (isEditing) {
        // Update existing receipt transaction - only send updatable fields
        const receiptId = selectedReceipt._id || selectedReceipt.id;
        const updateData = {
          receiptAmount: parseFloat(formData.receiptAmount),
          exchangeRate: formData.exchangeRate ? parseFloat(formData.exchangeRate) : undefined,
          utrNumber: formData.utrNumber,
          remarks: formData.remarks
        };
        
        response = await api.put(`/receipt-transactions/${receiptId}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Create new receipt transaction
        response = await api.post('/receipt-transactions', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
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
        setSelectedReceipt(null);
        
        // Refresh the receipt list to show the updated/new transaction
        fetchReceiptTransactions();
        
        const action = isEditing ? 'updated' : 'created';
        console.log(`Receipt transaction ${action} successfully:`, response.data);
        showNotification('success', `Receipt transaction ${action} successfully!`);
      } else {
        // Handle API error response
        console.error('API Error:', response.data.message);
        showNotification('error', `Error: ${response.data.message || 'Operation failed'}`);
      }
    } catch (error: any) {
      console.error('Error saving receipt transaction:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save receipt transaction';
      showNotification('error', `Error: ${errorMessage}`);
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

  // Function to fetch receipt details by ID
  const fetchReceiptDetail = async (id: string) => {
    try {
      setIsLoadingDetail(true);
      setDetailError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get(`/receipt-transactions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setSelectedReceipt(response.data.data);
        setShowDetailModal(true);
      } else {
        setDetailError(response.data.message || 'Failed to fetch receipt details');
      }
    } catch (error: any) {
      console.error('Error fetching receipt details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch receipt details';
      setDetailError(errorMessage);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Function to handle row click
  const handleRowClick = (receipt: any) => {
    const receiptId = receipt._id || receipt.id;
    if (receiptId) {
      fetchReceiptDetail(receiptId);
    }
  };

  // Function to close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReceipt(null);
    setDetailError(null);
  };

  // Function to show notification
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, show: true });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Function to hide notification
  const hideNotification = () => {
    setNotification(null);
  };

  // Function to handle edit receipt
  const handleEditReceipt = (receipt: any) => {
    // Set form data with existing receipt data
    setFormData({
      receiptDate: receipt.receiptDate ? receipt.receiptDate.split('T')[0] : '',
      creditPartyId: receipt.creditPartyId || '',
      billNumber: receipt.billNumber || '',
      billAmount: receipt.billAmount?.toString() || '',
      receiptAmount: receipt.receiptAmount?.toString() || '',
      currency: receipt.currency || 'USD',
      exchangeRate: receipt.exchangeRate?.toString() || '',
      utrNumber: receipt.utrNumber || '',
      remarks: receipt.remarks || '',
      customField1: receipt.customField1 || ''
    });
    
    // Store the receipt being edited
    setSelectedReceipt(receipt);
    
    // Show the form modal
    setShowForm(true);
  };

  // Function to initiate delete receipt
  const handleDeleteReceipt = (receipt: any) => {
    setReceiptToDelete(receipt);
    setShowDeleteConfirmModal(true);
  };

  // Function to confirm and execute deletion
  const confirmDelete = async () => {
    if (!receiptToDelete) return;

    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken') ||
                    localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const receiptId = receiptToDelete._id || receiptToDelete.id;
      const response = await api.delete(`/receipt-transactions/${receiptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setNotification({
          type: 'success',
          message: 'Receipt transaction deleted successfully!',
          show: true
        });
        fetchReceiptTransactions(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to delete receipt transaction');
      }
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'An error occurred while deleting the receipt transaction.',
        show: true
      });
    } finally {
      setShowDeleteConfirmModal(false);
      setReceiptToDelete(null);
    }
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
           <div className="flex items-center space-x-2">
          <Button onClick={handlePendingBillsClick} variant="secondary">
            Pending Bills
          </Button>
          <Button onClick={handleAddNewClick}>
            <Plus className="w-5 h-5 mr-2" />
            Receipt Transaction
          </Button>
        </div>
      </div>
    </div>

    {/* Search Inputs */}
    <div className="flex space-x-4 mb-4">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input 
          placeholder="Search by Bill Number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 pl-10 border rounded-md shadow-sm"
        />
      </div>
      <div className="flex-1">
        <Button onClick={() => setShowCreditPartySearchModal(true)} className="w-full">
          <Search className="mr-2 h-4 w-4" /> Search by Credit Party
        </Button>
      </div>
    </div>

       {/* Notification Display */}
       {notification && (
         <div className={`rounded-lg p-4 border transition-all duration-300 ${
           notification.type === 'success' 
             ? 'bg-green-50 border-green-200 text-green-800' 
             : notification.type === 'error'
             ? 'bg-red-50 border-red-200 text-red-800'
             : 'bg-blue-50 border-blue-200 text-blue-800'
         }`}>
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <div className="flex-shrink-0">
                 {notification.type === 'success' ? (
                   <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                   </svg>
                 ) : notification.type === 'error' ? (
                   <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                   </svg>
                 ) : (
                   <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                   </svg>
                 )}
               </div>
               <div>
                 <p className="text-sm font-medium">{notification.message}</p>
               </div>
             </div>
             <button
               onClick={hideNotification}
               className="text-gray-400 hover:text-gray-600 transition-colors"
             >
               <X className="h-4 w-4" />
             </button>
           </div>
         </div>
       )}
       
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
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Created At
                       </th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Payment Status
                       </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Actions
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {receiptTransactions.length > 0 ? (
                   receiptTransactions.map((receipt) => (
                     <tr 
                       key={receipt._id || receipt.id} 
                       className="hover:bg-gray-50 cursor-pointer transition-colors"
                       onClick={() => handleRowClick(receipt)}
                     >
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
                       <td 
                         className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:underline"
                         onClick={(e) => handleStatusClick(e, receipt.billNumber)}
                       >
                         {paymentStatuses[receipt.billNumber] || 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center space-x-2">
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleEditReceipt(receipt);
                             }}
                             className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                             title="Edit Receipt"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                             </svg>
                           </button>
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDeleteReceipt(receipt);
                             }}
                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                             title="Delete Receipt"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))
                 ) : (
                   <tr>
                     <td colSpan={8} className="px-6 py-12 text-center">
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
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedReceipt ? 'Edit Receipt Transaction' : 'Create Receipt Transaction'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!selectedReceipt ? (
                  // Create form - show all fields
                  <>
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
                  </>
                ) : (
                  // Edit form - show only updatable fields
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Receipt Amount *"
                        type="number"
                        step="0.01"
                        value={formData.receiptAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiptAmount: e.target.value }))}
                        placeholder="Enter receipt amount"
                        required
                      />

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
                  </>
                )}

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
                    {selectedReceipt ? 'Update Receipt' : 'Create Receipt'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Receipt Transaction Details</h2>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <span className="ml-2 text-gray-600">Loading receipt details...</span>
                </div>
              ) : detailError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{detailError}</p>
                    </div>
                  </div>
                </div>
              ) : selectedReceipt ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Receipt ID:</span>
                          <span className="text-sm text-gray-900">{selectedReceipt._id || selectedReceipt.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Receipt Date:</span>
                          <span className="text-sm text-gray-900">
                            {selectedReceipt.receiptDate ? new Date(selectedReceipt.receiptDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Created At:</span>
                          <span className="text-sm text-gray-900">
                            {selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Updated At:</span>
                          <span className="text-sm text-gray-900">
                            {selectedReceipt.updatedAt ? new Date(selectedReceipt.updatedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Bill Number:</span>
                          <span className="text-sm text-gray-900">{selectedReceipt.billNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Bill Amount:</span>
                          <span className="text-sm text-gray-900">
                            {selectedReceipt.billAmount ? `${selectedReceipt.currency || '$'}${selectedReceipt.billAmount.toFixed(2)}` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Receipt Amount:</span>
                          <span className="text-sm text-gray-900">
                            {selectedReceipt.receiptAmount ? `${selectedReceipt.currency || '$'}${selectedReceipt.receiptAmount.toFixed(2)}` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Currency:</span>
                          <span className="text-sm text-gray-900">{selectedReceipt.currency || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">UTR Number:</span>
                          <span className="text-sm text-gray-900">{selectedReceipt.utrNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Exchange Rate:</span>
                          <span className="text-sm text-gray-900">{selectedReceipt.exchangeRate || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Credit Party ID:</span>
                          <span className="text-sm text-gray-900">{selectedReceipt.creditPartyId || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Remarks:</span>
                          <span className="text-sm text-gray-900">{selectedReceipt.remarks || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Custom Field 1:</span>
                          <span className="text-sm text-gray-900">{selectedReceipt.customField1 || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Raw API Response (for debugging) */}
                  {/* <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">API Response Data</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(selectedReceipt, null, 2)}
                      </pre>
                    </div>
                  </div> */}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Status Detail Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Payment Status Details</h2>
              <Button onClick={() => setShowStatusModal(false)} className="p-1 h-auto w-auto bg-transparent hover:bg-gray-200 text-gray-800">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto">
              {isLoadingStatusModal ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {statusModalData?.success && statusModalData.data ? (
                    <div className="space-y-6">
                      {/* Payment Summary */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Summary</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <span className="font-medium text-gray-600">Status:</span>
                          <span className={`font-semibold ${statusModalData.data.paymentSummary?.isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                            {statusModalData.data.paymentSummary?.paymentStatus || 'N/A'}
                          </span>
                          <span className="font-medium text-gray-600">Total Bill:</span>
                          <span>{formatAmount(statusModalData.data.paymentSummary?.totalBillAmount)}</span>
                          <span className="font-medium text-gray-600">Total Received:</span>
                          <span>{formatAmount(statusModalData.data.paymentSummary?.totalReceivedAmount)}</span>
                          <span className="font-medium text-gray-600">Pending Amount:</span>
                          <span>{formatAmount(statusModalData.data.paymentSummary?.pendingAmount)}</span>
                        </div>
                      </div>

                      {/* Bill Details */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill Details</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <span className="font-medium text-gray-600">Bill Number:</span>
                          <span>{statusModalData.data.billNumber || 'N/A'}</span>
                          <span className="font-medium text-gray-600">Credit Party:</span>
                          <span>{statusModalData.data.billDetails?.creditParty || 'N/A'}</span>
                          <span className="font-medium text-gray-600">Bill Date:</span>
                          <span>{statusModalData.data.billDetails?.billDate ? new Date(statusModalData.data.billDetails.billDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>

                      {/* Currency Breakdown */}
                      {statusModalData.data.currencyBreakdown && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Currency Breakdown</h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            {Object.entries(statusModalData.data.currencyBreakdown).map(([currency, amount]) => (
                              <React.Fragment key={currency}>
                                <span className="font-medium text-gray-600">{currency}:</span>
                                <span>{formatAmount(amount)}</span>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Receipt Transactions */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Receipt History</h3>
                        <div className="overflow-x-auto border rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">UTR</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {statusModalData.data.receiptTransactions?.map((tx: any, index: number) => (
                                <tr key={index}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">{tx.receiptDate ? new Date(tx.receiptDate).toLocaleDateString() : 'N/A'}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">{`${formatAmount(tx.amount)} ${tx.currency}`}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">{tx.utrNumber}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600">
                      <p>Could not load payment status details.</p>
                      {statusModalData?.message && <p className="text-red-500 text-sm mt-2">Error: {statusModalData.message}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && receiptToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete this receipt transaction?
              </p>
              <div className="mt-4 bg-gray-50 p-3 rounded-md text-sm">
                <p><span className="font-semibold">Bill Number:</span> {receiptToDelete.billNumber || 'N/A'}</p>
                <p><span className="font-semibold">Amount:</span> {`${formatAmount(receiptToDelete.receiptAmount)} ${receiptToDelete.currency}`}</p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Bills Modal */}
      {showPendingBillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Pending Bills</h2>
              <Button onClick={() => setShowPendingBillsModal(false)} className="p-1 h-auto w-auto bg-transparent hover:bg-gray-200 text-gray-800">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto">
              {isLoadingPendingBills ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
              ) : (
                pendingBillsData.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bill Number</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bill Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pending Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingBillsData.map((bill: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{bill.billNumber || 'N/A'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatAmount(bill.totalAmount)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatAmount(bill.pendingAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-600">
                    <p>No pending bills found for the selected credit party.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credit Party Selection Modal for Pending Bills */}
      {showCreditPartySelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Select Credit Party</h2>
              <Button onClick={() => setShowCreditPartySelectionModal(false)} className="p-1 h-auto w-auto bg-transparent hover:bg-gray-200 text-gray-800">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <label htmlFor="credit-party-select" className="block text-sm font-medium text-gray-700">Credit Party</label>
              <select
                id="credit-party-select"
                value={selectedCreditPartyForPending}
                onChange={(e) => setSelectedCreditPartyForPending(e.target.value)}
                className="w-full p-2 border rounded-md shadow-sm"
              >
                <option value="" disabled>-- Select a party --</option>
                {creditParties.map((party) => (
                  <option key={party._id} value={party._id}>
                    {party.partyName}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowCreditPartySelectionModal(false)}>
                Cancel
              </Button>
              <Button onClick={fetchPendingBills}>
                Show Bills
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Party Search Modal */}
      {showCreditPartySearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Search by Credit Party</h2>
              <Button onClick={() => setShowCreditPartySearchModal(false)} className="p-1 h-auto w-auto bg-transparent hover:bg-gray-200 text-gray-800">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <label htmlFor="credit-party-search-select" className="block text-sm font-medium text-gray-700">Credit Party</label>
              <select
                id="credit-party-search-select"
                value={selectedCreditPartyForSearch}
                onChange={(e) => setSelectedCreditPartyForSearch(e.target.value)}
                className="w-full p-2 border rounded-md shadow-sm"
              >
                <option value="" disabled>-- Select a party to filter by --</option>
                {creditParties.map((party) => (
                  <option key={party._id} value={party._id}>
                    {party.partyName}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-between">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedCreditPartyForSearch('');
                  setShowCreditPartySearchModal(false);
                }}
              >
                Clear Filter
              </Button>
              <div className="flex space-x-3">
                <Button variant="secondary" onClick={() => setShowCreditPartySearchModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (selectedCreditPartyForSearch) {
                    setSearchQuery(''); // Clear bill number search
                    searchReceiptsByCreditParty(selectedCreditPartyForSearch);
                  }
                  setShowCreditPartySearchModal(false);
                }}>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
