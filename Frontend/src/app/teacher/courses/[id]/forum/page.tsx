'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { courseApi } from '@/services/courseApi';
import { forumPostApi, forumReplyApi } from '@/services/forumApi';
import { Course } from '@/types/course';
import { ForumPost, ForumReply } from '@/types/forum';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, ClipboardList, LogOut, MessageSquare, Pin, Lock, Unlock, Send, ChevronDown, ChevronUp, Trash2, Search, GraduationCap, Bell } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { useNotifications } from '@/context/NotificationContext';

function TeacherForumContent() {
  const params = useParams();
  const pathname = usePathname();
  const courseId = Number(params.id);
  const { user, logout } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // New post form
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Expanded posts
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());

  // Reply form
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseData, postsData] = await Promise.all([
        courseApi.getById(courseId),
        forumPostApi.getByCourse(courseId)
      ]);
      setCourse(courseData);
      setPosts(postsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forum');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }
    try {
      setLoading(true);
      const results = await forumPostApi.search(courseId, searchQuery);
      setPosts(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await forumPostApi.create(courseId, {
        title: newPostTitle,
        content: newPostContent
      });
      setSuccess('Post created successfully!');
      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPost(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (postId: number) => {
    if (!replyContent.trim()) {
      setError('Reply content is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await forumReplyApi.create(postId, { content: replyContent });
      setSuccess('Reply posted!');
      setReplyContent('');
      setReplyingTo(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (postId: number) => {
    try {
      await forumPostApi.togglePin(postId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle pin');
    }
  };

  const handleToggleClose = async (postId: number) => {
    try {
      await forumPostApi.toggleClose(postId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle close');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post? This will also delete all replies.')) {
      return;
    }
    try {
      await forumPostApi.delete(postId);
      setSuccess('Post deleted');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!confirm('Are you sure you want to delete this reply?')) {
      return;
    }
    try {
      await forumReplyApi.delete(replyId);
      setSuccess('Reply deleted');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reply');
    }
  };

  const toggleExpand = (postId: number) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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

  if (loading && !posts.length) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-white/40 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-500 text-white font-semibold shadow">
              CM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
              <p className="text-xs text-slate-500">Forum</p>
            </div>
          </div>
        </aside>
        <div className="ml-64 flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

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
            <p className="text-xs text-slate-500">Teacher Forum</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/teacher/courses' && pathname.startsWith('/teacher/courses');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'bg-purple-50 text-purple-600' : 'text-slate-700 hover:bg-slate-50'
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
          <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-purple-200/60 via-indigo-200/50 to-violet-200/50 blur-3xl" />
        </div>

        <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href={`/teacher/courses/${courseId}`} className="text-sm text-slate-600 hover:text-purple-600 transition">
              ← Back to Course
            </Link>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search posts..."
                className="w-64 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
              />
              <button
                onClick={handleSearch}
                className="rounded-full bg-purple-100 p-2 text-purple-600 hover:bg-purple-200 transition"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </nav>

        <main className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                  <h1 className="text-2xl font-black text-slate-900">Course Forum</h1>
                </div>
                <p className="text-slate-600">{course?.title}</p>
                <p className="text-sm text-slate-500 mt-1">{posts.length} posts total</p>
              </div>
              <button
                onClick={() => setShowNewPost(!showNewPost)}
                className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-lg transition"
              >
                {showNewPost ? 'Cancel' : 'New Announcement'}
              </button>
            </div>
          </div>

          {/* Messages */}
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

          {/* New Post Form */}
          {showNewPost && (
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Create Announcement</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Enter post title..."
                    className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Write your announcement..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={submitting}
                  className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-2 text-sm font-semibold text-white shadow hover:shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Announcement'}
                </button>
              </div>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="rounded-3xl border border-white/60 bg-white/80 p-12 shadow-2xl backdrop-blur text-center">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No posts yet. Create an announcement to start!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur overflow-hidden">
                  {/* Post Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {post.isPinned && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              <Pin className="h-3 w-3" /> Pinned
                            </span>
                          )}
                          {post.isClosed && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              <Lock className="h-3 w-3" /> Closed
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
                        <p className="mt-2 text-slate-600 whitespace-pre-wrap">{post.content}</p>
                        <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                              {post.author?.userFirstName?.[0]}{post.author?.userLastName?.[0]}
                            </div>
                            <span>{post.author?.userFirstName} {post.author?.userLastName}</span>
                          </div>
                          <span>•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>

                      {/* Teacher Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(post.id)}
                          className={`p-2 rounded-full transition ${post.isPinned ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100 text-slate-400'}`}
                          title={post.isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleClose(post.id)}
                          className={`p-2 rounded-full transition ${post.isClosed ? 'bg-slate-200 text-slate-600' : 'hover:bg-slate-100 text-slate-400'}`}
                          title={post.isClosed ? 'Open' : 'Close'}
                        >
                          {post.isClosed ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expand/Collapse */}
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="mt-4 flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
                    >
                      {expandedPosts.has(post.id) ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide Replies ({post.replies?.length || 0})
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show Replies ({post.replies?.length || 0})
                        </>
                      )}
                    </button>
                  </div>

                  {/* Replies */}
                  {expandedPosts.has(post.id) && (
                    <div className="border-t border-slate-100 bg-slate-50/50">
                      {post.replies && post.replies.length > 0 && (
                        <div className="divide-y divide-slate-100">
                          {post.replies.map((reply) => (
                            <div key={reply.id} className="p-4 pl-8 flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-slate-700 whitespace-pre-wrap">{reply.content}</p>
                                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                                  <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-semibold">
                                      {reply.author?.userFirstName?.[0]}{reply.author?.userLastName?.[0]}
                                    </div>
                                    <span>{reply.author?.userFirstName} {reply.author?.userLastName}</span>
                                  </div>
                                  <span>•</span>
                                  <span>{formatDate(reply.createdAt)}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteReply(reply.id)}
                                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                                title="Delete reply"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Form */}
                      {!post.isClosed && (
                        <div className="p-4 border-t border-slate-100">
                          {replyingTo === post.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                                onKeyPress={(e) => e.key === 'Enter' && handleReply(post.id)}
                              />
                              <button
                                onClick={() => handleReply(post.id)}
                                disabled={submitting}
                                className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-2 text-white shadow hover:shadow-lg transition disabled:opacity-50"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent('');
                                }}
                                className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReplyingTo(post.id)}
                              className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
                            >
                              Reply to this post
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TeacherForumPage() {
  return (
    <ProtectedRoute requireTeacher>
      <TeacherForumContent />
    </ProtectedRoute>
  );
}
