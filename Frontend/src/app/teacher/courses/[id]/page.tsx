'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { courseApi, materialApi } from '@/services/courseApi';
import { assignmentApi } from '@/services/assignmentApi';
import { Course, CourseMaterial } from '@/types/course';
import { Assignment } from '@/types/assignment';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, ClipboardList, LogOut } from 'lucide-react';

function TeacherCourseDetailContent() {
  const params = useParams();
  const pathname = usePathname();
  const courseId = Number(params.id);
  const { logout } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseData, materialsData, assignmentsData] = await Promise.all([
        courseApi.getById(courseId),
        materialApi.getByCourse(courseId),
        assignmentApi.getByCourse(courseId)
      ]);
      setCourse(courseData);
      setMaterials(materialsData);
      setAssignments(assignmentsData);

      // Get enrollment count
      try {
        const students = await courseApi.getEnrolledStudents(courseId);
        setEnrollmentCount(students.length);
      } catch {
        setEnrollmentCount(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      await courseApi.publish(courseId);
      setSuccess('Course published successfully');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish course');
    }
  };

  const handleUnpublish = async () => {
    try {
      await courseApi.unpublish(courseId);
      setSuccess('Course unpublished successfully');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish course');
    }
  };

  // 🎨 Items de navigation pour la sidebar Teacher
  const navItems = [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/courses', label: 'Courses', icon: BookOpen },
    { href: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-white/40 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500 text-white font-semibold shadow">
              CM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">Course Details</p>
            </div>
          </div>
        </aside>
        <div className="ml-64 flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-white/40 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500 text-white font-semibold shadow">
              CM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">Course Details</p>
            </div>
          </div>
        </aside>
        <div className="ml-64 flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
            <Link href="/teacher/courses" className="text-purple-600 hover:underline">
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-xs text-slate-500">Course Details</p>
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
              placeholder="Search..."
              className="w-96 rounded-lg border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </nav>

        {/* Contenu de la page */}
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link href="/teacher/courses" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 mb-6 transition">
            <span>←</span> Back to Courses
          </Link>

          {success && (
            <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-800">
              {success}
            </div>
          )}

          {/* Course Header */}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {course.subject && (
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {course.subject.code}
                    </span>
                  )}
                  {course.isPublished ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Published</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Draft</span>
                  )}
                </div>
                <h1 className="text-3xl font-black text-slate-900">{course.title}</h1>
                <p className="mt-2 text-slate-600">{course.description || 'No description'}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/teacher/courses/${courseId}/materials`}
                    className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-lg transition"
                  >
                    Manage Materials
                  </Link>
                  <Link
                    href={`/teacher/assignments?courseId=${courseId}`}
                    className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-lg transition"
                  >
                    Manage Assignments
                  </Link>
                  {course.isPublished ? (
                    <button
                      onClick={handleUnpublish}
                      className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition"
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={handlePublish}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 text-center min-w-[100px]">
                  <p className="text-2xl font-bold text-indigo-600">{enrollmentCount}</p>
                  <p className="text-xs text-slate-500">Students</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 text-center min-w-[100px]">
                  <p className="text-2xl font-bold text-purple-600">{materials.length}</p>
                  <p className="text-xs text-slate-500">Materials</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 text-center min-w-[100px]">
                  <p className="text-2xl font-bold text-orange-600">{assignments.length}</p>
                  <p className="text-xs text-slate-500">Assignments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Materials Preview */}
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Materials</h2>
                <Link href={`/teacher/courses/${courseId}/materials`} className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition">
                  View All
                </Link>
              </div>

              {materials.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-center">
                  <p className="text-sm text-slate-500">No materials yet</p>
                  <Link href={`/teacher/courses/${courseId}/materials`} className="mt-2 inline-block text-sm font-semibold text-purple-600 hover:text-purple-700 transition">
                    Upload materials
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {materials.slice(0, 5).map((material) => (
                    <div key={material.id} className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-3">
                      <span className="text-lg">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{material.title}</p>
                        <p className="text-xs text-slate-500">{material.fileName}</p>
                      </div>
                    </div>
                  ))}
                  {materials.length > 5 && (
                    <p className="text-sm text-slate-500 text-center pt-2">+{materials.length - 5} more</p>
                  )}
                </div>
              )}
            </div>

            {/* Assignments Preview */}
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Assignments</h2>
                <Link href="/teacher/assignments" className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition">
                  View All
                </Link>
              </div>

              {assignments.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-center">
                  <p className="text-sm text-slate-500">No assignments yet</p>
                  <Link href="/teacher/assignments" className="mt-2 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700 transition">
                    Create assignment
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="rounded-xl border border-slate-100 bg-white p-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {assignment.isPublished ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Published</span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Draft</span>
                          )}
                        </div>
                        <p className="font-medium text-slate-900 truncate">{assignment.title}</p>
                        <p className="text-xs text-slate-500">
                          {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'No deadline'}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-600">{assignment.maxScore} pts</span>
                    </div>
                  ))}
                  {assignments.length > 5 && (
                    <p className="text-sm text-slate-500 text-center pt-2">+{assignments.length - 5} more</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subject Info */}
          {course.subject && (
            <div className="mt-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Subject Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Subject</p>
                  <p className="font-semibold text-slate-900">{course.subject.name}</p>
                  <p className="text-sm text-slate-600">{course.subject.code}</p>
                </div>
                {course.subject.department && (
                  <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Department</p>
                    <p className="font-semibold text-slate-900">{course.subject.department.name}</p>
                  </div>
                )}
                {course.subject.semester && (
                  <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Semester</p>
                    <p className="font-semibold text-slate-900">{course.subject.semester.name} {course.subject.semester.year}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function TeacherCourseDetailPage() {
  return (
    <ProtectedRoute requireTeacher>
      <TeacherCourseDetailContent />
    </ProtectedRoute>
  );
}