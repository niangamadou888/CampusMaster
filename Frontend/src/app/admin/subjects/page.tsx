'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subjectApi, departmentApi, semesterApi } from '@/services/courseApi';
import { authApi } from '@/services/api';
import { Subject, Department, Semester } from '@/types/course';
import { User } from '@/types/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function SubjectsContent() {
  const { logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', code: '', description: '', credits: 3, departmentId: 0, semesterId: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const [assigningTeacher, setAssigningTeacher] = useState<number | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, deptsData, semsData, teachersData] = await Promise.all([
        subjectApi.getAll(),
        departmentApi.getAll(),
        semesterApi.getAll(),
        authApi.getApprovedTeachers()
      ]);
      setSubjects(subjectsData);
      setDepartments(deptsData);
      setSemesters(semsData);
      setTeachers(teachersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departmentId || !formData.semesterId) {
      setError('Please select a department and semester');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      if (editingId) {
        await subjectApi.update(editingId, { name: formData.name, code: formData.code, description: formData.description, credits: formData.credits });
        setSuccess('Subject updated successfully');
      } else {
        await subjectApi.create(
          { name: formData.name, code: formData.code, description: formData.description, credits: formData.credits },
          formData.departmentId,
          formData.semesterId
        );
        setSuccess('Subject created successfully');
      }
      closeForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', description: '', credits: 3, departmentId: 0, semesterId: 0 });
    setEditingId(null);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (subj: Subject) => {
    setFormData({
      name: subj.name,
      code: subj.code,
      description: subj.description || '',
      credits: subj.credits || 3,
      departmentId: subj.department?.id || 0,
      semesterId: subj.semester?.id || 0
    });
    setEditingId(subj.id);
    setShowForm(true);
  };

  const handleAssignTeacher = async (subjectId: number) => {
    if (!selectedTeacher) return;
    try {
      await subjectApi.assignTeacher(subjectId, selectedTeacher);
      setSuccess('Teacher assigned successfully');
      setAssigningTeacher(null);
      setSelectedTeacher('');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign teacher');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await subjectApi.delete(id);
      setSuccess('Subject deleted successfully');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-emerald-200/60 via-teal-200/50 to-cyan-200/50 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white font-semibold shadow">
              CM
            </Link>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">Subjects Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-sm text-slate-600 hover:text-blue-600 transition">Dashboard</Link>
            <Link href="/admin/users" className="text-sm text-slate-600 hover:text-blue-600 transition">Users</Link>
            <Link href="/admin/departments" className="text-sm text-slate-600 hover:text-blue-600 transition">Departments</Link>
            <Link href="/admin/semesters" className="text-sm text-slate-600 hover:text-blue-600 transition">Semesters</Link>
            <Link href="/admin/subjects" className="text-sm font-medium text-blue-600 transition">Subjects</Link>
            <button onClick={logout} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Subjects</h2>
              <p className="text-sm text-slate-600">Manage academic subjects and assign teachers</p>
            </div>
            <button
              onClick={() => {
                if (showForm) {
                  closeForm();
                } else {
                  resetForm();
                  setShowForm(true);
                }
              }}
              className="inline-flex justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md"
            >
              {showForm ? 'Cancel' : 'Add Subject'}
            </button>
          </div>

          {error && <div className="mt-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">{error}</div>}
          {success && <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-800">{success}</div>}

          {showForm && (
            <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{editingId ? 'Edit Subject' : 'New Subject'}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-sm font-semibold text-slate-800">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-emerald-300"
                    placeholder="Web Development"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-emerald-300"
                    placeholder="WEB101"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-emerald-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">Department</label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-emerald-300"
                  >
                    <option value={0}>Select department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">Semester</label>
                  <select
                    required
                    value={formData.semesterId}
                    onChange={(e) => setFormData({ ...formData, semesterId: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-emerald-300"
                  >
                    <option value={0}>Select semester</option>
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.name} {s.year}</option>)}
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <label className="text-sm font-semibold text-slate-800">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-emerald-300"
                    rows={2}
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : subjects.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                <p className="text-sm text-slate-500">No subjects yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.map((subj) => (
                  <div key={subj.id} className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">{subj.code}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{subj.credits} credits</span>
                          {subj.department && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{subj.department.name}</span>}
                          {subj.semester && <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">{subj.semester.name} {subj.semester.year}</span>}
                        </div>
                        <h4 className="mt-2 text-lg font-semibold text-slate-900">{subj.name}</h4>
                        <p className="text-sm text-slate-500">{subj.description || 'No description'}</p>
                        {subj.teacher && (
                          <p className="mt-1 text-sm text-emerald-600">Teacher: {subj.teacher.userFirstName} {subj.teacher.userLastName}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {assigningTeacher === subj.id ? (
                          <div className="flex gap-2">
                            <select
                              value={selectedTeacher}
                              onChange={(e) => setSelectedTeacher(e.target.value)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                            >
                              <option value="">Select teacher</option>
                              {teachers.map(t => <option key={t.userEmail} value={t.userEmail}>{t.userFirstName} {t.userLastName}</option>)}
                            </select>
                            <button onClick={() => handleAssignTeacher(subj.id)} className="text-sm font-semibold text-emerald-600">Assign</button>
                            <button onClick={() => setAssigningTeacher(null)} className="text-sm text-slate-500">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => setAssigningTeacher(subj.id)} className="text-sm font-semibold text-purple-600 hover:text-purple-700">
                              {subj.teacher ? 'Change Teacher' : 'Assign Teacher'}
                            </button>
                            <button onClick={() => handleEdit(subj)} className="text-sm font-semibold text-blue-600 hover:text-blue-700">Edit</button>
                            <button onClick={() => handleDelete(subj.id)} className="text-sm font-semibold text-red-600 hover:text-red-700">Delete</button>
                          </div>
                        )}
                      </div>
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

export default function SubjectsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <SubjectsContent />
    </ProtectedRoute>
  );
}
