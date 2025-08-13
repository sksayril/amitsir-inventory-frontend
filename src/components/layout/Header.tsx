import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Package, LogOut, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">InventoryPro</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">{user?.name}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {user?.role || 'user'}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};