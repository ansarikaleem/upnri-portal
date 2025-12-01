import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Members', href: '/admin/members', icon: '👥' },
    { name: 'Business Directory', href: '/admin/businesses', icon: '🏢' },
    { name: 'News', href: '/admin/news', icon: '📰' },
    { name: 'Events', href: '/admin/events', icon: '📅' },
    { name: 'Gallery', href: '/admin/gallery', icon: '🖼️' },
    { name: 'Content Pages', href: '/admin/pages', icon: '📄' },
    { name: 'Website Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        <div className="flex items-center justify-center h-16 bg-gray-900 px-4">
          <h1 className="text-white text-xl font-bold truncate">Admin Panel</h1>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm text-gray-300 rounded-lg transition-colors duration-200
                  hover:bg-gray-700 hover:text-white
                  ${router.pathname === item.href ? 'bg-gray-700 text-white' : ''}
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="mr-3 text-base">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="ml-2 text-lg font-semibold text-gray-800 truncate">
                {navigation.find(item => item.href === router.pathname)?.name || 'Admin'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden sm:inline-block">Admin User</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}