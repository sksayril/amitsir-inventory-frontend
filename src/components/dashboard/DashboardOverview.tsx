import React from 'react';
import { 
  Building2, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Receipt, 
  Users, 
  UserCheck, 
  FileText,
  TrendingDown,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface DashboardStats {
  totalCompanies: number;
  totalItems: number;
  totalPurchase: number;
  totalSales: number;
  totalReceipts: number;
  totalCreditParties: number;
  totalBrokers: number;
  totalCHAs: number;
}

interface DashboardOverviewProps {
  stats: DashboardStats;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats }) => {
  const overviewCards = [
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      icon: Building2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+12',
      changeType: 'positive' as const,
    },
    {
      title: 'Purchase Transactions',
      value: stats.totalPurchase,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+5',
      changeType: 'positive' as const,
    },
    {
      title: 'Sales Transactions',
      value: stats.totalSales,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+18',
      changeType: 'positive' as const,
    },
    {
      title: 'Receipt Transactions',
      value: stats.totalReceipts,
      icon: Receipt,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: '+8',
      changeType: 'positive' as const,
    },
    {
      title: 'Credit Parties',
      value: stats.totalCreditParties,
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      change: '+3',
      changeType: 'positive' as const,
    },
    {
      title: 'Brokers',
      value: stats.totalBrokers,
      icon: UserCheck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      change: '+1',
      changeType: 'positive' as const,
    },
    {
      title: 'CHA Partners',
      value: stats.totalCHAs,
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '0',
      changeType: 'neutral' as const,
    },
  ];

  const recentActivities = [
    {
      type: 'purchase',
      message: 'New purchase order #PO-001 created',
      time: '2 hours ago',
      icon: ShoppingCart,
      color: 'text-orange-600',
    },
    {
      type: 'sales',
      message: 'Sales invoice #SI-156 generated',
      time: '4 hours ago',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      type: 'item',
      message: 'Item "Wireless Headphones" stock updated',
      time: '6 hours ago',
      icon: Package,
      color: 'text-purple-600',
    },
    {
      type: 'receipt',
      message: 'Payment received for invoice #SI-155',
      time: '1 day ago',
      icon: Receipt,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome to your inventory management system</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Today's Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <div className="flex items-center mt-2">
                    {card.changeType === 'positive' ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : card.changeType === 'negative' ? (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    ) : null}
                    <span className={`text-sm ${
                      card.changeType === 'positive' ? 'text-green-600' : 
                      card.changeType === 'negative' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {card.change} this month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Business Flow Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Flow Overview</h3>
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Company</p>
            <p className="text-xs text-gray-500">{stats.totalCompanies} companies</p>
          </div>
          
          <div className="text-blue-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Item</p>
            <p className="text-xs text-gray-500">{stats.totalItems} items</p>
          </div>

          <div className="text-blue-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <ShoppingCart className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Purchase</p>
            <p className="text-xs text-gray-500">{stats.totalPurchase} transactions</p>
          </div>

          <div className="text-blue-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Sales</p>
            <p className="text-xs text-gray-500">{stats.totalSales} transactions</p>
          </div>
        </div>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${activity.color.replace('text-', 'bg-')} bg-opacity-10`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-center transition-colors">
              <Building2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-900">Add Company</p>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
              <Package className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-900">Add Item</p>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
              <ShoppingCart className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-900">New Purchase</p>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900">New Sale</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
