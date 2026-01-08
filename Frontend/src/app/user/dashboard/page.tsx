'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function UserDashboardContent() {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.userFirstName || '',
    lastName: user?.userLastName || '',
    email: user?.userEmail || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await updateUser({
        userFirstName: formData.firstName,
        userLastName: formData.lastName,
        userEmail: formData.email,
      });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.userFirstName || '',
      lastName: user?.userLastName || '',
      email: user?.userEmail || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
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
              <p className="text-xs text-slate-500">User workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/user/dashboard"
              className="text-sm font-medium text-blue-600 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/user/courses"
              className="text-sm text-slate-600 hover:text-blue-600 transition"
            >
              Courses
            </Link>
            <Link
              href="/user/assignments"
              className="text-sm text-slate-600 hover:text-blue-600 transition"
            >
              Assignments
            </Link>
            <Link
              href="/user/grades"
              className="text-sm text-slate-600 hover:text-blue-600 transition"
            >
              Grades
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
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                User
              </p>
              <h2 className="text-3xl font-black text-slate-900">User Dashboard</h2>
              <p className="text-sm text-slate-600">
                View your profile and keep your campus information up to date.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg">
              Profile active
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

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Profile information</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:shadow-lg"
                  >
                    Edit profile
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      First Name
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {user?.userFirstName}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Last Name
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {user?.userLastName}
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
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {user?.role.map((r) => r.roleName).join(', ')}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="firstName"
                        className="text-sm font-semibold text-slate-800"
                      >
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-blue-300 focus:ring-blue-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="lastName"
                        className="text-sm font-semibold text-slate-800"
                      >
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-blue-300 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-slate-800">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-blue-300 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex justify-center rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex justify-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-300">
                    Account
                  </p>
                  <p className="text-lg font-semibold text-white">Status</p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                  Active
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-200">
                Keep your details updated to get the most from CampusMaster.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { label: 'Role', value: user?.role.map((r) => r.roleName).join(', ') },
                  { label: 'Email', value: user?.userEmail },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-white/10 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-200">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white break-words">
                      {item.value}
                    </p>
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

export default function UserDashboard() {
  return (
    <ProtectedRoute requireUser>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}
