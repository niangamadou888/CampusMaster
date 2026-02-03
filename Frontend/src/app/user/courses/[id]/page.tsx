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
import { LayoutDashboard, BookOpen, Calendar, BarChart3, LogOut, MessageSquare, Bell } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { useNotifications } from '@/context/NotificationContext';

function CourseDetailContent() {
  const params = useParams();
  const pathname = usePathname();
  const courseId = Number(params.id);
  const { logout, user } = useAuth();
  const { unreadCount } = useNotifications();

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'assignments'>('overview');

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'PDF': return '📄';
      case 'PPT': case 'PPTX': return '📊';
      case 'DOC': case 'DOCX': return '📝';
      case 'VIDEO': return '🎬';
      case 'IMAGE': return '🖼️';
      default: return '📁';
    }
  };

  // 🎨 Items de navigation pour la sidebar
  const navItems = [
    { href: '/user/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/user/courses', label: 'Mes cours', icon: BookOpen },
    { href: '/user/assignments', label: 'Devoirs', icon: Calendar },
    { href: '/user/grades', label: 'Notes', icon: BarChart3 },
    { href: '/user/messages', label: 'Messages', icon: MessageSquare },
    { href: '/user/notifications', label: 'Notifications', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar même pendant le chargement */}
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-white/40 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-500 text-white font-semibold shadow">
              CM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">Course Details</p>
            </div>
          </div>
        </aside>

        <div className="ml-64 flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar même en cas d'erreur */}
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-white/40 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-500 text-white font-semibold shadow">
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
            <Link href="/user/courses" className="text-cyan-600 hover:underline">
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-500 text-white font-semibold shadow">
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
            // 🎯 IMPORTANT : On considère que /user/courses/[id] fait partie de "Mes cours"
            const isActive = item.href === '/user/courses' && pathname.startsWith('/user/courses') 
              ? true 
              : pathname === item.href;
            
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
                {item.href === '/user/notifications' && unreadCount > 0 && (
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
          <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-cyan-200/60 via-blue-200/50 to-indigo-200/50 blur-3xl" />
        </div>

        {/* Barre en haut avec recherche */}
        <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <input
              type="text"
              placeholder="Rechercher dans le cours..."
              className="w-96 rounded-lg border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
            <div className="flex items-center gap-3">
              <NotificationBell notificationsHref="/user/notifications" />
              <span className="hidden text-sm text-slate-700 sm:inline">
                Welcome, {user?.userFirstName}
              </span>
            </div>
          </div>
        </nav>

        {/* Contenu de la page */}
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link href="/user/courses" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-cyan-600 mb-6 transition">
            <span>←</span> Back to Courses
          </Link>

          {/* Course Header */}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {course.subject && (
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                      {course.subject.code}
                    </span>
                  )}
                  {course.isPublished && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Published
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-black text-slate-900">{course.title}</h1>
                <p className="mt-2 text-slate-600">{course.description || 'No description available'}</p>

                {course.teacher && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                      {course.teacher.userFirstName?.[0]}{course.teacher.userLastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {course.teacher.userFirstName} {course.teacher.userLastName}
                      </p>
                      <p className="text-xs text-slate-500">Instructor</p>
                    </div>
                  </div>
                )}
              </div>

              {course.subject && (
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Credits</p>
                  <p className="text-2xl font-bold text-slate-900">{course.subject.credits || 3}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'overview' ? 'bg-cyan-600 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'materials' ? 'bg-cyan-600 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
              }`}
            >
              Materials ({materials.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'assignments' ? 'bg-cyan-600 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
              }`}
            >
              Assignments ({assignments.length})
            </button>
            <Link
              href={`/user/courses/${courseId}/forum`}
              className="rounded-full px-4 py-2 text-sm font-semibold bg-white/80 text-slate-700 hover:bg-indigo-600 hover:text-white transition flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Forum
            </Link>
          </div>

          {/* Tab Content */}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Course Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Subject</p>
                    <p className="text-lg font-semibold text-slate-900">{course.subject?.name || 'N/A'}</p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Department</p>
                    <p className="text-lg font-semibold text-slate-900">{course.subject?.department?.name || 'N/A'}</p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Semester</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {course.subject?.semester ? `${course.subject.semester.name} ${course.subject.semester.year}` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Quick Stats</h3>
                  <div className="flex gap-4">
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-2xl font-bold text-cyan-600">{materials.length}</p>
                      <p className="text-xs text-slate-500">Materials</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-2xl font-bold text-orange-600">{assignments.length}</p>
                      <p className="text-xs text-slate-500">Assignments</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Course Materials</h2>

                {materials.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                    <p className="text-sm text-slate-500">No materials available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div key={material.id} className="rounded-2xl border border-slate-100 bg-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getFileIcon(material.fileType)}</span>
                          <div>
                            <p className="font-semibold text-slate-900">{material.title}</p>
                            {material.description && (
                              <p className="text-sm text-slate-500">{material.description}</p>
                            )}
                            <p className="text-xs text-slate-400">
                              {material.fileName} • {material.fileSize ? `${(material.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => materialApi.download(courseId, material.id, material.fileName)}
                          className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-lg transition"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Assignments</h2>

                {assignments.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                    <p className="text-sm text-slate-500">No assignments available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((assignment) => {
                      const isPastDue = assignment.deadline && new Date(assignment.deadline) < new Date();

                      return (
                        <div key={assignment.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  isPastDue ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {isPastDue ? 'Past Due' : 'Open'}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                  {assignment.maxScore} pts
                                </span>
                              </div>
                              <p className="font-semibold text-slate-900">{assignment.title}</p>
                              {assignment.description && (
                                <p className="text-sm text-slate-500 line-clamp-2">{assignment.description}</p>
                              )}
                              <p className={`text-sm mt-1 ${isPastDue ? 'text-red-600' : 'text-slate-600'}`}>
                                Deadline: {formatDate(assignment.deadline)}
                              </p>
                            </div>
                            <Link
                              href={`/user/assignments/${assignment.id}`}
                              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-lg transition text-center"
                            >
                              View / Submit
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  return (
    <ProtectedRoute>
      <CourseDetailContent />
    </ProtectedRoute>
  );
}