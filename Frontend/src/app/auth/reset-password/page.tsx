'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/services/api';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid or missing reset token');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to reset password. The link may be invalid or expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-8 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/20 via-blue-500/20 to-sky-400/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/25 via-indigo-400/20 to-sky-300/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-4xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/50 bg-white/70 p-8 shadow-xl backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Secure recovery
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-900">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Choose a strong password to keep your CampusMaster account safe.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3">
            {[
              'Password must be at least 6 characters.',
              'Tokens expire quickly to protect your account.',
              'Modern stack ensures secure reset flows.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-700">
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.14em] text-emerald-700 font-semibold">
              Reset password
            </p>
            <h2 className="text-2xl font-bold text-slate-900">Create a new password</h2>
            <p className="text-sm text-slate-600">
              Enter and confirm your new password below.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-800">
                Password reset successful! Redirecting to login...
              </div>
            )}

            {!success && token && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-800"
                    >
                      New Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-blue-300 focus:ring-blue-100"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-blue-300 focus:ring-blue-100"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Resetting password...' : 'Reset password'}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-blue-700 hover:text-blue-600"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
