import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { NotificationBell } from './NotificationBell';
import { adminNavIcons } from './AppIcons';

const navItems = [
  { path: '/admin', icon: adminNavIcons.dashboard, label: 'Dashboard' },
  { path: '/admin/subjects', icon: adminNavIcons.subjects, label: 'Subjects' },
  { path: '/admin/questions', icon: adminNavIcons.questions, label: 'Question Bank' },
  { path: '/admin/tests', icon: adminNavIcons.tests, label: 'Tests' },
  { path: '/admin/series', icon: adminNavIcons.series, label: 'Test Series' },
  { path: '/admin/batches', icon: adminNavIcons.batches, label: 'Batches' },
  { path: '/admin/students', icon: adminNavIcons.students, label: 'Students' },
  { path: '/admin/results', icon: adminNavIcons.results, label: 'Results' },
  { path: '/admin/analytics', icon: adminNavIcons.analytics, label: 'Analytics' },
  { path: '/admin/certificates', icon: adminNavIcons.certificates, label: 'Certificates' },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const activeItem =
    navItems.find((item) => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))) ||
    navItems[0];

  const sidebarWidth = isSidebarCollapsed ? 88 : 248;

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,#f0fdfa_0%,#f8fafc_32%,#eff6ff_100%)] text-slate-900">
      <aside
        className="sticky top-0 self-start flex min-h-screen shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#134e4a_52%,#0f172a_100%)] shadow-[10px_0_30px_rgba(15,23,42,0.16)] transition-[width] duration-300 ease-out"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.13),transparent_24%),radial-gradient(circle_at_25%_30%,rgba(45,212,191,0.14),transparent_18%),linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.05)_38%,transparent_68%),repeating-linear-gradient(135deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_12px)]" />

        <div className="relative flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <Link
            to="/"
            className={`flex min-w-0 items-center gap-3 transition ${isSidebarCollapsed ? 'flex-1 justify-center' : 'flex-1'}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-teal-500/25">
              Q
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-[15px] font-bold leading-tight text-white">Quizora</h1>
                <p className="text-[10px] leading-tight text-teal-100/75">Admin Panel</p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-white transition hover:bg-white/[0.14]"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="relative flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center rounded-xl px-3 py-2.5 text-[13px] transition-all ${
                  isSidebarCollapsed ? 'justify-center' : 'gap-3'
                } ${
                  isActive
                    ? 'border border-white/10 bg-white/[0.14] text-white font-medium shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur'
                    : 'text-slate-200/75 hover:bg-white/[0.07] hover:text-white'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isActive ? 'bg-white/10' : 'bg-white/[0.04] group-hover:bg-white/[0.08]'}`}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="relative border-t border-white/10 bg-black/10 px-4 py-4 backdrop-blur-sm">
          {isSidebarCollapsed ? (
            <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-white">AI</p>
          ) : (
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
              Powered by Archer Infotech
            </p>
          )}
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 overflow-hidden border-b border-slate-800/20 bg-[linear-gradient(135deg,#0f172a_0%,#134e4a_45%,#115e59_100%)] shadow-[0_10px_30px_rgba(15,23,42,0.16)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(94,234,212,0.18),transparent_22%),linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_45%,transparent_70%)]" />
          <div className="relative flex items-center justify-between gap-4 px-5 py-3.5 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-white transition hover:bg-white/[0.14]"
                aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-100/80">Admin workspace</p>
                <p className="truncate text-sm font-semibold text-white">{activeItem.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationBell />
              <div className="hidden items-center gap-3 sm:flex">
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-white">{user?.fullName}</p>
                  <p className="text-[10px] text-teal-100/75">Administrator</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 via-emerald-400 to-cyan-300 text-xs font-bold text-slate-900 shadow-[0_8px_24px_rgba(45,212,191,0.35)]">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
              </div>
              <button
                onClick={logout}
                className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-[13px] text-slate-100 transition hover:bg-red-500/15 hover:text-white"
              >
                {t('auth.logout')}
              </button>
              <LanguageSelector />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-5 sm:p-7">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
