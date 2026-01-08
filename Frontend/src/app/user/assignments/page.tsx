'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { assignmentApi, submissionApi } from '@/services/assignmentApi';
import { Assignment } from '@/types/assignment';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function StudentAssignmentsContent() {
  const { logout } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittedMap, setSubmittedMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await assignmentApi.getForStudent();
      setAssignments(data);

      // Check submission status for each assignment
      const submissionStatus: Record<number, boolean> = {};
      for (const assignment of data) {
        try {
          submissionStatus[assignment.id] = await submissionApi.hasSubmitted(assignment.id);
        } catch {
          submissionStatus[assignment.id] = false;
        }
      }
      setSubmittedMap(submissionStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return 'none';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (diff < 0) return 'passed';
    if (hours < 24) return 'urgent';
    if (hours < 72) return 'soon';
    return 'normal';
  };

  const groupedAssignments = {
    upcoming: assignments.filter(a => {
      const status = getDeadlineStatus(a.deadline);
      return status === 'urgent' || status === 'soon';
    }),
    normal: assignments.filter(a => getDeadlineStatus(a.deadline) === 'normal' || getDeadlineStatus(a.deadline) === 'none'),
    passed: assignments.filter(a => getDeadlineStatus(a.deadline) === 'passed')
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-orange-200/60 via-amber-200/50 to-yellow-200/50 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/user/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white font-semibold shadow">
              CM
            </Link>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">My Assignments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/user/dashboard" className="text-sm text-slate-600 hover:text-blue-600 transition">Dashboard</Link>
            <Link href="/user/courses" className="text-sm text-slate-600 hover:text-blue-600 transition">Courses</Link>
            <Link href="/user/assignments" className="text-sm font-medium text-blue-600 transition">Assignments</Link>
            <Link href="/user/grades" className="text-sm text-slate-600 hover:text-blue-600 transition">Grades</Link>
            <button onClick={logout} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div>
            <h2 className="text-3xl font-black text-slate-900">My Assignments</h2>
            <p className="text-sm text-slate-600">View and submit your assignments</p>
          </div>

          {error && <div className="mt-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">{error}</div>}

          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : assignments.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                <p className="text-sm text-slate-500">No assignments available. Enroll in courses to see assignments.</p>
                <Link href="/user/courses" className="mt-2 inline-block text-sm font-semibold text-orange-600">
                  Browse courses
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Urgent/Upcoming */}
                {groupedAssignments.upcoming.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-4">Due Soon</h3>
                    <div className="space-y-3">
                      {groupedAssignments.upcoming.map((assignment) => (
                        <AssignmentCard
                          key={assignment.id}
                          assignment={assignment}
                          submitted={submittedMap[assignment.id]}
                          formatDeadline={formatDeadline}
                          getDeadlineStatus={getDeadlineStatus}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Normal */}
                {groupedAssignments.normal.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Upcoming</h3>
                    <div className="space-y-3">
                      {groupedAssignments.normal.map((assignment) => (
                        <AssignmentCard
                          key={assignment.id}
                          assignment={assignment}
                          submitted={submittedMap[assignment.id]}
                          formatDeadline={formatDeadline}
                          getDeadlineStatus={getDeadlineStatus}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Passed */}
                {groupedAssignments.passed.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-400 mb-4">Past Due</h3>
                    <div className="space-y-3">
                      {groupedAssignments.passed.map((assignment) => (
                        <AssignmentCard
                          key={assignment.id}
                          assignment={assignment}
                          submitted={submittedMap[assignment.id]}
                          formatDeadline={formatDeadline}
                          getDeadlineStatus={getDeadlineStatus}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function AssignmentCard({
  assignment,
  submitted,
  formatDeadline,
  getDeadlineStatus
}: {
  assignment: Assignment;
  submitted: boolean;
  formatDeadline: (d?: string) => string;
  getDeadlineStatus: (d?: string) => string;
}) {
  const status = getDeadlineStatus(assignment.deadline);

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {submitted ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Submitted</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Not Submitted</span>
            )}
            {assignment.course && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">{assignment.course.title}</span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{assignment.maxScore} pts</span>
          </div>
          <h4 className="text-lg font-semibold text-slate-900">{assignment.title}</h4>
          <p className="text-sm text-slate-500 line-clamp-2">{assignment.description || 'No description'}</p>
          <p className={`mt-2 text-sm font-semibold ${status === 'passed' ? 'text-red-600' : status === 'urgent' ? 'text-red-500' : status === 'soon' ? 'text-amber-600' : 'text-slate-600'}`}>
            Deadline: {formatDeadline(assignment.deadline)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/user/assignments/${assignment.id}`}
            className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow"
          >
            {submitted ? 'View Submission' : 'Submit'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StudentAssignmentsPage() {
  return (
    <ProtectedRoute>
      <StudentAssignmentsContent />
    </ProtectedRoute>
  );
}
