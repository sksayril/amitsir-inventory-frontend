import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    supplier: '',
    description: '',
    minStock: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
        supplier: product.supplier,
        description: product.description,
        minStock: product.minStock,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
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
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter product name"
              required
            />

            <Input
              label="Category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Enter category"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              required
            />

            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              required
            />

            <Input
              label="Min Stock"
              type="number"
              value={formData.minStock}
              onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <Input
            label="Supplier"
            value={formData.supplier}
            onChange={(e) => handleChange('supplier', e.target.value)}
            placeholder="Enter supplier name"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter product description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {product ? 'Update Product' : 'Add Product'}
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