import React from 'react';
import { Product } from '../../types';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const isLowStock = product.quantity <= product.minStock;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {isLowStock && (
        <div className="flex items-center space-x-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg mb-4">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Low Stock Alert</span>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.category}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Quantity:</span>
          <span className={`font-medium ${isLowStock ? 'text-amber-600' : 'text-gray-900'}`}>
            {product.quantity}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Price:</span>
          <span className="font-medium text-gray-900">${product.price.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Supplier:</span>
          <span className="font-medium text-gray-900">{product.supplier}</span>
        </div>
      </div>

      {product.description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-gray-600 text-sm">{product.description}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        Last updated: {new Date(product.lastUpdated).toLocaleDateString()}
      </div>
    </div>
  );
};