'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, ClipboardList, MessageSquare, Bell, LogOut, GraduationCap, ChevronDown, ChevronRight, Search, User } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { useNotifications } from '@/context/NotificationContext';
import { courseApi } from '@/services/courseApi';
import { gradeApi, assignmentApi } from '@/services/assignmentApi';
import { Course } from '@/types/course';
import { Grade, Assignment } from '@/types/assignment';

interface CourseGradeData {
  course: Course;
  grades: Grade[];
  assignments: Assignment[];
  stats: { averageScore: number } | null;
  expanded: boolean;
}

function TeacherGradesContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const [courseGrades, setCourseGrades] = useState<CourseGradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const navItems = [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/teacher/courses', label: 'Courses', icon: BookOpen },
    { href: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/teacher/grades', label: 'Grades', icon: GraduationCap },
    { href: '/teacher/messages', label: 'Messages', icon: MessageSquare },
    { href: '/teacher/notifications', label: 'Notifications', icon: Bell },
  ];

  useEffect(() => {
    loadCourseGrades();
  }, []);

  const loadCourseGrades = async () => {
    try {
      setLoading(true);
      setError('');

      // Get teacher's courses
      const courses = await courseApi.getMyCourses();

      // For each course, get grades, assignments, and stats
      const courseDataPromises = courses.map(async (course) => {
        try {
          const [grades, assignments, stats] = await Promise.all([
            gradeApi.getByCourse(course.id),
            assignmentApi.getByCourse(course.id),
            gradeApi.getCourseStats(course.id).catch(() => null),
          ]);
          return {
            course,
            grades,
            assignments,
            stats,
            expanded: false,
          };
        } catch {
          return {
            course,
            grades: [],
            assignments: [],
            stats: null,
            expanded: false,
          };
        }
      });

      const courseData = await Promise.all(courseDataPromises);
      setCourseGrades(courseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseExpand = (courseId: number) => {
    setCourseGrades(prev =>
      prev.map(cg =>
        cg.course.id === courseId ? { ...cg, expanded: !cg.expanded } : cg
      )
    );
  };

  const filteredCourseGrades = courseGrades.filter(cg => {
    const matchesSearch = cg.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cg.grades.some(g =>
        g.submission?.student?.userFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.submission?.student?.userLastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCourse = selectedCourse === null || cg.course.id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-emerald-600 bg-emerald-50';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
        <div className="flex items-center gap-3 border-b border-white/40 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-500 text-white font-semibold shadow">
            CM
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
            <p className="text-xs text-slate-500">Teacher workspace</p>
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

      {/* MAIN CONTENT */}
      <div className="relative ml-64 min-h-screen flex-1 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-purple-200/60 via-indigo-200/50 to-blue-200/50 blur-3xl" />
          <div className="absolute -left-12 bottom-10 h-72 w-72 rounded-full bg-gradient-to-br from-purple-400/25 via-indigo-300/25 to-blue-300/25 blur-3xl" />
        </div>

        <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <input
              type="text"
              placeholder="Search for courses, students, or materials..."
              className="w-96 rounded-lg border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            />
            <div className="flex items-center gap-3">
              <NotificationBell notificationsHref="/teacher/notifications" />
              <span className="hidden text-sm text-slate-700 sm:inline">
                Welcome, {user?.userFirstName}
              </span>
            </div>
          </div>
        </nav>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-purple-600">
                  Teacher
                </p>
                <h2 className="text-3xl font-black text-slate-900">Grades Overview</h2>
                <p className="text-sm text-slate-600">
                  View and manage grades for all your courses.
                </p>
              </div>
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                <GraduationCap className="h-4 w-4 mr-2" />
                Grade Management
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Search and Filter */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by course or student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white/80 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                />
              </div>
              <select
                value={selectedCourse || ''}
                onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : null)}
                className="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
              >
                <option value="">All Courses</option>
                {courseGrades.map(cg => (
                  <option key={cg.course.id} value={cg.course.id}>
                    {cg.course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Grades List */}
            {loading ? (
              <div className="mt-8 flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
              </div>
            ) : filteredCourseGrades.length === 0 ? (
              <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-lg font-semibold text-slate-900">No grades found</p>
                <p className="text-sm text-slate-500">
                  {searchTerm || selectedCourse
                    ? 'Try adjusting your search or filter'
                    : 'Grades will appear here once students submit assignments'}
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {filteredCourseGrades.map((courseData) => (
                  <div
                    key={courseData.course.id}
                    className="rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur overflow-hidden"
                  >
                    {/* Course Header */}
                    <button
                      onClick={() => toggleCourseExpand(courseData.course.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold shadow">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-slate-900">{courseData.course.title}</h3>
                          <p className="text-sm text-slate-500">
                            {courseData.grades.length} grade{courseData.grades.length !== 1 ? 's' : ''} •
                            {courseData.assignments.length} assignment{courseData.assignments.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {courseData.stats && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Course Average</p>
                            <p className="text-lg font-bold text-purple-600">
                              {courseData.stats.averageScore.toFixed(1)}%
                            </p>
                          </div>
                        )}
                        {courseData.expanded ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Grade List */}
                    {courseData.expanded && (
                      <div className="border-t border-slate-100 p-5">
                        {courseData.grades.length === 0 ? (
                          <p className="text-center text-sm text-slate-500 py-4">
                            No grades recorded for this course yet
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-slate-100">
                                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Student
                                  </th>
                                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Assignment
                                  </th>
                                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Score
                                  </th>
                                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Feedback
                                  </th>
                                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Graded At
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {courseData.grades.map((grade) => {
                                  const maxScore = grade.submission?.assignment?.maxScore || 100;
                                  return (
                                    <tr key={grade.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                                            <User className="h-4 w-4 text-slate-500" />
                                          </div>
                                          <div>
                                            <p className="font-medium text-slate-900">
                                              {grade.submission?.student?.userFirstName} {grade.submission?.student?.userLastName}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                              {grade.submission?.student?.userEmail}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <p className="text-sm font-medium text-slate-900">
                                          {grade.submission?.assignment?.title || 'Unknown Assignment'}
                                        </p>
                                      </td>
                                      <td className="py-3 px-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${getGradeColor(grade.score, maxScore)}`}>
                                          {grade.score}/{maxScore}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        <p className="text-sm text-slate-600 max-w-xs truncate">
                                          {grade.feedback || '-'}
                                        </p>
                                      </td>
                                      <td className="py-3 px-4">
                                        <p className="text-sm text-slate-500">
                                          {new Date(grade.gradedAt).toLocaleDateString()}
                                        </p>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Summary Stats */}
            {!loading && filteredCourseGrades.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Courses
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {filteredCourseGrades.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Grades
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {filteredCourseGrades.reduce((sum, cg) => sum + cg.grades.length, 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Overall Average
                  </p>
                  <p className="mt-1 text-2xl font-bold text-purple-600">
                    {(() => {
                      const coursesWithStats = filteredCourseGrades.filter(cg => cg.stats);
                      if (coursesWithStats.length === 0) return '-';
                      const avg = coursesWithStats.reduce((sum, cg) => sum + (cg.stats?.averageScore || 0), 0) / coursesWithStats.length;
                      return avg.toFixed(1) + '%';
                    })()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TeacherGrades() {
  return (
    <ProtectedRoute requireTeacher>
      <TeacherGradesContent />
    </ProtectedRoute>
  );
}
