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
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-blue-200/60 via-sky-200/50 to-emerald-200/50 blur-3xl" />
        <div className="absolute -left-12 bottom-10 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/25 via-indigo-300/25 to-sky-300/25 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white font-semibold shadow">
              CM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">Admin workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-700 sm:inline">
              Welcome, {user?.userFirstName}
            </span>
            <button
              onClick={logout}
              className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-600">
                Admin
              </p>
              <h2 className="text-3xl font-black text-slate-900">Admin Dashboard</h2>
              <p className="text-sm text-slate-600">
                Manage accounts, monitor platform health, and keep the campus running.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg">
              Elevated access
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-800">
              {success}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Admin information</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Profile
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Name
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {user?.userFirstName} {user?.userLastName}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {user?.userEmail}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Roles
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {user?.role.map((r) => r.roleName).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-300">
                    API Endpoint
                  </p>
                  <p className="mt-1 font-mono text-sm text-emerald-200">
                    https://campusmaster.onrender.com
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                  Online
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-200">
                Secure authentication with password recovery and role-based permissions.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: 'Users', value: '-' },
                  { label: 'Active', value: '-' },
                  { label: 'Suspended', value: '-' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/10 p-3 text-center">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-200">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">User management</h3>
                  <p className="text-sm text-slate-600">
                    Suspend or unsuspend user accounts instantly.
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Safety
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <label
                  htmlFor="userEmail"
                  className="text-sm font-semibold text-slate-800"
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
                  className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-blue-300 focus:ring-blue-100"
                  placeholder="user@example.com"
                />

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={handleSuspend}
                    disabled={isLoading || !userEmail}
                    className="inline-flex justify-center rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? 'Processing...' : 'Suspend User'}
                  </button>
                  <button
                    onClick={handleUnsuspend}
                    disabled={isLoading || !userEmail}
                    className="inline-flex justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? 'Processing...' : 'Unsuspend User'}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">System statistics</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Preview
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                {[
                  { label: 'Total Users', color: 'from-blue-500 to-sky-500' },
                  { label: 'Active Users', color: 'from-emerald-500 to-teal-500' },
                  { label: 'Suspended Users', color: 'from-rose-500 to-red-500' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.color}`} />
                    <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">-</p>
                    <p className="text-xs text-slate-500">Feature coming soon</p>
                  </div>
                ))}
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
