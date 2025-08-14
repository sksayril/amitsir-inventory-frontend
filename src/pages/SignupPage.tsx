import React from 'react';
import { SignupForm } from '../components/auth/SignupForm';
import { Building2, Package, ShoppingCart, TrendingUp, Users, UserCheck, FileText } from 'lucide-react';

export const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex">
      {/* Left Side - Business Flow Visualization */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-blue-700 p-12 text-white">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">InventoryPro</h1>
            <p className="text-emerald-100 text-lg">Complete Business Flow Management System</p>
          </div>
          
          {/* Business Flow Diagram */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold">Company Master</h3>
                <p className="text-emerald-100 text-sm">Business partners</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold">Item Master</h3>
                <p className="text-emerald-100 text-sm">Inventory items</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold">Purchase Transactions</h3>
                <p className="text-emerald-100 text-sm">Transactions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold">Credit Parties</h3>
                <p className="text-emerald-100 text-sm">Customers & suppliers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold">Brokers & CHA</h3>
                <p className="text-emerald-100 text-sm">Service providers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-emerald-100 text-sm">Business insights</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-emerald-100 text-sm">
              Join thousands of businesses managing their inventory with our comprehensive system
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
              <Building2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Start managing your inventory today</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <SignupForm />
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