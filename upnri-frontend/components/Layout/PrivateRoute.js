import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../utils/auth';

export default function PrivateRoute({ children, adminOnly = false }) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (adminOnly && !authService.isAdmin()) {
      router.push('/');
      return;
    }
  }, [router, adminOnly]);

  if (!authService.isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (adminOnly && !authService.isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
}