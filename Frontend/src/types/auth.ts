export interface Role {
  roleName: string;
  roleDescription: string;
}

export interface User {
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userPassword?: string;
  isSuspended: boolean;
  resetToken?: string | null;
  role: Role[];
}

export interface LoginRequest {
  userEmail: string;
  userPassword: string;
}

export interface LoginResponse {
  user: User;
  jwtToken: string;
}

export interface RegisterRequest {
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userPassword: string;
  role?: 'User' | 'Teacher';
}

export interface ForgotPasswordRequest {
  userEmail: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UpdateUserRequest {
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (data: UpdateUserRequest) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isLoading: boolean;
}
