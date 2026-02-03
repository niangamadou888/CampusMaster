'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { courseApi, subjectApi } from '@/services/courseApi';
import { Course, Subject } from '@/types/course';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, ClipboardList, MessageSquare, LogOut, GraduationCap, Bell } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { useNotifications } from '@/context/NotificationContext';

function TeacherCoursesContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', subjectId: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, subjectsData] = await Promise.all([
        courseApi.getMyCourses(),
        subjectApi.getAll()
      ]);
      setCourses(coursesData);
      // Filter subjects assigned to this teacher
      const mySubjects = subjectsData.filter(s => s.teacher?.userEmail === user?.userEmail);
      setSubjects(mySubjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId) {
      setError('Please select a subject');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await courseApi.create({ title: formData.title, description: formData.description }, formData.subjectId);
      setSuccess('Course created successfully');
      setFormData({ title: '', description: '', subjectId: 0 });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await courseApi.publish(id);
      setSuccess('Course published successfully');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish course');
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await courseApi.unpublish(id);
      setSuccess('Course unpublished successfully');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish course');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await courseApi.delete(id);
      setSuccess('Course deleted successfully');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  const { unreadCount } = useNotifications();

  // 🎨 Items de navigation pour la sidebar Teacher
  const navItems = [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/courses', label: 'Courses', icon: BookOpen },
    { href: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/teacher/grades', label: 'Grades', icon: GraduationCap },
    { href: '/teacher/messages', label: 'Messages', icon: MessageSquare },
    { href: '/teacher/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 🎨 SIDEBAR À GAUCHE */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
        {/* Logo CampusMaster */}
        <div className="flex items-center gap-3 border-b border-white/40 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500 text-white font-semibold shadow">
            CM
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
            <p className="text-xs text-slate-500">My Courses</p>
          </div>
        </div>

        {/* Navigation items avec icônes */}
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/teacher/courses' && pathname.startsWith('/teacher/courses')
              ? true
              : pathname === item.href;
            
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
                {item.href === '/teacher/notifications' && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
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
        {/* Gradient de fond */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-indigo-200/60 via-purple-200/50 to-pink-200/50 blur-3xl" />
        </div>

        {/* Barre en haut avec recherche */}
        <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <input
              type="text"
              placeholder="Search for courses..."
              className="w-96 rounded-lg border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </nav>

        {/* Contenu de la page */}
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900">My Courses</h2>
                <p className="text-sm text-slate-600">Create and manage your courses</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
              >
                {showForm ? 'Cancel' : 'New Course'}
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
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Course</h3>
                {subjects.length === 0 ? (
                  <p className="text-sm text-amber-600">No subjects assigned to you. Please contact admin.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-slate-800">Subject</label>
                        <select
                          required
                          value={formData.subjectId}
                          onChange={(e) => setFormData({ ...formData, subjectId: parseInt(e.target.value) })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition"
                        >
                          <option value={0}>Select subject</option>
                          {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-800">Title</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition"
                          placeholder="Introduction to React"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-semibold text-slate-800">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition"
                          rows={3}
                          placeholder="Describe your course..."
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Creating...' : 'Create Course'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : courses.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                  <p className="text-sm text-slate-500">No courses yet. Create your first course!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <div key={course.id} className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {course.isPublished ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Published</span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Draft</span>
                            )}
                            {course.subject && (
                              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">{course.subject.code}</span>
                            )}
                          </div>
                          <h4 className="text-lg font-semibold text-slate-900">{course.title}</h4>
                          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{course.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/teacher/courses/${course.id}`}
                          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/teacher/courses/${course.id}/materials`}
                          className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
                        >
                          Materials
                        </Link>
                        {course.isPublished ? (
                          <button onClick={() => handleUnpublish(course.id)} className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition">
                            Unpublish
                          </button>
                        ) : (
                          <button onClick={() => handlePublish(course.id)} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition">
                            Publish
                          </button>
                        )}
                        <button onClick={() => handleDelete(course.id)} className="text-sm font-semibold text-red-600 hover:text-red-700 transition">
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

export default function TeacherCoursesPage() {
  return (
    <ProtectedRoute requireTeacher>
      <TeacherCoursesContent />
    </ProtectedRoute>
  );
}