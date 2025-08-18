import React from 'react';
import { ActiveView } from '../../pages/DashboardPage';
import { 
  Building2, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Receipt, 
  Users, 
  UserCheck, 
  FileText,
  BarChart3,
  Home,
  UserX
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeView, onViewChange }) => {
  const navigationItems = [
    {
      id: 'overview' as ActiveView,
      label: 'Dashboard Overview',
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'company' as ActiveView,
      label: 'Company Master',
      icon: Building2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'item' as ActiveView,
      label: 'Item Master',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'purchase' as ActiveView,
      label: 'Purchase Transactions',
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'sales' as ActiveView,
      label: 'Sales Transactions',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },

    {
      id: 'receipt' as ActiveView,
      label: 'Receipt Transactions',
      icon: Receipt,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'credit-party' as ActiveView,
      label: 'Credit Party Master',
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      id: 'debit-party' as ActiveView,
      label: 'Debit Party Master',
      icon: UserCheck,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      id: 'broker' as ActiveView,
      label: 'Broker Master',
      icon: UserX,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'cha' as ActiveView,
      label: 'CHA Master',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-40 overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Business Flow</h2>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Company → Item → Purchase</p>
            <p>Receipt → Credit Party → Debit Party → Broker → CHA</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                  ${isActive 
                    ? `${item.bgColor} ${item.color} font-medium shadow-sm` 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? item.color : 'text-gray-400'}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Stats</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span className="font-medium">156</span>
            </div>
            <div className="flex justify-between">
              <span>Low Stock:</span>
              <span className="font-medium text-amber-600">12</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Payments:</span>
              <span className="font-medium text-red-600">8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
