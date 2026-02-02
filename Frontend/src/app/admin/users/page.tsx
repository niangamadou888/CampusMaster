'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { authApi } from '@/services/api';
import { User } from '@/types/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { LayoutDashboard, Users, Building2, Calendar, BookText, LogOut } from 'lucide-react';

function UsersListContent() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // 🆕 Message de succès
  const [pendingTeachers, setPendingTeachers] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 🆕 User en cours d'action

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [allUsers, pendingTeachersData] = await Promise.all([
        authApi.getAllUsers(),
        authApi.getPendingTeachers()
      ]);
      
      setUsers(allUsers);
      setPendingTeachers(new Set(pendingTeachersData.map(t => t.userEmail)));
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'Admin':
        return 'bg-red-100 text-red-700';
      case 'Teacher':
        return 'bg-purple-100 text-purple-700';
      case 'User':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getUserStatus = (u: User) => {
    if (pendingTeachers.has(u.userEmail)) {
      return {
        label: 'Pending Approval',
        className: 'bg-amber-100 text-amber-700'
      };
    }
    
    if (u.isSuspended) {
      return {
        label: 'Suspended',
        className: 'bg-red-100 text-red-700'
      };
    }
    
    return {
      label: 'Active',
      className: 'bg-emerald-100 text-emerald-700'
    };
  };

  // 🆕 Approuver un teacher
  const handleApprove = async (userEmail: string) => {
    try {
      setActionLoading(userEmail);
      setError('');
      await authApi.unsuspendUser(userEmail);
      setSuccess(`User ${userEmail} has been approved successfully`);
      await loadUsers(); // Recharger la liste
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  // 🆕 Suspendre un user
  const handleSuspend = async (userEmail: string) => {
    if (!confirm(`Are you sure you want to suspend ${userEmail}?`)) return;
    
    try {
      setActionLoading(userEmail);
      setError('');
      await authApi.suspendUser(userEmail);
      setSuccess(`User ${userEmail} has been suspended successfully`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend user');
    } finally {
      setActionLoading(null);
    }
  };

  // 🆕 Unsuspend un user
  const handleUnsuspend = async (userEmail: string) => {
    try {
      setActionLoading(userEmail);
      setError('');
      await authApi.unsuspendUser(userEmail);
      setSuccess(`User ${userEmail} has been unsuspended successfully`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsuspend user');
    } finally {
      setActionLoading(null);
    }
  };

  // 🆕 Déterminer quelles actions sont disponibles pour un user
  const getUserActions = (u: User) => {
    const isPending = pendingTeachers.has(u.userEmail);
    const isCurrentUser = u.userEmail === user?.userEmail; // Ne pas pouvoir se suspendre soi-même
    
    if (isCurrentUser) {
      return null; // Pas d'actions sur soi-même
    }
    
    if (isPending) {
      // Teacher en attente → Approve ou Reject
      return {
        type: 'pending',
        actions: [
          { label: 'Approve', onClick: () => handleApprove(u.userEmail), color: 'emerald' },
          { label: 'Reject', onClick: () => handleSuspend(u.userEmail), color: 'red' }
        ]
      };
    }
    
    if (u.isSuspended) {
      // User suspendu → Unsuspend
      return {
        type: 'suspended',
        actions: [
          { label: 'Unsuspend', onClick: () => handleUnsuspend(u.userEmail), color: 'emerald' }
        ]
      };
    }
    
    // User actif → Suspend
    return {
      type: 'active',
      actions: [
        { label: 'Suspend', onClick: () => handleSuspend(u.userEmail), color: 'red' }
      ]
    };
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/departments', label: 'Departments', icon: Building2 },
    { href: '/admin/semesters', label: 'Semesters', icon: Calendar },
    { href: '/admin/subjects', label: 'Subjects', icon: BookText },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR (inchangée) */}
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
              placeholder="Search users by name or email..."
              className="w-96 rounded-lg border border-slate-200/60 bg-white/80 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
            <div className="flex items-center gap-3">
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
                <h2 className="text-3xl font-black text-slate-900">All Users</h2>
                <p className="text-sm text-slate-600">
                  View and manage all registered users on the platform.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadUsers}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-700"
                >
                  Refresh
                </button>
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg">
                  {users.length} Users
                </span>
              </div>
            </div>

            {/* 🆕 Message de succès */}
            {success && (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-800">
                {success}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50/80 p-3 text-sm text-red-800">
                {error}
                <button
                  onClick={loadUsers}
                  className="ml-2 font-semibold text-red-700 hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            )}

            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-12 text-center">
                  <p className="text-slate-500">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Role(s)
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Status
                        </th>
                        {/* 🆕 Colonne Actions */}
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => {
                        const status = getUserStatus(u);
                        const actions = getUserActions(u);
                        const isLoading = actionLoading === u.userEmail;
                        
                        return (
                          <tr
                            key={u.userEmail}
                            className="bg-white/60 transition hover:bg-slate-50/80"
                          >
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-900">
                                {u.userFirstName} {u.userLastName}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-600">{u.userEmail}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {u.role.map((r) => (
                                  <span
                                    key={r.roleName}
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeColor(
                                      r.roleName
                                    )}`}
                                  >
                                    {r.roleName}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                                {status.label}
                              </span>
                            </td>
                            {/* 🆕 Colonne Actions */}
                            <td className="px-6 py-4">
                              {isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  <span className="text-xs text-slate-500">Processing...</span>
                                </div>
                              ) : actions ? (
                                <div className="flex gap-2">
                                  {actions.actions.map((action, idx) => (
                                    <button
                                      key={idx}
                                      onClick={action.onClick}
                                      className={`text-xs font-semibold ${
                                        action.color === 'emerald'
                                          ? 'text-emerald-600 hover:text-emerald-700'
                                          : 'text-red-600 hover:text-red-700'
                                      }`}
                                    >
                                      {action.label}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function UsersListPage() {
  return (
    <ProtectedRoute requireAdmin>
      <UsersListContent />
    </ProtectedRoute>
  );
}