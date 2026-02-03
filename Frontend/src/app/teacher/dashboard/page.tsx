'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, ClipboardList, MessageSquare, LogOut } from 'lucide-react';

function TeacherDashboardContent() {
  const { user, logout, updateUser } = useAuth();
  const pathname = usePathname();
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

  // 🎨 Items de navigation pour la sidebar Teacher
  const navItems = [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/courses', label: 'Courses', icon: BookOpen },
    { href: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/teacher/messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 🎨 SIDEBAR À GAUCHE */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
        {/* Logo CampusMaster */}
        <div className="flex items-center gap-3 border-b border-white/40 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-500 text-white font-semibold shadow">
            CM
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
            <p className="text-xs text-slate-500">Teacher workspace</p>
          </div>
        </div>

        {/* Navigation items avec icônes */}
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bouton déconnexion en bas - Proposition 1 */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={logout}
            className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-red-200 hover:bg-red-50 hover:font-bold hover:text-red-600"
          >
            <LogOut className="h-5 w-5 text-red-600 transition-colors" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* 🎨 CONTENU PRINCIPAL - Décalé de 256px */}
      <div className="relative ml-64 min-h-screen flex-1 overflow-hidden">
        {/* Gradient de fond (TON DESIGN ORIGINAL !) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-purple-200/60 via-indigo-200/50 to-blue-200/50 blur-3xl" />
          <div className="absolute -left-12 bottom-10 h-72 w-72 rounded-full bg-gradient-to-br from-purple-400/25 via-indigo-300/25 to-blue-300/25 blur-3xl" />
        </div>

        {/* Barre en haut avec recherche */}
        <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <input
              type="text"
              placeholder="Search for courses, students, or materials..."
              className="w-96 rounded-lg border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            />
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-700 sm:inline">
                Welcome, {user?.userFirstName}
              </span>
            </div>
          </div>
        </nav>

        {/* Contenu de la page */}
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-purple-600">
                  Teacher
                </p>
                <h2 className="text-3xl font-black text-slate-900">Teacher Dashboard</h2>
                <p className="text-sm text-slate-600">
                  Manage your courses, students, and teaching materials.
                </p>
              </div>
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                Educator access
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
                      className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:shadow-lg"
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
                          className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-purple-300 focus:ring-purple-100"
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
                          className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-purple-300 focus:ring-purple-100"
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
                        className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-purple-300 focus:ring-purple-100"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoading ? 'Saving...' : 'Save changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex justify-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-purple-200 hover:text-purple-700"
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
                  Your teacher account is active. You can manage courses and interact with students.
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

            <div className="mt-8 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Teaching Tools</h3>
                  <p className="text-sm text-slate-600">
                    Manage your courses, materials, and student interactions.
                  </p>
                </div>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  Coming Soon
                </span>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { title: 'Courses', description: 'Create and manage your courses', icon: '📚' },
                  { title: 'Materials', description: 'Upload teaching materials', icon: '📄' },
                  { title: 'Students', description: 'View and interact with students', icon: '👥' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-center"
                  >
                    <div className="text-3xl">{item.icon}</div>
                    <p className="mt-2 font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  return (
    <ProtectedRoute requireTeacher>
      <TeacherDashboardContent />
    </ProtectedRoute>
  );
}