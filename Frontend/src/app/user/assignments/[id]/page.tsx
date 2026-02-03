'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { assignmentApi, submissionApi, gradeApi } from '@/services/assignmentApi';
import { Assignment, Submission, Grade } from '@/types/assignment';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Calendar, BarChart3, MessageSquare, LogOut, Upload, X, FileText, Download } from 'lucide-react';

function AssignmentDetailContent() {
  const params = useParams();
  const pathname = usePathname();
  const assignmentId = Number(params.id);
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [versions, setVersions] = useState<Submission[]>([]);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      loadData();
    }
  }, [assignmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const assignmentData = await assignmentApi.getById(assignmentId);
      setAssignment(assignmentData);

      // Check if student has submitted
      const hasSubmitted = await submissionApi.hasSubmitted(assignmentId);
      
      if (hasSubmitted) {
        const submissionData = await submissionApi.getMySubmissionForAssignment(assignmentId);
        setSubmission(submissionData);

        // Get all versions
        const versionsData = await submissionApi.getMyVersions(assignmentId);
        setVersions(versionsData);

        // Check if graded
        if (submissionData.id) {
          try {
            const gradeData = await gradeApi.getBySubmission(submissionData.id);
            setGrade(gradeData);
          } catch {
            // Not graded yet
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file to submit');
      return;
    }

    // Check version limit
    if (versions.length >= 3) {
      setError('You have reached the maximum number of submissions (3)');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await submissionApi.submit(assignmentId, selectedFile, comment);
      
      setSuccess('Assignment submitted successfully!');
      setSelectedFile(null);
      setComment('');
      
      // Reload data
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setComment('');
    setError('');
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

  const getDeadlineStatus = () => {
    if (!assignment?.deadline) return 'none';
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    return deadline < now ? 'passed' : 'active';
  };

  const navItems = [
    { href: '/user/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/user/courses', label: 'Mes cours', icon: BookOpen },
    { href: '/user/assignments', label: 'Devoirs', icon: Calendar },
    { href: '/user/grades', label: 'Notes', icon: BarChart3 },
    { href: '/user/messages', label: 'Messages', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-white/40 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white font-semibold shadow">
              CM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">Assignment</p>
            </div>
          </div>
        </aside>
        <div className="ml-64 flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-white/40 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white font-semibold shadow">
              CM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">Assignment</p>
            </div>
          </div>
        </aside>
        <div className="ml-64 flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/user/assignments" className="text-orange-600 hover:underline">
              Back to Assignments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const deadlineStatus = getDeadlineStatus();
  const canSubmit = deadlineStatus === 'active' && versions.length < 3;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
        <div className="flex items-center gap-3 border-b border-white/40 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white font-semibold shadow">
            CM
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
            <p className="text-xs text-slate-500">Assignment</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/user/assignments' && pathname.startsWith('/user/assignments')
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

      {/* MAIN CONTENT */}
      <div className="relative ml-64 min-h-screen flex-1 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-orange-200/60 via-amber-200/50 to-yellow-200/50 blur-3xl" />
        </div>

        <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-96 rounded-lg border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </nav>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/user/assignments" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-orange-600 mb-6 transition">
            <span>←</span> Back to Assignments
          </Link>

          {/* Assignment Header */}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {assignment?.course && (
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {assignment.course.title}
                    </span>
                  )}
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    deadlineStatus === 'passed' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {deadlineStatus === 'passed' ? 'Past Due' : 'Open'}
                  </span>
                  {grade && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      Graded
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-black text-slate-900">{assignment?.title}</h1>
                <p className="mt-2 text-slate-600">{assignment?.description || 'No description'}</p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Deadline:</span>
                    <span className={`ml-2 font-semibold ${deadlineStatus === 'passed' ? 'text-red-600' : 'text-slate-900'}`}>
                      {formatDate(assignment?.deadline)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Max Score:</span>
                    <span className="ml-2 font-semibold text-slate-900">{assignment?.maxScore} pts</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Submissions:</span>
                    <span className="ml-2 font-semibold text-slate-900">{versions.length} / 3</span>
                  </div>
                </div>
              </div>

              {grade && (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-center text-white shadow-lg">
                  <p className="text-xs uppercase tracking-wide opacity-80">Your Grade</p>
                  <p className="text-3xl font-bold">{grade.score}</p>
                  <p className="text-xs opacity-80">out of {assignment?.maxScore}</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50/80 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-800">
              {success}
            </div>
          )}

          {/* Current Submission or Upload Form */}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">
                {submission ? 'Your Submission' : 'Submit Your Work'}
              </h2>
            </div>

            {grade ? (
              /* Graded Submission */
              <div>
                <div className="rounded-2xl bg-slate-50 p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900">{submission?.fileName}</p>
                    <button
                      onClick={() => submission?.id && submission?.fileName && submissionApi.download(submission.id, submission.fileName)}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                  <p className="text-sm text-slate-500">
                    Submitted on {formatDate(submission?.submittedAt)}
                    {submission?.isLate && <span className="ml-2 text-amber-600 font-semibold">(Late)</span>}
                  </p>
                  {submission?.comment && (
                    <p className="mt-2 text-sm text-slate-600">Comment: {submission.comment}</p>
                  )}
                </div>

                {grade.feedback && (
                  <div className="rounded-2xl bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Teacher Feedback</p>
                    <p className="text-sm text-slate-700">{grade.feedback}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Graded on {formatDate(grade.gradedAt)} by {grade.gradedBy?.userFirstName} {grade.gradedBy?.userLastName}
                    </p>
                  </div>
                )}
              </div>
            ) : submission && !canSubmit ? (
              /* Submitted but not graded, no more submissions allowed */
              <div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900">{submission.fileName}</p>
                    <button
                      onClick={() => submission?.fileName && submissionApi.download(submission.id, submission.fileName)}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                  <p className="text-sm text-slate-500">
                    Submitted on {formatDate(submission.submittedAt)}
                    {submission.isLate && <span className="ml-2 text-amber-600 font-semibold">(Late)</span>}
                  </p>
                  {submission.comment && (
                    <p className="mt-2 text-sm text-slate-600">Comment: {submission.comment}</p>
                  )}
                </div>
                {deadlineStatus === 'passed' && (
                  <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                    The deadline has passed. You can no longer submit.
                  </div>
                )}
                {versions.length >= 3 && deadlineStatus === 'active' && (
                  <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                    You have reached the maximum number of submissions (3).
                  </div>
                )}
              </div>
            ) : (
              /* Upload Form */
              <div>
                {submission && (
                  <div className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                    You have already submitted. You can resubmit up to {3 - versions.length} more time(s).
                  </div>
                )}

                {/* Drag & Drop Area */}
                <div
                  className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
                    isDragging
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-slate-300 bg-slate-50/60'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.zip"
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="h-8 w-8 text-orange-600" />
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">{selectedFile.name}</p>
                        <p className="text-sm text-slate-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={handleCancel}
                        className="rounded-full p-2 hover:bg-slate-200 transition"
                      >
                        <X className="h-5 w-5 text-slate-600" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-slate-900 mb-1">
                        Glisser-déposer votre fichier ici
                      </p>
                      <p className="text-sm text-slate-500 mb-4">
                        ou cliquez pour parcourir vos fichiers
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2 text-sm font-semibold text-white shadow hover:shadow-lg transition"
                      >
                        Browse Files
                      </button>
                      <p className="text-xs text-slate-400 mt-3">
                        Formats acceptés : PDF, ZIP, DOCX (Max 50Mo)
                      </p>
                    </>
                  )}
                </div>

                {/* Comment */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Commentaire pour l&apos;enseignant (optionnel)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ajoutez une note concernant votre travail, les membres du groupe, etc..."
                    maxLength={500}
                    className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                    rows={4}
                  />
                  <p className="text-xs text-slate-500 mt-1 text-right">{comment.length}/500</p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || submitting || !canSubmit}
                    className="flex-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Assignment'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={submitting}
                    className="rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submission History */}
          {versions.length > 0 && (
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Submission History</h2>
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div key={version.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          Version {versions.length - index}
                        </span>
                        {version.isLate && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            Late
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-900">{version.fileName}</p>
                      <p className="text-sm text-slate-500">
                        Submitted on {formatDate(version.submittedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => version.fileName && submissionApi.download(version.id, version.fileName)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AssignmentDetailPage() {
  return (
    <ProtectedRoute>
      <AssignmentDetailContent />
    </ProtectedRoute>
  );
}