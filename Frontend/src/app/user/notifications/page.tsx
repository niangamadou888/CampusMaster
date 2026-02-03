'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotificationBell from '@/components/NotificationBell';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Bell,
  LogOut,
  Check,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { Notification, NotificationType } from '@/types/notification';

function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'ASSIGNMENT_PUBLISHED':
    case 'ASSIGNMENT_UPDATED':
    case 'ASSIGNMENT_DEADLINE_REMINDER':
      return 'bg-blue-100 text-blue-600';
    case 'GRADE_RELEASED':
    case 'GRADE_UPDATED':
      return 'bg-emerald-100 text-emerald-600';
    case 'SUBMISSION_RECEIVED':
      return 'bg-purple-100 text-purple-600';
    case 'COURSE_PUBLISHED':
    case 'COURSE_ENROLLMENT_APPROVED':
    case 'COURSE_MATERIAL_ADDED':
      return 'bg-sky-100 text-sky-600';
    case 'NEW_MESSAGE':
      return 'bg-indigo-100 text-indigo-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function getNotificationLabel(type: NotificationType): string {
  switch (type) {
    case 'ASSIGNMENT_PUBLISHED':
      return 'New Assignment';
    case 'ASSIGNMENT_UPDATED':
      return 'Assignment Updated';
    case 'ASSIGNMENT_DEADLINE_REMINDER':
      return 'Deadline Reminder';
    case 'GRADE_RELEASED':
      return 'Grade Released';
    case 'GRADE_UPDATED':
      return 'Grade Updated';
    case 'SUBMISSION_RECEIVED':
      return 'Submission';
    case 'COURSE_PUBLISHED':
      return 'New Course';
    case 'COURSE_ENROLLMENT_APPROVED':
      return 'Enrollment';
    case 'COURSE_MATERIAL_ADDED':
      return 'New Material';
    case 'NEW_MESSAGE':
      return 'Message';
    case 'ANNOUNCEMENT':
      return 'Announcement';
    case 'SYSTEM':
      return 'System';
    default:
      return 'Notification';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function UserNotificationsContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const navItems = [
    { href: '/user/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/user/courses', label: 'Cours', icon: BookOpen },
    { href: '/user/assignments', label: 'Devoirs', icon: ClipboardList },
    { href: '/user/grades', label: 'Notes', icon: BarChart3 },
    { href: '/user/messages', label: 'Messages', icon: MessageSquare },
    { href: '/user/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
        <div className="flex items-center gap-3 border-b border-white/40 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white font-semibold shadow">
            CM
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
            <p className="text-xs text-slate-500">User workspace</p>
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
          <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-blue-200/60 via-sky-200/50 to-emerald-200/50 blur-3xl" />
        </div>

        {/* Top bar */}
        <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <input
              type="text"
              placeholder="Search for courses, assignments, or people..."
              className="w-96 rounded-lg border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex items-center gap-3">
              <NotificationBell notificationsHref="/user/notifications" />
              <span className="hidden text-sm text-slate-700 sm:inline">
                Welcome, {user?.userFirstName}
              </span>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                  User
                </p>
                <h2 className="text-3xl font-black text-slate-900">Notifications</h2>
                <p className="text-sm text-slate-600">
                  Stay up to date with your courses, assignments, and grades.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark all as read
                  </button>
                )}
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                  {unreadCount} unread
                </span>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification list */}
            <div className="mt-6 space-y-3">
              {loading && notifications.length === 0 ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 py-12 text-center">
                  <Bell className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    {filter === 'unread'
                      ? 'No unread notifications'
                      : 'No notifications yet'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`group flex items-start gap-4 rounded-2xl border p-4 transition-colors ${
                      !notif.isRead
                        ? 'border-blue-100 bg-blue-50/40'
                        : 'border-slate-100 bg-white/60 hover:bg-slate-50/60'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${getNotificationColor(
                        notif.notificationType
                      )}`}
                    >
                      {getNotificationLabel(notif.notificationType).charAt(0)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getNotificationColor(
                              notif.notificationType
                            )}`}
                          >
                            {getNotificationLabel(notif.notificationType)}
                          </span>
                          <h4
                            className={`mt-1 text-sm ${
                              !notif.isRead
                                ? 'font-semibold text-slate-900'
                                : 'font-medium text-slate-700'
                            }`}
                          >
                            {notif.title}
                          </h4>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-100 hover:text-blue-600"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function UserNotifications() {
  return (
    <ProtectedRoute requireUser>
      <UserNotificationsContent />
    </ProtectedRoute>
  );
}
