import React from 'react';
import { Product } from '../../types';
import { Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';

interface InventoryStatsProps {
  products: Product[];
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ products }) => {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const lowStockItems = products.filter(product => product.quantity <= product.minStock).length;
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Value',
      value: `$${totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Low Stock Items',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Total Inventory',
      value: totalQuantity,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};