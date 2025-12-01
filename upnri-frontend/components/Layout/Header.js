import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authService } from '../../utils/auth';
import { apiService } from '../../utils/api';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [unreadConnectionCount, setUnreadConnectionCount] = useState(0);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    fetchUnreadCount();
    // Make function available globally for other components to refresh count
    if (typeof window !== 'undefined') {
      window.updateUnreadConnectionCount = fetchUnreadCount;
    }
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Members', href: '/members' },
    { name: 'News', href: '/news' },
    { name: 'Events', href: '/events' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Business Directory', href: '/businesses' },
    { name: 'About', href: '/about' },
  ];

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  const fetchUnreadCount = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await apiService.getUnreadConnectionCount();
      setUnreadConnectionCount(response.data.count);
    }
  } catch (error) {
    console.error('Error fetching unread count:', error);
  }
};

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                UP
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">UPNRI Forum</h1>
                <p className="text-xs text-gray-600">Kuwait</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/members/dashboard"
                  className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
                >
                  Dashboard
                </Link>
                <Link href="/members/connections" className="relative">
                  Connections
                  {unreadConnectionCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadConnectionCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
                >
                  Register
                </Link>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 pb-3 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col space-y-3 px-5">
                    <div className="text-sm text-gray-900 font-medium">
                      Welcome, {user.fullName}
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/members/dashboard"
                      className="w-full text-center px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3 px-5">
                    <Link
                      href="/auth/register"
                      className="w-full text-center px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                    <Link
                      href="/auth/login"
                      className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}