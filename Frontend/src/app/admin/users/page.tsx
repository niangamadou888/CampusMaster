'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';
import { User } from '@/types/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function UsersListContent() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const allUsers = await authApi.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'Admin':
        return 'bg-red-100 text-red-700';
      case 'Teacher':
        return 'bg-purple-100 text-purple-700';
      case 'User':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
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
            <Link
              href="/admin/dashboard"
              className="text-sm text-slate-600 hover:text-blue-600 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="text-sm font-medium text-blue-600 transition"
            >
              Users
            </Link>
            <Link
              href="/admin/departments"
              className="text-sm text-slate-600 hover:text-blue-600 transition"
            >
              Departments
            </Link>
            <Link
              href="/admin/semesters"
              className="text-sm text-slate-600 hover:text-blue-600 transition"
            >
              Semesters
            </Link>
            <Link
              href="/admin/subjects"
              className="text-sm text-slate-600 hover:text-blue-600 transition"
            >
              Subjects
            </Link>
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
              <h2 className="text-3xl font-black text-slate-900">All Users</h2>
              <p className="text-sm text-slate-600">
                View and manage all registered users on the platform.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadUsers}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
              >
                Refresh
              </button>
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                {users.length} Users
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">
              {error}
              <button
                onClick={loadUsers}
                className="ml-2 font-semibold text-red-700 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          )}

          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-12 text-center">
                <p className="text-slate-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Role(s)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr
                        key={u.userEmail}
                        className="bg-white/60 transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">
                            {u.userFirstName} {u.userLastName}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">{u.userEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {u.role.map((r) => (
                              <span
                                key={r.roleName}
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeColor(
                                  r.roleName
                                )}`}
                              >
                                {r.roleName}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {u.isSuspended ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function UsersListPage() {
  return (
    <ProtectedRoute requireAdmin>
      <UsersListContent />
    </ProtectedRoute>
  );
}
