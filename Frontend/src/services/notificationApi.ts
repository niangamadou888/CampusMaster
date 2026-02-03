import { storage } from '@/utils/storage';
import { Notification } from '@/types/notification';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campusmaster.onrender.com';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = storage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || response.statusText);
  }

  return response;
}

export const notificationApi = {
  async getAll(): Promise<Notification[]> {
    const response = await fetchWithAuth('/api/notifications');
    return response.json();
  },

  async getUnread(): Promise<Notification[]> {
    const response = await fetchWithAuth('/api/notifications/unread');
    return response.json();
  },

  async getUnreadCount(): Promise<number> {
    const response = await fetchWithAuth('/api/notifications/unread/count');
    const data = await response.json();
    return data.count;
  },

  async markAsRead(id: number): Promise<void> {
    await fetchWithAuth(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead(): Promise<void> {
    await fetchWithAuth('/api/notifications/read-all', {
      method: 'PUT',
    });
  },

  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };
