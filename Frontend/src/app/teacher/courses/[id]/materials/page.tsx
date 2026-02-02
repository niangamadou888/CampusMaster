'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { courseApi, materialApi } from '@/services/courseApi';
import { Course, CourseMaterial } from '@/types/course';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, ClipboardList, LogOut } from 'lucide-react';

function CourseMaterialsContent() {
  const params = useParams();
  const pathname = usePathname();
  const courseId = Number(params.id);
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseData, materialsData] = await Promise.all([
        courseApi.getById(courseId),
        materialApi.getByCourse(courseId)
      ]);
      setCourse(courseData);
      setMaterials(materialsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadData.title) {
        setUploadData({ ...uploadData, title: file.name.replace(/\.[^/.]+$/, '') });
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }
    if (!uploadData.title) {
      setError('Please enter a title');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await materialApi.upload(courseId, uploadData.title, uploadData.description || undefined, selectedFile);
      setSuccess('Material uploaded successfully');
      setUploadData({ title: '', description: '' });
      setSelectedFile(null);
      setShowUploadForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId: number) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await materialApi.delete(courseId, materialId);
      setSuccess('Material deleted successfully');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete material');
    }
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
              <p className="text-xs text-slate-500">Materials</p>
            </div>
          </div>
        </aside>
        <div className="ml-64 flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-white/40 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500 text-white font-semibold shadow">
              CM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">Materials</p>
            </div>
          </div>
        </aside>
        <div className="ml-64 flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Course not found</p>
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
            <p className="text-xs text-slate-500">Course Materials</p>
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
              placeholder="Search for materials..."
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

          {/* Course Header */}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
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
                <h1 className="text-2xl font-black text-slate-900">{course.title}</h1>
                <p className="text-sm text-slate-600">Manage course materials</p>
              </div>
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="inline-flex justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
              >
                {showUploadForm ? 'Cancel' : 'Upload Material'}
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

            {/* Upload Form */}
            {showUploadForm && (
              <form onSubmit={handleUpload} className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload New Material</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-800">File</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-purple-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-700 hover:file:bg-purple-200"
                    />
                    {selectedFile && (
                      <p className="mt-1 text-xs text-slate-500">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800">Title</label>
                    <input
                      type="text"
                      required
                      value={uploadData.title}
                      onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition"
                      placeholder="Lecture 1 Slides"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-800">Description (optional)</label>
                    <input
                      type="text"
                      value={uploadData.description}
                      onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-slate-900 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition"
                      placeholder="Introduction to the course"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="inline-flex justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Materials List */}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Materials ({materials.length})</h2>

            {materials.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                <p className="text-sm text-slate-500">No materials uploaded yet.</p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="mt-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
                >
                  Upload your first material
                </button>
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
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">{material.fileName}</span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{formatFileSize(material.fileSize)}</span>
                          {material.downloadCount !== undefined && (
                            <>
                              <span className="text-xs text-slate-300">•</span>
                              <span className="text-xs text-slate-400">{material.downloadCount} downloads</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => materialApi.download(courseId, material.id, material.fileName)}
                        className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:shadow-lg transition"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CourseMaterialsPage() {
  return (
    <ProtectedRoute requireTeacher>
      <CourseMaterialsContent />
    </ProtectedRoute>
  );
}