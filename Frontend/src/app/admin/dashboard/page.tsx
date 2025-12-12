'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';

function AdminDashboardContent() {
  const { user, logout } = useAuth();
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authApi.suspendUser(userEmail);
      setSuccess(`User ${userEmail} has been suspended successfully`);
      setUserEmail('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to suspend user'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authApi.unsuspendUser(userEmail);
      setSuccess(`User ${userEmail} has been unsuspended successfully`);
      setUserEmail('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to unsuspend user'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CampusMaster</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.userFirstName}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Admin
              </span>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-800">{success}</div>
              </div>
            )}

            <div className="space-y-8">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Admin Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.userFirstName} {user?.userLastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.userEmail}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.role.map((r) => r.roleName).join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  User Management
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage user accounts by suspending or unsuspending them.
                </p>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="userEmail"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      User Email
                    </label>
                    <input
                      id="userEmail"
                      name="userEmail"
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSuspend}
                      disabled={isLoading || !userEmail}
                      className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing...' : 'Suspend User'}
                    </button>
                    <button
                      onClick={handleUnsuspend}
                      disabled={isLoading || !userEmail}
                      className="inline-flex justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing...' : 'Unsuspend User'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  System Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">-</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Feature coming soon
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-900">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-green-600 mt-2">-</p>
                    <p className="text-xs text-green-700 mt-1">
                      Feature coming soon
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-red-900">
                      Suspended Users
                    </p>
                    <p className="text-2xl font-bold text-red-600 mt-2">-</p>
                    <p className="text-xs text-red-700 mt-1">
                      Feature coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
