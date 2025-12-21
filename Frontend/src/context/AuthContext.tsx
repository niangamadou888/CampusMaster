'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AuthContextType,
  User,
  RegisterRequest,
  UpdateUserRequest,
} from '@/types/auth';
import { authApi, ApiError } from '@/services/api';
import { storage } from '@/utils/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = storage.getToken();
      const storedUser = storage.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({
        userEmail: email,
        userPassword: password,
      });

      // Check if account is suspended
      if (response.user.isSuspended) {
        const isTeacher = response.user.role.some((r) => r.roleName === 'Teacher');
        if (isTeacher) {
          throw new Error('Your teacher account is pending approval. Please wait for an admin to approve your registration.');
        } else {
          throw new Error('Your account has been suspended. Please contact an administrator.');
        }
      }

      storage.setToken(response.jwtToken);
      storage.setUser(response.user);

      setToken(response.jwtToken);
      setUser(response.user);

      const isAdmin = response.user.role.some((r) => r.roleName === 'Admin');
      const isTeacher = response.user.role.some((r) => r.roleName === 'Teacher');

      if (isAdmin) {
        router.push('/admin/dashboard');
      } else if (isTeacher) {
        router.push('/teacher/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(
          error.status === 401
            ? 'Invalid email or password'
            : 'Login failed. Please try again.'
        );
      }
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const registeredUser = await authApi.register(data);

      // If registering as teacher, don't auto-login (account is suspended)
      if (data.role === 'Teacher') {
        // Teacher accounts need admin approval, redirect to login with message
        throw new Error('TEACHER_PENDING_APPROVAL');
      }

      await login(data.userEmail, data.userPassword);
    } catch (error) {
      if (error instanceof Error && error.message === 'TEACHER_PENDING_APPROVAL') {
        throw error;
      }
      if (error instanceof ApiError) {
        throw new Error(
          error.status === 400
            ? 'Email already exists'
            : 'Registration failed. Please try again.'
        );
      }
      throw error;
    }
  };

  const logout = () => {
    storage.clearAll();
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const updateUser = async (data: UpdateUserRequest) => {
    try {
      const updatedUser = await authApi.updateUserInfo(data);
      storage.setUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error('Failed to update profile. Please try again.');
      }
      throw error;
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role.some((r) => r.roleName === 'Admin') ?? false;
  const isTeacher = user?.role.some((r) => r.roleName === 'Teacher') ?? false;

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
    isTeacher,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
