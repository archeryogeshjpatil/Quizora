import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, ClipboardList, FileText, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analytics.service';
import { AdminMetricCard, AdminPageHeader, AdminSectionTitle, AdminSurface } from '../../components/common/AdminTheme';

export function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    analyticsService.getAdminDashboard().then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const cards = [
    { label: t('dashboard.totalStudents'), value: stats?.totalStudents ?? '—', icon: <Users className="h-5 w-5" /> },
    { label: t('dashboard.totalTests'), value: stats?.totalTests ?? '—', icon: <FileText className="h-5 w-5" /> },
    { label: t('dashboard.totalAttempts'), value: stats?.totalAttempts ?? '—', icon: <BarChart3 className="h-5 w-5" /> },
    { label: t('dashboard.averageScore'), value: stats?.avgPercentage ? `${Math.round(stats.avgPercentage)}%` : '—', icon: <ClipboardList className="h-5 w-5" /> },
  ];

  const quickActions = [
    { label: 'Question Bank', desc: 'Add, import, or AI-generate questions', path: '/admin/questions', icon: <BookOpen className="h-5 w-5" />, color: 'bg-blue-600' },
    { label: 'Create Test', desc: 'Create a new test manually or auto-generate', path: '/admin/tests', icon: <FileText className="h-5 w-5" />, color: 'bg-green-600' },
    { label: 'View Results', desc: 'See student scores and export reports', path: '/admin/results', icon: <ClipboardList className="h-5 w-5" />, color: 'bg-purple-600' },
    { label: 'Analytics', desc: 'Charts, distributions, and top scorers', path: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" />, color: 'bg-orange-600' },
    { label: 'Manage Students', desc: 'View profiles, activate/deactivate', path: '/admin/students', icon: <GraduationCap className="h-5 w-5" />, color: 'bg-indigo-600' },
    { label: 'Batches', desc: 'Assign students and tests to batches', path: '/admin/batches', icon: <Users className="h-5 w-5" />, color: 'bg-teal-600' },
  ];

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        eyebrow="Admin dashboard"
        title={<>{t('dashboard.welcome')}, {user?.fullName} 👋</>}
        description="Here's an overview of your examination platform, recent activity zones, and quick admin actions."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card) => (
          <AdminMetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <AdminSectionTitle
          title={t('dashboard.quickActions')}
          description="Jump straight into the most common admin workflows."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="group"
            >
              <AdminSurface className="h-full p-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_45px_rgba(15,23,42,0.1)]" tinted>
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 ${action.color} rounded-xl flex items-center justify-center text-lg text-white flex-shrink-0 shadow-sm group-hover:scale-105 transition`}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition">{action.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                  </div>
                </div>
              </AdminSurface>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <AdminSurface className="bg-[linear-gradient(135deg,#0f172a_0%,#134e4a_45%,#0f172a_100%)] p-6 text-center text-white">
        <p className="text-sm text-slate-200">Quizora Examination Platform — Powered by <span className="font-medium text-white">Archer Infotech</span>, Pune</p>
      </AdminSurface>
    </div>
  );
}
