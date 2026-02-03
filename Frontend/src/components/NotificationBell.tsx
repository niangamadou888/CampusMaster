'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { Notification, NotificationType } from '@/types/notification';
import Link from 'next/link';

function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'ASSIGNMENT_PUBLISHED':
    case 'ASSIGNMENT_UPDATED':
    case 'ASSIGNMENT_DEADLINE_REMINDER':
      return 'clipboard';
    case 'GRADE_RELEASED':
    case 'GRADE_UPDATED':
      return 'grade';
    case 'SUBMISSION_RECEIVED':
      return 'submission';
    case 'COURSE_PUBLISHED':
    case 'COURSE_ENROLLMENT_APPROVED':
    case 'COURSE_MATERIAL_ADDED':
      return 'course';
    case 'TEACHER_APPROVED':
    case 'TEACHER_REGISTRATION_PENDING':
      return 'teacher';
    case 'NEW_MESSAGE':
      return 'message';
    case 'ANNOUNCEMENT':
    case 'SYSTEM':
    default:
      return 'system';
  }
}

function getIconColor(type: string): string {
  switch (type) {
    case 'clipboard':
      return 'bg-blue-100 text-blue-600';
    case 'grade':
      return 'bg-emerald-100 text-emerald-600';
    case 'submission':
      return 'bg-purple-100 text-purple-600';
    case 'course':
      return 'bg-sky-100 text-sky-600';
    case 'teacher':
      return 'bg-amber-100 text-amber-600';
    case 'message':
      return 'bg-indigo-100 text-indigo-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function getIconLetter(type: string): string {
  switch (type) {
    case 'clipboard':
      return 'A';
    case 'grade':
      return 'G';
    case 'submission':
      return 'S';
    case 'course':
      return 'C';
    case 'teacher':
      return 'T';
    case 'message':
      return 'M';
    default:
      return 'N';
  }
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

interface NotificationBellProps {
  notificationsHref: string;
}

export default function NotificationBell({ notificationsHref }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No notifications yet</p>
              </div>
            ) : (
              recentNotifications.map((notif) => {
                const iconType = getNotificationIcon(notif.notificationType);
                const iconColor = getIconColor(iconType);
                const iconLetter = getIconLetter(iconType);

                return (
                  <div
                    key={notif.id}
                    className={`group flex gap-3 border-b border-slate-50 px-4 py-3 transition-colors hover:bg-slate-50 ${
                      !notif.isRead ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${iconColor}`}
                    >
                      {iconLetter}
                    </div>

                    {/* Content */}
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <p
                        className={`text-sm ${
                          !notif.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                        {notif.message}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="rounded p-1 text-slate-400 hover:bg-blue-100 hover:text-blue-600"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="rounded p-1 text-slate-400 hover:bg-red-100 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5">
              <Link
                href={notificationsHref}
                onClick={() => setIsOpen(false)}
                className="block text-center text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
