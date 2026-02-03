'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '@/types/notification';
import { notificationApi } from '@/services/notificationApi';
import { useAuth } from '@/context/AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const POLL_INTERVAL = 30000; // 30 seconds

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [allNotifs, count] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(allNotifs);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => {
        const notif = prev.find((n) => n.id === id);
        if (notif && !notif.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refresh,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
