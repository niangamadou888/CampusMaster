import { storage } from '@/utils/storage';
import { Conversation, Message, ContactUser } from '@/types/message';
import { User } from '@/types/auth';

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

export const messageApi = {
  async getConversations(): Promise<Conversation[]> {
    const response = await fetchWithAuth('/api/messages/conversations');
    return response.json();
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await fetchWithAuth(`/api/messages/conversations/${conversationId}`);
    return response.json();
  },

  async sendMessage(recipientEmail: string, content: string): Promise<Message> {
    const response = await fetchWithAuth('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify({ recipientEmail, content }),
    });
    return response.json();
  },

  async markAsRead(conversationId: number): Promise<void> {
    await fetchWithAuth(`/api/messages/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  },

  async getUnreadCount(): Promise<number> {
    const response = await fetchWithAuth('/api/messages/unread/count');
    const data = await response.json();
    return data.count;
  },

  async getContacts(): Promise<User[]> {
    const response = await fetchWithAuth('/api/messages/contacts');
    return response.json();
  },
};

export { ApiError };
