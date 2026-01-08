'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { gradeApi } from '@/services/assignmentApi';
import { Grade } from '@/types/assignment';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function StudentGradesContent() {
  const { logout } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageScore, setAverageScore] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gradesData, avgData] = await Promise.all([
        gradeApi.getMyGrades(),
        gradeApi.getMyAverageScore()
      ]);
      setGrades(gradesData);
      setAverageScore(avgData.averageScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getGradeBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700' };
    if (percentage >= 80) return { label: 'Very Good', color: 'bg-green-100 text-green-700' };
    if (percentage >= 70) return { label: 'Good', color: 'bg-blue-100 text-blue-700' };
    if (percentage >= 60) return { label: 'Satisfactory', color: 'bg-cyan-100 text-cyan-700' };
    if (percentage >= 50) return { label: 'Pass', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Fail', color: 'bg-red-100 text-red-700' };
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-emerald-200/60 via-teal-200/50 to-cyan-200/50 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/user/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white font-semibold shadow">
              CM
            </Link>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">My Grades</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/user/dashboard" className="text-sm text-slate-600 hover:text-blue-600 transition">Dashboard</Link>
            <Link href="/user/courses" className="text-sm text-slate-600 hover:text-blue-600 transition">Courses</Link>
            <Link href="/user/assignments" className="text-sm text-slate-600 hover:text-blue-600 transition">Assignments</Link>
            <Link href="/user/grades" className="text-sm font-medium text-blue-600 transition">Grades</Link>
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
              <h2 className="text-3xl font-black text-slate-900">My Grades</h2>
              <p className="text-sm text-slate-600">View your academic performance</p>
            </div>
            {averageScore !== null && (
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-center text-white shadow-lg">
                <p className="text-xs uppercase tracking-wide opacity-80">Overall Average</p>
                <p className="text-3xl font-bold">{averageScore.toFixed(1)}</p>
              </div>
            )}
          </div>

          {error && <div className="mt-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">{error}</div>}

          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : grades.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                <p className="text-sm text-slate-500">No grades yet. Submit assignments to see your grades.</p>
                <Link href="/user/assignments" className="mt-2 inline-block text-sm font-semibold text-emerald-600">
                  View assignments
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {grades.map((grade) => {
                  const maxScore = grade.submission?.assignment?.maxScore || 20;
                  const badge = getGradeBadge(grade.score, maxScore);

                  return (
                    <div key={grade.id} className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.color}`}>
                              {badge.label}
                            </span>
                            {grade.submission?.assignment?.course && (
                              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                                {grade.submission.assignment.course.title}
                              </span>
                            )}
                            {grade.submission?.isLate && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Late Submission</span>
                            )}
                          </div>
                          <h4 className="text-lg font-semibold text-slate-900">
                            {grade.submission?.assignment?.title || 'Assignment'}
                          </h4>
                          <p className="text-sm text-slate-500">
                            Graded on {new Date(grade.gradedAt).toLocaleDateString()}
                            {grade.gradedBy && ` by ${grade.gradedBy.userFirstName} ${grade.gradedBy.userLastName}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-3xl font-bold ${getGradeColor(grade.score, maxScore)}`}>
                            {grade.score}
                          </p>
                          <p className="text-sm text-slate-500">out of {maxScore}</p>
                        </div>
                      </div>
                      {grade.feedback && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Feedback</p>
                          <p className="text-sm text-slate-700">{grade.feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StudentGradesPage() {
  return (
    <ProtectedRoute>
      <StudentGradesContent />
    </ProtectedRoute>
  );
}
