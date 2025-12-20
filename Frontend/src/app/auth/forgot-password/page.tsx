'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { authApi } from '@/services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-8 top-8 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/25 via-sky-400/20 to-emerald-300/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/20 via-blue-400/20 to-sky-300/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-4xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/50 bg-white/70 p-8 shadow-xl backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
            Recover access
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-900">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We&apos;ll send a secure link to your email so you can set a new password.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3">
            {[
              'Token-based recovery to keep your account secure.',
              'Rapid verification with modern authentication.',
              'Built for reliable campus operations.',
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
            <p className="text-sm uppercase tracking-[0.14em] text-sky-700 font-semibold">
              Password reset
            </p>
            <h2 className="text-2xl font-bold text-slate-900">Send reset link</h2>
            <p className="text-sm text-slate-600">
              Enter your email address and we&apos;ll email you a reset link.
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
                Password reset email sent! Please check your inbox.
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-800">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-blue-300 focus:ring-blue-100"
                placeholder="you@campus.edu"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              href="/auth/login"
              className="block text-sm font-semibold text-blue-700 hover:text-blue-600"
            >
              Back to sign in
            </Link>
            <Link
              href="/"
              className="block text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
