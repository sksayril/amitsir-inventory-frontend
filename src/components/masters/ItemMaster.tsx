import React, { useState, useEffect } from 'react';
import { Item } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus, Search, Edit, Trash2, Package, TrendingUp, AlertTriangle, X } from 'lucide-react';

export const ItemMaster: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Mock data
  useEffect(() => {
    const mockItems: Item[] = [
      {
        id: '1',
        name: 'Premium Cotton Fabric',
        category: 'Textiles',
        hsnCode: '5208.52',
        unit: 'mtr',
        currentStock: 1500,
        minStock: 200,
        maxStock: 2000,
        purchasePrice: 85.50,
        sellingPrice: 120.00,
        description: 'High-quality cotton fabric for apparel manufacturing',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Steel Pipes 6 inch',
        category: 'Metals',
        hsnCode: '7306.30',
        unit: 'mtr',
        currentStock: 500,
        minStock: 100,
        maxStock: 800,
        purchasePrice: 450.00,
        sellingPrice: 580.00,
        description: 'Galvanized steel pipes for construction',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Electronic Components Kit',
        category: 'Electronics',
        hsnCode: '8536.90',
        unit: 'pcs',
        currentStock: 25,
        minStock: 50,
        maxStock: 200,
        purchasePrice: 1250.00,
        sellingPrice: 1800.00,
        description: 'Complete kit for electronic projects',
        status: 'inactive',
        createdAt: new Date().toISOString(),
      },
    ];
    setItems(mockItems);
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddItem = (itemData: Omit<Item, 'id' | 'createdAt'>) => {
    const newItem: Item = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
    setShowForm(false);
  };

  const handleEditItem = (itemData: Omit<Item, 'id' | 'createdAt'>) => {
    if (editingItem) {
      setItems(prev => prev.map(i => 
        i.id === editingItem.id 
          ? { ...itemData, id: i.id, createdAt: i.createdAt }
          : i
      ));
      setEditingItem(undefined);
      setShowForm(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const startEdit = (item: Item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(undefined);
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
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
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
                      <div className="flex items-center space-x-2">
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
      </div>

      {/* Item Form Modal */}
      {showForm && (
        <ItemForm
          item={editingItem}
          onSubmit={editingItem ? handleEditItem : handleAddItem}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

// Item Form Component
interface ItemFormProps {
  item?: Item;
  onSubmit: (item: Omit<Item, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    hsnCode: '',
    unit: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  React.useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        hsnCode: item.hsnCode,
        unit: item.unit,
        currentStock: item.currentStock,
        minStock: item.minStock,
        maxStock: item.maxStock,
        purchasePrice: item.purchasePrice,
        sellingPrice: item.sellingPrice,
        description: item.description,
        status: item.status,
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
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter item name"
              required
            />
            <Input
              label="Item HSN Code"
              value={formData.hsnCode}
              onChange={(e) => setFormData(prev => ({ ...prev, hsnCode: e.target.value }))}
              placeholder="Enter HSN code (e.g., 5208.52)"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Item Quantity (Current Stock)"
              type="number"
              value={formData.currentStock}
              onChange={(e) => setFormData(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
              required
            />
            <Input
              label="Item Units"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              placeholder="mtr, pcs, kg, etc."
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Conversion
              </label>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                mtr to sqm (for area-based items)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Item Rate (INR)"
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              min="0"
              required
            />
            <Input
              label="Item Rate (USD)"
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              min="0"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Stock"
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
              required
            />
            <Input
              label="Maximum Stock"
              type="number"
              value={formData.maxStock}
              onChange={(e) => setFormData(prev => ({ ...prev, maxStock: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="Enter category (e.g., Textiles, Metals, Electronics)"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter additional notes, comments, or description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {item ? 'Update Item' : 'Add Item'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
