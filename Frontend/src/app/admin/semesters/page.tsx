'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { semesterApi } from '@/services/courseApi';
import { Semester } from '@/types/course';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, Users, Building2, Calendar, BookText, LogOut } from 'lucide-react';

function SemestersContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', year: new Date().getFullYear(), startDate: '', endDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async () => {
    try {
      setLoading(true);
      const data = await semesterApi.getAll();
      setSemesters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load semesters');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingId) {
        await semesterApi.update(editingId, formData);
        setSuccess('Semester updated successfully');
      } else {
        await semesterApi.create(formData);
        setSuccess('Semester created successfully');
      }
      setFormData({ name: '', year: new Date().getFullYear(), startDate: '', endDate: '' });
      setShowForm(false);
      setEditingId(null);
      loadSemesters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sem: Semester) => {
    setFormData({
      name: sem.name,
      year: sem.year,
      startDate: sem.startDate || '',
      endDate: sem.endDate || ''
    });
    setEditingId(sem.id);
    setShowForm(true);
  };

  const handleSetActive = async (id: number) => {
    try {
      await semesterApi.setActive(id);
      setSuccess('Semester activated successfully');
      loadSemesters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate semester');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this semester?')) return;

    try {
      await semesterApi.delete(id);
      setSuccess('Semester deleted successfully');
      loadSemesters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  // 🎨 Items de navigation pour la sidebar Admin
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/departments', label: 'Departments', icon: Building2 },
    { href: '/admin/semesters', label: 'Semesters', icon: Calendar },
    { href: '/admin/subjects', label: 'Subjects', icon: BookText },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 🎨 SIDEBAR À GAUCHE */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
        {/* Logo CampusMaster */}
        <div className="flex items-center gap-3 border-b border-white/40 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-500 text-white font-semibold shadow">
            CM
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
            <p className="text-xs text-slate-500">Admin workspace</p>
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
                    ? 'bg-red-50 text-red-600'
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
        {/* Gradient de fond violet/indigo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-purple-200/60 via-indigo-200/50 to-blue-200/50 blur-3xl" />
          <div className="absolute -left-12 bottom-10 h-72 w-72 rounded-full bg-gradient-to-br from-purple-400/25 via-indigo-300/25 to-blue-300/25 blur-3xl" />
        </div>

        {/* Barre en haut avec recherche */}
        <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <input
              type="text"
              placeholder="Search semesters by name or year..."
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
                  Admin
                </p>
                <h2 className="text-3xl font-black text-slate-900">Semesters</h2>
                <p className="text-sm text-slate-600">Manage academic semesters</p>
              </div>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  setFormData({ name: '', year: new Date().getFullYear(), startDate: '', endDate: '' });
                }}
                className="inline-flex justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                {showForm ? 'Cancel' : 'Add Semester'}
              </button>
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

            {showForm && (
              <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {editingId ? 'Edit Semester' : 'New Semester'}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-800">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                      placeholder="S1, S2..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800">Year</label>
                    <input
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-60"
                  >
                    {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : semesters.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                  <p className="text-sm text-slate-500">No semesters yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {semesters.map((sem) => (
                    <div
                      key={sem.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold text-sm">
                          {sem.name}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold text-slate-900">
                              {sem.name} - {sem.year}
                            </h4>
                            {sem.isActive && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">
                            {sem.startDate && sem.endDate
                              ? `${new Date(sem.startDate).toLocaleDateString()} - ${new Date(sem.endDate).toLocaleDateString()}`
                              : 'Dates not set'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!sem.isActive && (
                          <button
                            onClick={() => handleSetActive(sem.id)}
                            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(sem)}
                          className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sem.id)}
                          className="text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SemestersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <SemestersContent />
    </ProtectedRoute>
  );
}