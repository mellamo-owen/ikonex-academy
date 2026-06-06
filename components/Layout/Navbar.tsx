'use client';

import { Bell, User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, Administrator
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </button>

            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors">
                      <User size={16} /> Profile
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors">
                      <Settings size={16} /> Settings
                    </button>
                    <hr className="my-1" />
                    <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2 transition-colors">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}