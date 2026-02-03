'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, usePathname } from 'next/navigation';
import { assignmentApi, submissionApi, gradeApi } from '@/services/assignmentApi';
import { Assignment, Submission } from '@/types/assignment';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, ClipboardList, MessageSquare, LogOut, ArrowLeft, GraduationCap, Bell } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { useNotifications } from '@/context/NotificationContext';

function SubmissionsContent() {
  const { logout } = useAuth();
  const params = useParams();
  const pathname = usePathname();
  const assignmentId = parseInt(params.id as string);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [gradeData, setGradeData] = useState({ score: 0, feedback: '' });

  useEffect(() => {
    if (assignmentId) {
      loadData();
    }
  }, [assignmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 🆕 Utiliser les bonnes fonctions
      const [assignmentData, submissionsData] = await Promise.all([
        assignmentApi.getById(assignmentId),
        submissionApi.getByAssignment(assignmentId)
      ]);
      
      setAssignment(assignmentData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId: number) => {
    if (gradeData.score > (assignment?.maxScore || 20)) {
      setError(`Score cannot exceed ${assignment?.maxScore || 20}`);
      return;
    }

    try {
      // 🆕 Utiliser gradeApi.grade() au lieu de assignmentApi.gradeSubmission()
      await gradeApi.grade(submissionId, {
        score: gradeData.score,
        feedback: gradeData.feedback || undefined
      });
      
      setSuccess('Submission graded successfully');
      setGradingId(null);
      setGradeData({ score: 0, feedback: '' });
      loadData(); // Recharger pour avoir la note mise à jour
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grade submission');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isLateSubmission = (submission: Submission) => {
    return submission.isLate; // 🆕 Utiliser la propriété isLate du backend
  };

  const { unreadCount } = useNotifications();

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
            const isActive = pathname.startsWith(item.href);
            
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

      {/* CONTENU PRINCIPAL */}
      <div className="relative ml-64 min-h-screen flex-1 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-purple-200/60 via-indigo-200/50 to-violet-200/50 blur-3xl" />
          <div className="absolute -left-12 bottom-10 h-72 w-72 rounded-full bg-gradient-to-br from-purple-400/25 via-indigo-300/25 to-violet-300/25 blur-3xl" />
        </div>

        <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/teacher/assignments"
              className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Assignments
            </Link>
          </div>
        </nav>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
            {/* Header */}
            {assignment && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  {assignment.isPublished ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Draft
                    </span>
                  )}
                  {assignment.course && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                      {assignment.course.title}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-black text-slate-900">{assignment.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{assignment.description}</p>
                <div className="mt-4 flex gap-4 text-sm">
                  <span className="text-slate-600">
                    Max Score: <span className="font-semibold text-slate-900">{assignment.maxScore} pts</span>
                  </span>
                  <span className="text-slate-600">
                    Deadline: <span className="font-semibold text-slate-900">{formatDate(assignment.deadline)}</span>
                  </span>
                  <span className="text-slate-600">
                    Submissions: <span className="font-semibold text-purple-600">{submissions.length}</span>
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-800">
                {success}
              </div>
            )}

            {/* Liste des soumissions */}
            <div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-12 text-center">
                  <p className="text-slate-500">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-slate-900">
                              {submission.student?.userFirstName} {submission.student?.userLastName}
                            </span>
                            <span className="text-sm text-slate-500">
                              ({submission.student?.userEmail})
                            </span>
                            
                            {/* 🆕 Affichage du statut de notation */}
                            {submission.grade ? (
                              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                                Graded: {submission.grade.score}/{assignment?.maxScore}
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                Pending
                              </span>
                            )}
                            
                            {/* 🆕 Badge Late */}
                            {isLateSubmission(submission) && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                Late
                              </span>
                            )}
                            
                            {/* Version du fichier */}
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              v{submission.version}
                            </span>
                          </div>

                          <p className="text-sm text-slate-600">
                            Submitted: {formatDate(submission.submittedAt)}
                          </p>

                          {/* 🆕 Affichage du fichier */}
                          {submission.fileName && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-slate-500">File:</span>
                              <button
                                onClick={() => submissionApi.download(submission.id, submission.fileName!)}
                                className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
                              >
                                📎 {submission.fileName}
                              </button>
                              {submission.fileSize && (
                                <span className="text-xs text-slate-400">
                                  ({Math.round(submission.fileSize / 1024)} KB)
                                </span>
                              )}
                            </div>
                          )}

                          {/* Commentaire de l'étudiant */}
                          {submission.comment && (
                            <p className="mt-2 text-sm text-slate-700 italic">&quot;{submission.comment}&quot;</p>
                          )}

                          {/* 🆕 Affichage du feedback */}
                          {submission.grade?.feedback && (
                            <div className="mt-3 rounded-lg bg-purple-50 p-3">
                              <p className="text-xs font-semibold text-purple-900 mb-1">Your Feedback:</p>
                              <p className="text-sm text-purple-800">{submission.grade.feedback}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions de notation */}
                        <div className="flex flex-col gap-2">
                          {gradingId === submission.id ? (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3 min-w-[250px]">
                              <div>
                                <label className="text-xs font-semibold text-slate-700">
                                  Score (max: {assignment?.maxScore})
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={assignment?.maxScore || 20}
                                  step="0.5"
                                  value={gradeData.score}
                                  onChange={(e) => setGradeData({ ...gradeData, score: parseFloat(e.target.value) })}
                                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-slate-700">Feedback</label>
                                <textarea
                                  value={gradeData.feedback}
                                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm"
                                  rows={3}
                                  placeholder="Optional feedback..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleGrade(submission.id)}
                                  className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-xs font-semibold text-white shadow hover:shadow-lg transition"
                                >
                                  Submit Grade
                                </button>
                                <button
                                  onClick={() => setGradingId(null)}
                                  className="text-xs font-semibold text-slate-600 hover:text-slate-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setGradingId(submission.id);
                                setGradeData({
                                  score: submission.grade?.score || 0,
                                  feedback: submission.grade?.feedback || ''
                                });
                              }}
                              className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:shadow-lg transition whitespace-nowrap"
                            >
                              {submission.grade ? 'Edit Grade' : 'Grade'}
                            </button>
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
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <ProtectedRoute requireTeacher>
      <SubmissionsContent />
    </ProtectedRoute>
  );
}