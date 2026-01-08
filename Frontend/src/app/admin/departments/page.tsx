'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { departmentApi } from '@/services/courseApi';
import { Department } from '@/types/course';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function DepartmentsContent() {
  const { user, logout } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments');
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
        await departmentApi.update(editingId, formData);
        setSuccess('Department updated successfully');
      } else {
        await departmentApi.create(formData);
        setSuccess('Department created successfully');
      }
      setFormData({ name: '', code: '', description: '' });
      setShowForm(false);
      setEditingId(null);
      loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (dept: Department) => {
    setFormData({ name: dept.name, code: dept.code, description: dept.description || '' });
    setEditingId(dept.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      await departmentApi.delete(id);
      setSuccess('Department deleted successfully');
      loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-blue-200/60 via-sky-200/50 to-emerald-200/50 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white font-semibold shadow">
              CM
            </Link>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">Departments Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-sm text-slate-600 hover:text-blue-600 transition">Dashboard</Link>
            <Link href="/admin/users" className="text-sm text-slate-600 hover:text-blue-600 transition">Users</Link>
            <Link href="/admin/departments" className="text-sm font-medium text-blue-600 transition">Departments</Link>
            <Link href="/admin/semesters" className="text-sm text-slate-600 hover:text-blue-600 transition">Semesters</Link>
            <Link href="/admin/subjects" className="text-sm text-slate-600 hover:text-blue-600 transition">Subjects</Link>
            <button onClick={logout} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Departments</h2>
              <p className="text-sm text-slate-600">Manage academic departments</p>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', code: '', description: '' }); }}
              className="inline-flex justify-center rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              {showForm ? 'Cancel' : 'Add Department'}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">{error}</div>
          )}
          {success && (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-800">{success}</div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{editingId ? 'Edit Department' : 'New Department'}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-800">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    placeholder="INFO"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    rows={3}
                    placeholder="Department description..."
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : departments.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                <p className="text-sm text-slate-500">No departments yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">{dept.code}</span>
                        <h4 className="mt-2 text-lg font-semibold text-slate-900">{dept.name}</h4>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{dept.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
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
  );
}

export default function DepartmentsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <DepartmentsContent />
    </ProtectedRoute>
  );
}
