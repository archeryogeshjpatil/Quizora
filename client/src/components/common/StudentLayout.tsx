import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { studentNavIcons } from './AppIcons';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { NotificationBell } from './NotificationBell';

const navItems = [
  { path: '/student', icon: studentNavIcons.dashboard, label: 'Dashboard' },
  { path: '/student/results', icon: studentNavIcons.results, label: 'My Results' },
  { path: '/student/leaderboard', icon: studentNavIcons.leaderboard, label: 'Leaderboard' },
  { path: '/student/analytics', icon: studentNavIcons.analytics, label: 'Analytics' },
  { path: '/student/series', icon: studentNavIcons.series, label: 'Test Series' },
  { path: '/student/certificates', icon: studentNavIcons.certificates, label: 'Certificates' },
];

export function StudentLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const activeItem = navItems.find((n) => n.path === location.pathname) || navItems[0];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_40%,#f3f6fb_100%)] flex">
      {/* Sidebar */}
      <aside className="sticky top-0 self-start w-[240px] overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,#020617_0%,#172554_24%,#0f172a_52%,#020617_100%)] flex flex-col min-h-screen z-20 shadow-[10px_0_30px_rgba(15,23,42,0.16)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_24%),radial-gradient(circle_at_50%_22%,rgba(59,130,246,0.12),transparent_16%),linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.03)_38%,transparent_70%),repeating-linear-gradient(135deg,rgba(255,255,255,0.025)_0px,rgba(255,255,255,0.025)_1px,transparent_1px,transparent_12px)]" />
        <Link to="/" className="relative px-5 py-5 border-b border-white/10 flex items-center gap-3 hover:bg-white/[0.04] transition">
          <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25">Q</div>
          <div>
            <h1 className="text-[15px] font-bold text-white leading-tight">Quizora</h1>
            <p className="text-[10px] text-blue-100/75 leading-tight">Student Workspace</p>
          </div>
        </Link>

        {/* Student Info */}
        <div className="relative px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-300 to-blue-500 rounded-full flex items-center justify-center text-slate-950 text-sm font-bold shadow-sm">{user?.fullName?.charAt(0) || 'S'}</div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user?.fullName}</p>
              <p className="text-[10px] text-blue-100/70 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="relative flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all ${isActive ? 'bg-white/[0.14] text-white font-semibold border border-white/10 shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur' : 'text-blue-100/75 hover:bg-white/[0.07] hover:text-white'}`}>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isActive ? 'bg-white/10' : 'bg-white/[0.04]'}`}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative px-3 py-3 border-t border-white/10 space-y-1 bg-black/10 backdrop-blur-sm">
          <button onClick={logout} className="w-full flex items-center gap-2 text-[13px] text-blue-100/75 hover:text-white hover:bg-white/[0.08] transition px-3 py-2 rounded-xl">
            <span>🚪</span><span>{t('auth.logout')}</span>
          </button>
          <p className="text-[9px] text-white text-center tracking-wide uppercase font-semibold">Powered by Archer Infotech</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 overflow-hidden border-b border-slate-800/20 bg-[linear-gradient(135deg,#020617_0%,#172554_28%,#0f172a_64%,#020617_100%)] shadow-[0_10px_30px_rgba(15,23,42,0.16)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_50%_18%,rgba(59,130,246,0.14),transparent_18%),linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.04)_45%,transparent_70%)]" />
          <div className="relative px-7 py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-100/80">Student workspace</p>
              <h2 className="text-[13px] font-medium text-white">{activeItem.label || 'Dashboard'}</h2>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <LanguageSelector />
            </div>
          </div>
        </header>

        <main className="p-7 animate-fade-in min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
