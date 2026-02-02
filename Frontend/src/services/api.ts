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

// 🆕 Fonction helper pour parser les réponses JSON ou vides
async function parseResponse<T>(response: Response): Promise<T | void> {
  const contentType = response.headers.get('content-type');
  const hasContent = response.status !== 204 && response.status !== 205;
  
  if (!hasContent) {
    return; // Pas de contenu à parser (204 No Content)
  }
  
  // Vérifier s'il y a du contenu
  const text = await response.text();
  
  if (!text || text.trim() === '') {
    return; // Réponse vide
  }
  
  // Si c'est du JSON, parser
  if (contentType?.includes('application/json')) {
    try {
      return JSON.parse(text) as T;
    } catch (err) {
      console.error('Failed to parse JSON:', text);
      throw new Error('Invalid JSON response');
    }
  }
  
  // Sinon, retourner le texte tel quel (cast vers T)
  return text as unknown as T;
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

  // 🆕 CORRIGÉ : Gestion des réponses vides
  async suspendUser(userEmail: string): Promise<User | void> {
    const response = await fetchWithAuth(`/${encodeURIComponent(userEmail)}/suspend`, {
      method: 'PUT',
    });
    return parseResponse<User>(response);
  },

  // 🆕 CORRIGÉ : Gestion des réponses vides
  async unsuspendUser(userEmail: string): Promise<User | void> {
    const response = await fetchWithAuth(`/${encodeURIComponent(userEmail)}/unsuspend`, {
      method: 'PUT',
    });
    return parseResponse<User>(response);
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