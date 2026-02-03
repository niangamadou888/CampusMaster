import { storage } from '@/utils/storage';
import {
  ForumPost,
  ForumReply,
  CreatePostRequest,
  UpdatePostRequest,
  CreateReplyRequest,
} from '@/types/forum';

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

// Forum Post API
export const forumPostApi = {
  async getByCourse(courseId: number): Promise<ForumPost[]> {
    const response = await fetchWithAuth(`/api/forum/course/${courseId}/posts`);
    return response.json();
  },

  async getById(postId: number): Promise<ForumPost> {
    const response = await fetchWithAuth(`/api/forum/posts/${postId}`);
    return response.json();
  },

  async create(courseId: number, data: CreatePostRequest): Promise<ForumPost> {
    const response = await fetchWithAuth(`/api/forum/course/${courseId}/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async update(postId: number, data: UpdatePostRequest): Promise<ForumPost> {
    const response = await fetchWithAuth(`/api/forum/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(postId: number): Promise<void> {
    await fetchWithAuth(`/api/forum/posts/${postId}`, { method: 'DELETE' });
  },

  async togglePin(postId: number): Promise<ForumPost> {
    const response = await fetchWithAuth(`/api/forum/posts/${postId}/pin`, {
      method: 'PUT',
    });
    return response.json();
  },

  async toggleClose(postId: number): Promise<ForumPost> {
    const response = await fetchWithAuth(`/api/forum/posts/${postId}/close`, {
      method: 'PUT',
    });
    return response.json();
  },

  async search(courseId: number, query: string): Promise<ForumPost[]> {
    const response = await fetchWithAuth(
      `/api/forum/course/${courseId}/posts/search?q=${encodeURIComponent(query)}`
    );
    return response.json();
  },
};

// Forum Reply API
export const forumReplyApi = {
  async getByPost(postId: number): Promise<ForumReply[]> {
    const response = await fetchWithAuth(`/api/forum/posts/${postId}/replies`);
    return response.json();
  },

  async create(postId: number, data: CreateReplyRequest): Promise<ForumReply> {
    const response = await fetchWithAuth(`/api/forum/posts/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async update(replyId: number, data: CreateReplyRequest): Promise<ForumReply> {
    const response = await fetchWithAuth(`/api/forum/replies/${replyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(replyId: number): Promise<void> {
    await fetchWithAuth(`/api/forum/replies/${replyId}`, { method: 'DELETE' });
  },
};

export { ApiError };
