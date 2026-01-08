import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  UpdateUserRequest,
} from '@/types/auth';
import { storage } from '@/utils/storage';

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
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData - browser will set it with boundary
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

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

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetchWithAuth('/authenticate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async register(data: RegisterRequest): Promise<User> {
    const { role, ...userData } = data;
    const url = role ? `/registerNewUser?role=${encodeURIComponent(role)}` : '/registerNewUser';
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  async forgotPassword(email: string): Promise<string> {
    const response = await fetchWithAuth('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ userEmail: email }),
    });
    return response.text();
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const response = await fetchWithAuth(
      `/reset-password?token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      }
    );
    return response.text();
  },

  async getUserInfo(): Promise<User> {
    const response = await fetchWithAuth('/getUserInfo', {
      method: 'GET',
    });
    return response.json();
  },

  async updateUserInfo(data: UpdateUserRequest): Promise<User> {
    const response = await fetchWithAuth('/updateUserInfo', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async suspendUser(userEmail: string): Promise<User> {
    const response = await fetchWithAuth(`/${encodeURIComponent(userEmail)}/suspend`, {
      method: 'PUT',
    });
    return response.json();
  },

  async unsuspendUser(userEmail: string): Promise<User> {
    const response = await fetchWithAuth(`/${encodeURIComponent(userEmail)}/unsuspend`, {
      method: 'PUT',
    });
    return response.json();
  },

  async getPendingTeachers(): Promise<User[]> {
    const response = await fetchWithAuth('/pending-teachers', {
      method: 'GET',
    });
    return response.json();
  },

  async getApprovedTeachers(): Promise<User[]> {
    const response = await fetchWithAuth('/approved-teachers', {
      method: 'GET',
    });
    return response.json();
  },

  async getAllUsers(): Promise<User[]> {
    const response = await fetchWithAuth('/all-users', {
      method: 'GET',
    });
    return response.json();
  },
};

export { ApiError };
