'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { courseApi } from '@/services/courseApi';
import { Course, CourseEnrollment } from '@/types/course';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Calendar, BarChart3, LogOut } from 'lucide-react';

function StudentCoursesContent() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'enrolled'>('enrolled');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courses, enrollments] = await Promise.all([
        courseApi.getPublished(),
        courseApi.getMyEnrollments()
      ]);
      setAvailableCourses(courses);
      setMyEnrollments(enrollments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      setEnrolling(courseId);
      await courseApi.enroll(courseId);
      setSuccess('Successfully enrolled in course');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  const handleUnenroll = async (courseId: number) => {
    if (!confirm('Are you sure you want to unenroll from this course?')) return;
    try {
      await courseApi.unenroll(courseId);
      setSuccess('Successfully unenrolled from course');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unenroll');
    }
  };

  const enrolledCourseIds = myEnrollments.map(e => e.course?.id);

  const navItems = [
    { href: '/user/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/user/courses', label: 'Mes cours', icon: BookOpen },
    { href: '/user/assignments', label: 'Devoirs', icon: Calendar },
    { href: '/user/grades', label: 'Notes', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
        <div className="flex items-center gap-3 border-b border-white/40 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-500 text-white font-semibold shadow">
            CM
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
            <p className="text-xs text-slate-500">Courses</p>
          </div>
        </div>

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
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 🆕 Bouton déconnexion - Proposition 1 */}
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

      <div className="relative ml-64 min-h-screen flex-1 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-cyan-200/60 via-blue-200/50 to-indigo-200/50 blur-3xl" />
        </div>

        <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <input
              type="text"
              placeholder="Rechercher des cours, des devoirs..."
              className="w-96 rounded-lg border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </div>
        </nav>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Courses</h2>
                <p className="text-sm text-slate-600">Browse and enroll in courses</p>
              </div>
              <div className="flex gap-2">
                {/* 🆕 Badge corrigé : n'affiche le compteur qu'après chargement */}
                <button
                  onClick={() => setActiveTab('enrolled')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === 'enrolled' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  My Courses {!loading && `(${myEnrollments.length})`}
                </button>
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === 'browse' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Browse All
                </button>
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

            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                </div>
              ) : activeTab === 'enrolled' ? (
                myEnrollments.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                    <p className="text-sm text-slate-500">You are not enrolled in any courses yet.</p>
                    <button 
                      onClick={() => setActiveTab('browse')} 
                      className="mt-2 text-sm font-semibold text-cyan-600"
                    >
                      Browse courses
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {myEnrollments.map((enrollment) => (
                      <div key={enrollment.id} className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            Enrolled
                          </span>
                          {enrollment.course?.subject && (
                            <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs text-cyan-700">
                              {enrollment.course.subject.code}
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900">{enrollment.course?.title}</h4>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                          {enrollment.course?.description || 'No description'}
                        </p>
                        {enrollment.course?.teacher && (
                          <p className="mt-2 text-sm text-slate-600">
                            Teacher: {enrollment.course.teacher.userFirstName} {enrollment.course.teacher.userLastName}
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            href={`/user/courses/${enrollment.course?.id}`}
                            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow"
                          >
                            View Course
                          </Link>
                          <button
                            onClick={() => handleUnenroll(enrollment.course?.id || 0)}
                            className="text-sm font-semibold text-red-600 hover:text-red-700"
                          >
                            Unenroll
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                availableCourses.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                    <p className="text-sm text-slate-500">No courses available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availableCourses.map((course) => {
                      const isEnrolled = enrolledCourseIds.includes(course.id);
                      return (
                        <div key={course.id} className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            {isEnrolled && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                Enrolled
                              </span>
                            )}
                            {course.subject && (
                              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs text-cyan-700">
                                {course.subject.code}
                              </span>
                            )}
                          </div>
                          <h4 className="text-lg font-semibold text-slate-900">{course.title}</h4>
                          <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                            {course.description || 'No description'}
                          </p>
                          {course.teacher && (
                            <p className="mt-2 text-sm text-slate-600">
                              Teacher: {course.teacher.userFirstName} {course.teacher.userLastName}
                            </p>
                          )}
                          <div className="mt-4">
                            {isEnrolled ? (
                              <Link
                                href={`/user/courses/${course.id}`}
                                className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow"
                              >
                                View Course
                              </Link>
                            ) : (
                              <button
                                onClick={() => handleEnroll(course.id)}
                                disabled={enrolling === course.id}
                                className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow disabled:opacity-60"
                              >
                                {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StudentCoursesPage() {
  return (
    <ProtectedRoute>
      <StudentCoursesContent />
    </ProtectedRoute>
  );
}