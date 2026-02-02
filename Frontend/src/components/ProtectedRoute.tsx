'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireTeacher?: boolean;
  requireUser?: boolean;
}

function AccessDenied() {
  const { isAdmin, isTeacher, logout } = useAuth();

  const getHomePath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isTeacher) return '/teacher/dashboard';
    return '/user/dashboard';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="max-w-md w-full mx-4">
        <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-600">
            You do not have permission to access this page. Please return to your dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={getHomePath()}
              className="inline-flex justify-center rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              Go to My Dashboard
            </a>
            <button
              onClick={logout}
              className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireTeacher = false,
  requireUser = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isTeacher, isLoading } = useAuth();
  const router = useRouter();

  // Determine if user has the "User" role (not admin, not teacher)
  const isUser = isAuthenticated && !isAdmin && !isTeacher;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check role requirements and show error if not authorized
  if (requireAdmin && !isAdmin) {
    return <AccessDenied />;
  }

  if (requireTeacher && !isTeacher) {
    return <AccessDenied />;
  }

  if (requireUser && !isUser) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
