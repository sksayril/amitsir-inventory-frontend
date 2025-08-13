import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { Building2, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Business Flow Visualization */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">InventoryPro</h1>
            <p className="text-blue-100 text-lg">Complete Business Flow Management System</p>
          </div>
          
          {/* Business Flow Diagram */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold">Company Master</h3>
                <p className="text-blue-100 text-sm">Manage business partners</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold">Item Master</h3>
                <p className="text-blue-100 text-sm">Inventory management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold">Purchase → Sales</h3>
                <p className="text-blue-100 text-sm">Transaction flow</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold">Analytics & Reports</h3>
                <p className="text-blue-100 text-sm">Business insights</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-blue-100 text-sm">
              Streamline your inventory operations with our comprehensive business flow management system
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your inventory management account</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <LoginForm />
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 InventoryPro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};