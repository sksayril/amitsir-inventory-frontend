import React, { useState, useEffect } from 'react';
import { Item } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Search, Edit, Trash2, Package,  AlertTriangle, X, Loader2 } from 'lucide-react';
import api from '../../services/api';

export const ItemMaster: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch items from API
  const fetchItems = async (page = 1, search = '', isActive?: boolean) => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(isActive !== undefined && { isActive: isActive.toString() })
      });
      
      const response = await api.get(`/master-data/items?${params}`);
      
      if (response.data.success) {
        const { data, pagination: paginationData } = response.data;
        
        // Transform API response to match Item type
        const transformedItems: Item[] = data.map((item: any) => ({
          id: item.id || item._id,
          name: item.itemName || item.name,
          category: item.category || 'General',
          hsnCode: item.itemHsn || item.hsnCode,
          unit: item.itemUnits || item.unit,
          currentStock: item.itemQty || item.currentStock || 0,
          minStock: item.minStock || 0,
          maxStock: item.maxStock || 0,
          purchasePrice: item.itemRate?.inr || item.purchasePrice || 0,
          sellingPrice: item.itemRate?.usd || item.sellingPrice || 0,
          description: item.remarks || item.description || '',
          status: item.isActive ? 'active' : 'inactive',
          createdAt: item.createdAt || new Date().toISOString(),
        }));
        
        setItems(transformedItems);
        setPagination(prev => ({
          ...prev,
          page,
          total: paginationData?.total || 0,
          totalPages: paginationData?.totalPages || 0
        }));
      } else {
        setApiError(response.data.message || 'Failed to fetch items');
      }
    } catch (error: any) {
      console.error('Error fetching items:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch items';
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch items when search or filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItems(1, searchTerm, selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddItem = async (itemData: {
    itemName: string;
    itemHsn: string;
    itemQty: number;
    itemUnits: string;
    itemRate: { inr: number; usd: number };
    remarks: string;
    customField1: string;
  }) => {
    try {
      setIsSubmitting(true);
      setApiError(null);
      
      // Prepare the API request body
      const apiRequestBody = {
        itemName: itemData.itemName,
        itemHsn: itemData.itemHsn,
        itemQty: itemData.itemQty,
        itemUnits: itemData.itemUnits,
        itemRate: itemData.itemRate,
        remarks: itemData.remarks,
        customField1: itemData.customField1
      };

      // Call the API
      const response = await api.post('/master-data/items', apiRequestBody);
      
      if (response.data.success) {
        // Create a new item for local state (you can also refresh from API)
    const newItem: Item = {
          id: response.data.data?.id || Date.now().toString(),
          name: itemData.itemName,
          category: 'General', // Default category since it's not in the new form
          hsnCode: itemData.itemHsn,
          unit: itemData.itemUnits,
          currentStock: itemData.itemQty,
          minStock: 0, // Default value since it's not in the new form
          maxStock: itemData.itemQty * 2, // Default value since it's not in the new form
          purchasePrice: itemData.itemRate.inr,
          sellingPrice: itemData.itemRate.usd,
          description: itemData.remarks,
          status: 'active', // Default status since it's not in the new form
      createdAt: new Date().toISOString(),
    };
        
    setShowForm(false);
        
        // Refresh the items list
        await fetchItems(pagination.page, searchTerm, selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined);
        
        // Success - item added to list
      } else {
        setApiError(response.data.message || 'Failed to add item');
      }
    } catch (error: any) {
      console.error('Error adding item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add item';
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = async (itemData: {
    itemName: string;
    itemHsn: string;
    itemQty: number;
    itemUnits: string;
    itemRate: { inr: number; usd: number };
    remarks: string;
    customField1: string;
  }) => {
    if (editingItem) {
      try {
        setIsSubmitting(true);
        setApiError(null);
        
        // Prepare the API request body
        const apiRequestBody = {
          itemName: itemData.itemName,
          itemHsn: itemData.itemHsn,
          itemQty: itemData.itemQty,
          itemUnits: itemData.itemUnits,
          itemRate: itemData.itemRate,
          remarks: itemData.remarks,
          customField1: itemData.customField1
        };

        // Call the API to update the item
        const response = await api.put(`/master-data/items/${editingItem.id}`, apiRequestBody);
        
        if (response.data.success) {
          const updatedItem: Item = {
            ...editingItem,
            name: itemData.itemName,
            hsnCode: itemData.itemHsn,
            unit: itemData.itemUnits,
            currentStock: itemData.itemQty,
            purchasePrice: itemData.itemRate.inr,
            sellingPrice: itemData.itemRate.usd,
            description: itemData.remarks,
          };
      setEditingItem(undefined);
      setShowForm(false);
          
          // Refresh the items list
          await fetchItems(pagination.page, searchTerm, selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined);
          
          // Success - item updated in list
        } else {
          setApiError(response.data.message || 'Failed to update item');
        }
      } catch (error: any) {
        console.error('Error updating item:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update item';
        setApiError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteItem = (id: string) => {
      setItems(prev => prev.filter(i => i.id !== id));
  };

  const startEdit = (item: Item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };

  const handleItemClick = async (itemId: string) => {
    try {
      setIsLoadingDetails(true);
      setApiError(null);
      
      const response = await api.get(`/master-data/items/${itemId}`);
      
      if (response.data.success) {
        setSelectedItemDetails(response.data.data);
        setShowDetailsModal(true);
      } else {
        setApiError(response.data.message || 'Failed to fetch item details');
      }
    } catch (error: any) {
      console.error('Error fetching item details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch item details';
      setApiError(errorMessage);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Item Master</h1>
          <p className="text-gray-600 mt-2">Manage your inventory items and products</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </Button>
      </div>

      {/* API Error Display */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search items by name, HSN, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category === 'All' ? '' : category}>
                {category}
              </option>
            ))}
          </select>
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
      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         {isLoading ? (
           <div className="flex items-center justify-center py-12">
             <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
             <span className="text-gray-600">Loading items...</span>
           </div>
         ) : (
           <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HSN & Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock & Units
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
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
              {filteredItems.map((item) => {
                const isLowStock = item.currentStock <= item.minStock;
                return (
                                               <tr 
                          key={item.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleItemClick(item.id)}
                        >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">HSN: {item.hsnCode}</div>
                        <div className="text-gray-500">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${isLowStock ? 'text-amber-600' : 'text-gray-900'}`}>
                            {item.currentStock}
                          </span>
                          <span className="text-gray-500">/ {item.maxStock}</span>
                          {isLowStock && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                        </div>
                        <div className="text-gray-500">Unit: {item.unit}</div>
                        <div className="text-xs text-gray-400">Min: {item.minStock}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">₹{item.sellingPrice.toFixed(2)}</div>
                        <div className="text-gray-500">Cost: ₹{item.purchasePrice.toFixed(2)}</div>
                        <div className="text-xs text-gray-400">Margin: ₹{(item.sellingPrice - item.purchasePrice).toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">Start by adding your first item to the inventory.</p>
          </div>
             )}

             {/* Pagination */}
             {pagination.totalPages > 1 && (
               <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                 <div className="text-sm text-gray-700">
                   Showing page {pagination.page} of {pagination.totalPages} 
                   ({pagination.total} total items)
                 </div>
                 <div className="flex items-center space-x-2">
                   <Button
                     variant="secondary"
                     onClick={() => fetchItems(pagination.page - 1, searchTerm, selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined)}
                     disabled={pagination.page <= 1}
                     className="px-3 py-2"
                   >
                     Previous
                   </Button>
                   <span className="px-3 py-2 text-sm text-gray-700">
                     {pagination.page}
                   </span>
                   <Button
                     variant="secondary"
                     onClick={() => fetchItems(pagination.page + 1, searchTerm, selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined)}
                     disabled={pagination.page >= pagination.totalPages}
                     className="px-3 py-2"
                   >
                     Next
                   </Button>
                 </div>
               </div>
             )}
           </>
        )}
      </div>

      {/* Item Form Modal */}
      {showForm && (
        <ItemForm
          item={editingItem}
          onSubmit={editingItem ? handleEditItem : handleAddItem}
          onCancel={handleCancel}
           isSubmitting={isSubmitting}
         />
       )}

       {/* Item Details Modal */}
       {showDetailsModal && (
         <ItemDetailsModal
           itemDetails={selectedItemDetails}
           onClose={() => {
             setShowDetailsModal(false);
             setSelectedItemDetails(null);
           }}
           isLoading={isLoadingDetails}
         />
       )}
     </div>
   );
 };

// Item Details Modal Component
interface ItemDetailsModalProps {
  itemDetails: any;
  onClose: () => void;
  isLoading: boolean;
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ itemDetails, onClose, isLoading }) => {
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
            <span className="text-gray-600">Loading item details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!itemDetails) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Item Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Item Name</label>
                  <p className="text-sm text-gray-900">{itemDetails.itemName || itemDetails.name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">HSN Code</label>
                  <p className="text-sm text-gray-900">{itemDetails.itemHsn || itemDetails.hsnCode || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-sm text-gray-900">{itemDetails.category || 'N/A'}</p>
                </div>
                
                                 <div>
                   <label className="text-sm font-medium text-gray-500">Status</label>
                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                     itemDetails.isActive || itemDetails.status === 'active'
                       ? 'bg-green-100 text-green-800' 
                       : 'bg-red-100 text-red-800'
                   }`}>
                     {itemDetails.isActive || itemDetails.status === 'active' ? 'Active' : 'Inactive'}
                   </span>
                 </div>
              </div>
            </div>

            {/* Stock & Pricing */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Stock & Pricing
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p className="text-sm text-gray-900">{itemDetails.itemQty || itemDetails.currentStock || 0}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Units</label>
                  <p className="text-sm text-gray-900">{itemDetails.itemUnits || itemDetails.unit || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Rate (INR)</label>
                  <p className="text-sm text-gray-900">₹{itemDetails.itemRate?.inr || itemDetails.purchasePrice || 0}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Rate (USD)</label>
                  <p className="text-sm text-gray-900">${itemDetails.itemRate?.usd || itemDetails.sellingPrice || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Additional Details
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Remarks</label>
                <p className="text-sm text-gray-900 mt-1">
                  {itemDetails.remarks || itemDetails.description || 'No remarks available'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Custom Field 1</label>
                <p className="text-sm text-gray-900 mt-1">
                  {itemDetails.customField1 || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              System Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                 <label className="text-sm font-medium text-gray-500">Item ID</label>
                 <p className="text-sm text-gray-900 font-mono">{itemDetails.id || itemDetails._id || 'N/A'}</p>
               </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm text-gray-900">
                  {itemDetails.createdAt ? new Date(itemDetails.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8 flex justify-end">
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Item Form Component
interface ItemFormProps {
  item?: Item;
  onSubmit: (item: {
    itemName: string;
    itemHsn: string;
    itemQty: number;
    itemUnits: string;
    itemRate: { inr: number; usd: number };
    remarks: string;
    customField1: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    itemHsn: '',
    itemQty: 0,
    itemUnits: '',
    itemRate: {
      inr: 0,
      usd: 0
    },
    remarks: '',
    customField1: '',
  });

  React.useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.name,
        itemHsn: item.hsnCode,
        itemQty: item.currentStock,
        itemUnits: item.unit,
        itemRate: {
          inr: item.purchasePrice,
          usd: item.sellingPrice
        },
        remarks: item.description,
        customField1: '', // This field doesn't exist in the old Item type
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {item ? 'Edit Item' : 'Add New Item'}
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
              label="Item Name"
              value={formData.itemName}
              onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
              placeholder="Enter item name"
              required
            />
            <Input
              label="Item HSN Code"
              value={formData.itemHsn}
              onChange={(e) => setFormData(prev => ({ ...prev, itemHsn: e.target.value }))}
              placeholder="Enter HSN code (e.g., 5208)"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Item Quantity"
              type="number"
              value={formData.itemQty}
              onChange={(e) => setFormData(prev => ({ ...prev, itemQty: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
              required
            />
            <Input
              label="Item Units"
              value={formData.itemUnits}
              onChange={(e) => setFormData(prev => ({ ...prev, itemUnits: e.target.value }))}
              placeholder="sqm, mtr, pcs, kg, etc."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Item Rate (INR)"
              type="number"
              step="0.01"
              value={formData.itemRate.inr}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                itemRate: { ...prev.itemRate, inr: parseFloat(e.target.value) || 0 }
              }))}
              placeholder="0.00"
              min="0"
              required
            />
            <Input
              label="Item Rate (USD)"
              type="number"
              step="0.01"
              value={formData.itemRate.usd}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                itemRate: { ...prev.itemRate, usd: parseFloat(e.target.value) || 0 }
              }))}
              placeholder="0.00"
              min="0"
              required
            />
          </div>

            <Input
            label="Custom Field 1"
            value={formData.customField1}
            onChange={(e) => setFormData(prev => ({ ...prev, customField1: e.target.value }))}
            placeholder="Enter custom value"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="Enter additional notes, comments, or description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting} isLoading={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {item ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                item ? 'Update Item' : 'Add Item'
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
