'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { authApi } from '@/services/api';
import { User } from '@/types/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, Users, Building2, Calendar, BookText, Bell, LogOut } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { useNotifications } from '@/context/NotificationContext';

function AdminDashboardContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTeachers, setPendingTeachers] = useState<User[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [teacherLoadError, setTeacherLoadError] = useState('');

  // State pour les statistiques (4 valeurs maintenant)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    pendingApproval: 0 //  Nouveau !
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadPendingTeachers();
    loadUserStats();
  }, []);

  const loadPendingTeachers = async () => {
    try {
      setLoadingTeachers(true);
      setTeacherLoadError('');
      const teachers = await authApi.getPendingTeachers();
      setPendingTeachers(teachers);
    } catch (err) {
      console.error('Failed to load pending teachers:', err);
      setTeacherLoadError(err instanceof Error ? err.message : 'Failed to load pending teachers');
    } finally {
      setLoadingTeachers(false);
    }
  };

  // Fonction corrigée pour charger les statistiques
  const loadUserStats = async () => {
    try {
      setLoadingStats(true);
      
      const [allUsers, pendingTeachersData] = await Promise.all([
        authApi.getAllUsers(),
        authApi.getPendingTeachers()
      ]);

      // DEBUG : Afficher les données brutes
      console.log('📊 All Users:', allUsers);
      console.log('⏳ Pending Teachers:', pendingTeachersData);
      console.log('🔍 Teacher recherché:', 'vieux.fall3@unchk.edu.sn');
      
      // Trouver le teacher spécifique
      const targetTeacher = allUsers.find(u => u.userEmail === 'vieux.fall3@unchk.edu.sn');
      console.log('👤 Teacher dans getAllUsers:', targetTeacher);
      
      const isPending = pendingTeachersData.find(t => t.userEmail === 'vieux.fall3@unchk.edu.sn');
      console.log('❓ Teacher dans getPendingTeachers:', isPending);

      const pendingTeacherEmails = new Set(pendingTeachersData.map(t => t.userEmail));
      const trueSuspendedUsers = allUsers.filter(
        u => u.isSuspended && !pendingTeacherEmails.has(u.userEmail)
      );

      console.log('📈 Stats calculées:', {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => !u.isSuspended).length,
        suspendedUsers: trueSuspendedUsers.length,
        pendingApproval: pendingTeachersData.length
      });

      setStats({
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => !u.isSuspended).length,
        suspendedUsers: trueSuspendedUsers.length,
        pendingApproval: pendingTeachersData.length
      });
    } catch (err) {
      console.error('Failed to load user stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleApproveTeacher = async (teacherEmail: string) => {
    try {
      await authApi.unsuspendUser(teacherEmail);
      setSuccess(`Teacher ${teacherEmail} has been approved successfully`);
      loadPendingTeachers();
      loadUserStats(); // Recharger les stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve teacher');
    }
  };

  const handleRejectTeacher = async (teacherEmail: string) => {
    try {
      await authApi.suspendUser(teacherEmail);
      setSuccess(`Teacher ${teacherEmail} has been rejected`);
      loadPendingTeachers();
      loadUserStats(); // Recharger les stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject teacher');
    }
  };

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authApi.suspendUser(userEmail);
      setSuccess(`User ${userEmail} has been suspended successfully`);
      setUserEmail('');
      loadUserStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authApi.unsuspendUser(userEmail);
      setSuccess(`User ${userEmail} has been unsuspended successfully`);
      setUserEmail('');
      loadUserStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsuspend user');
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/departments', label: 'Departments', icon: Building2 },
    { href: '/admin/semesters', label: 'Semesters', icon: Calendar },
    { href: '/admin/subjects', label: 'Subjects', icon: BookText },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/40 bg-white/70 backdrop-blur">
        <div className="flex items-center gap-3 border-b border-white/40 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-500 text-white font-semibold shadow">
            CM
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">CampusMaster</p>
            <p className="text-xs text-slate-500">Admin workspace</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.href === '/admin/notifications' && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {/* Bouton déconnexion en bas - Proposition 1 */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={logout}
            className="group flex w-full items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-red-200 hover:bg-red-50 hover:font-bold hover:text-red-600"
          >
            <LogOut className="h-5 w-5 text-red-600 transition-colors" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <div className="relative ml-64 min-h-screen flex-1 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-10 top-10 h-64 bg-gradient-to-r from-blue-200/60 via-sky-200/50 to-emerald-200/50 blur-3xl" />
          <div className="absolute -left-12 bottom-10 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/25 via-indigo-300/25 to-sky-300/25 blur-3xl" />
        </div>

        <nav className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <input
              type="text"
              placeholder="Search users, departments, or subjects..."
              className="w-96 rounded-lg border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
            <div className="flex items-center gap-3">
              <NotificationBell notificationsHref="/admin/notifications" />
              <span className="hidden text-sm text-slate-700 sm:inline">
                Welcome, {user?.userFirstName}
              </span>
            </div>
          </div>
        </nav>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-600">
                  Admin
                </p>
                <h2 className="text-3xl font-black text-slate-900">Admin Dashboard</h2>
                <p className="text-sm text-slate-600">
                  Manage accounts, monitor platform health, and keep the campus running.
                </p>
              </div>
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                Elevated access
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-800">
                {success}
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Admin information</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Profile
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Name
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {user?.userFirstName} {user?.userLastName}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {user?.userEmail}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Roles
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {user?.role.map((r) => r.roleName).join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 🆕 Carte API Endpoint avec 4 stats (ajout Pending) */}
              <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-300">
                      API Endpoint
                    </p>
                    <p className="mt-1 font-mono text-sm text-emerald-200 break-all">
                      https://campusmaster.onrender.com
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                    Online
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-200">
                  Secure authentication with password recovery and role-based permissions.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {loadingStats ? (
                    <div className="col-span-2 flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    [
                      { label: 'Users', value: stats.totalUsers },
                      { label: 'Active', value: stats.activeUsers },
                      { label: 'Suspended', value: stats.suspendedUsers },
                      { label: 'Pending', value: stats.pendingApproval }, // 👈 Nouveau !
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-white/10 p-3 text-center">
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs uppercase tracking-wide text-slate-200">
                          {stat.label}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">User management</h3>
                    <p className="text-sm text-slate-600">
                      Suspend or unsuspend user accounts instantly.
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Safety
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <label
                    htmlFor="userEmail"
                    className="text-sm font-semibold text-slate-800"
                  >
                    User Email
                  </label>
                  <input
                    id="userEmail"
                    name="userEmail"
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent transition focus:border-red-300 focus:ring-red-100"
                    placeholder="user@example.com"
                  />

                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      onClick={handleSuspend}
                      disabled={isLoading || !userEmail}
                      className="inline-flex justify-center rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? 'Processing...' : 'Suspend User'}
                    </button>
                    <button
                      onClick={handleUnsuspend}
                      disabled={isLoading || !userEmail}
                      className="inline-flex justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? 'Processing...' : 'Unsuspend User'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 🆕 Carte System statistics avec 4 stats */}
              <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">System statistics</h3>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                    Live
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  {loadingStats ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
                    </div>
                  ) : (
                    [
                      { label: 'Total Users', value: stats.totalUsers, color: 'from-blue-500 to-sky-500' },
                      { label: 'Active Users', value: stats.activeUsers, color: 'from-emerald-500 to-teal-500' },
                      { label: 'Suspended Users', value: stats.suspendedUsers, color: 'from-rose-500 to-red-500' },
                      { label: 'Pending Approval', value: stats.pendingApproval, color: 'from-amber-500 to-orange-500' }, // 👈 Nouveau !
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                      >
                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.color}`} />
                        <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Teacher Approvals section (inchangée) */}
            <div className="mt-8 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Teacher Approvals</h3>
                  <p className="text-sm text-slate-600">
                    Review and approve pending teacher registrations.
                  </p>
                </div>
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  {pendingTeachers.length} Pending
                </span>
              </div>

              {loadingTeachers ? (
                <div className="mt-6 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : teacherLoadError ? (
                <div className="mt-6 rounded-xl border border-red-100 bg-red-50/60 p-6 text-center">
                  <p className="text-sm text-red-600">{teacherLoadError}</p>
                  <button
                    onClick={loadPendingTeachers}
                    className="mt-2 text-sm font-semibold text-red-700 hover:text-red-800 transition"
                  >
                    Try again
                  </button>
                </div>
              ) : pendingTeachers.length === 0 ? (
                <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center">
                  <p className="text-sm text-slate-500">No pending teacher approvals</p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {pendingTeachers.map((teacher) => (
                    <div
                      key={teacher.userEmail}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {teacher.userFirstName} {teacher.userLastName}
                        </p>
                        <p className="text-sm text-slate-500">{teacher.userEmail}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveTeacher(teacher.userEmail)}
                          className="inline-flex justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectTeacher(teacher.userEmail)}
                          className="inline-flex justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}