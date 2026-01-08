'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { assignmentApi } from '@/services/assignmentApi';
import { courseApi } from '@/services/courseApi';
import { Assignment } from '@/types/assignment';
import { Course } from '@/types/course';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function TeacherAssignmentsContent() {
  const { logout } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', courseId: 0, maxScore: 20,
    deadline: '', allowLateSubmission: false, lateSubmissionPenalty: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentApi.getMyAssignments(),
        courseApi.getMyCourses()
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) {
      setError('Please select a course');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await assignmentApi.create({
        title: formData.title,
        description: formData.description,
        maxScore: formData.maxScore,
        deadline: formData.deadline || undefined,
        allowLateSubmission: formData.allowLateSubmission,
        lateSubmissionPenalty: formData.lateSubmissionPenalty
      }, formData.courseId);
      setSuccess('Assignment created successfully');
      setFormData({ title: '', description: '', courseId: 0, maxScore: 20, deadline: '', allowLateSubmission: false, lateSubmissionPenalty: 0 });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await assignmentApi.publish(id);
      setSuccess('Assignment published successfully');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await assignmentApi.unpublish(id);
      setSuccess('Assignment unpublished');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await assignmentApi.delete(id);
      setSuccess('Assignment deleted');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-rose-200/60 via-pink-200/50 to-purple-200/50 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/teacher/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-pink-500 text-white font-semibold shadow">
              CM
            </Link>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">Assignments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/teacher/dashboard" className="text-sm text-slate-600 hover:text-purple-600 transition">Dashboard</Link>
            <Link href="/teacher/courses" className="text-sm text-slate-600 hover:text-purple-600 transition">Courses</Link>
            <Link href="/teacher/assignments" className="text-sm font-medium text-purple-600 transition">Assignments</Link>
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
              <h2 className="text-3xl font-black text-slate-900">Assignments</h2>
              <p className="text-sm text-slate-600">Create and manage assignments</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex justify-center rounded-full bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md"
            >
              {showForm ? 'Cancel' : 'New Assignment'}
            </button>
          </div>

          {error && <div className="mt-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">{error}</div>}
          {success && <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-800">{success}</div>}

          {showForm && (
            <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">New Assignment</h3>
              {courses.length === 0 ? (
                <p className="text-sm text-amber-600">No courses available. Create a course first.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-800">Course</label>
                      <select
                        required
                        value={formData.courseId}
                        onChange={(e) => setFormData({ ...formData, courseId: parseInt(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none"
                      >
                        <option value={0}>Select course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none"
                        placeholder="Assignment title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">Max Score</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxScore}
                        onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">Deadline</label>
                      <input
                        type="datetime-local"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="allowLate"
                        checked={formData.allowLateSubmission}
                        onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="allowLate" className="text-sm text-slate-800">Allow late submissions</label>
                    </div>
                    {formData.allowLateSubmission && (
                      <div>
                        <label className="text-sm font-semibold text-slate-800">Late Penalty (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.lateSubmissionPenalty}
                          onChange={(e) => setFormData({ ...formData, lateSubmissionPenalty: parseInt(e.target.value) })}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none"
                        />
                      </div>
                    )}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="text-sm font-semibold text-slate-800">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none"
                        rows={3}
                        placeholder="Assignment instructions..."
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-60"
                    >
                      {submitting ? 'Creating...' : 'Create Assignment'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
              </div>
            ) : assignments.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                <p className="text-sm text-slate-500">No assignments yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {assignment.isPublished ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Published</span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Draft</span>
                          )}
                          {assignment.course && (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">{assignment.course.title}</span>
                          )}
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Max: {assignment.maxScore} pts</span>
                          {isDeadlinePassed(assignment.deadline) && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Deadline Passed</span>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900">{assignment.title}</h4>
                        <p className="text-sm text-slate-500">{assignment.description || 'No description'}</p>
                        <p className="mt-1 text-sm text-slate-600">Deadline: {formatDeadline(assignment.deadline)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/teacher/assignments/${assignment.id}/submissions`}
                          className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1.5 text-xs font-semibold text-white shadow"
                        >
                          View Submissions
                        </Link>
                        {assignment.isPublished ? (
                          <button onClick={() => handleUnpublish(assignment.id)} className="text-sm font-semibold text-amber-600 hover:text-amber-700">
                            Unpublish
                          </button>
                        ) : (
                          <button onClick={() => handlePublish(assignment.id)} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                            Publish
                          </button>
                        )}
                        <button onClick={() => handleDelete(assignment.id)} className="text-sm font-semibold text-red-600 hover:text-red-700">
                          Delete
                        </button>
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

export default function TeacherAssignmentsPage() {
  return (
    <ProtectedRoute requireTeacher>
      <TeacherAssignmentsContent />
    </ProtectedRoute>
  );
}
