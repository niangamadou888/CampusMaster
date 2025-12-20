'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isAdmin, user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(isAdmin ? '/admin/dashboard' : '/user/dashboard');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <div className="absolute inset-x-10 top-16 h-96 bg-gradient-to-r from-sky-200/60 via-blue-200/40 to-emerald-200/50 blur-3xl" />
        <div className="absolute left-10 bottom-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400/30 via-indigo-300/30 to-sky-300/30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-6 py-14 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white font-semibold shadow-md">
              CM
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-blue-700 font-semibold">
                CampusMaster
              </p>
              <p className="text-xs text-slate-500">Campus management reinvented</p>
            </div>
          </div>
          <div className="hidden gap-3 sm:flex">
            <Link
              href="/auth/login"
              className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 hover:shadow"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:brightness-105"
            >
              Create account
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700 shadow-sm backdrop-blur">
              Built for modern campuses
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-black leading-tight text-slate-900 drop-shadow-sm">
                Streamline admissions, academics, and operations in one place.
              </h1>
              <p className="text-lg text-slate-600 sm:text-xl">
                CampusMaster blends secure access, role-based workflows, and a clean
                interface so teams can focus on students—not systems.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
              >
                Get started
                <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  →
                </span>
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-200/80 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:text-blue-700 hover:shadow"
              >
                I already have an account
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: 'Role-based dashboards', value: 'Users & Admins' },
                { label: 'Security first', value: 'JWT + granular control' },
                { label: 'Modern stack', value: 'Next.js + Spring Boot' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-sm backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-blue-100/70 via-white to-sky-100/60 blur-2xl" />
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 px-4 py-3 text-white shadow-lg">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] opacity-80">
                    Realtime overview
                  </p>
                  <p className="text-lg font-semibold">Campus Snapshot</p>
                </div>
                <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  Live
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  { title: 'Active users', value: '1.2k', trend: '+8.4%' },
                  { title: 'Admin actions', value: '312', trend: '+4.1%' },
                  { title: 'Auth success', value: '99.9%', trend: '+0.3%' },
                  { title: 'APIs online', value: '12/12', trend: 'stable' },
                ].map((stat) => (
                  <div
                    key={stat.title}
                    className="rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-sm backdrop-blur"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {stat.title}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                      <span className="text-xs font-semibold text-emerald-600">
                        {stat.trend}
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-100">
                      <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-300">
                      API Endpoint
                    </p>
                    <p className="mt-1 font-mono text-sm text-emerald-200">
                      http://localhost:4500
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Online
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-200">
                  Built with secure authentication, password recovery, and role-based
                  permissions ready to deploy.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur lg:grid-cols-3">
          {[
            {
              title: 'Role-Based Access',
              copy:
                'Separate dashboards for admins and users with tailored controls for each persona.',
              color: 'from-blue-500 to-sky-500',
            },
            {
              title: 'Secure Authentication',
              copy:
                'JWT-powered auth with password reset, token-based recovery, and session safety.',
              color: 'from-emerald-500 to-teal-500',
            },
            {
              title: 'Modern Stack',
              copy:
                'Built on Next.js 15, React 18, TypeScript, and Spring Boot for reliability.',
              color: 'from-indigo-500 to-blue-600',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.color}`}
              />
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.copy}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
