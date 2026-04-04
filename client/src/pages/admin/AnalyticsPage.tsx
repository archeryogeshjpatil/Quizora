import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { analyticsService } from '../../services/analytics.service';
import { testService } from '../../services/test.service';
import { Test } from '../../types';
import { AdminMetricCard, AdminPageHeader, AdminSectionTitle, AdminSurface, adminButtonPrimary, adminButtonSecondary, adminFilterClass } from '../../components/common/AdminTheme';

const DISTRIBUTION_LABELS = ['0-20', '21-40', '41-60', '61-80', '81-100'];
const PIE_COLORS = ['#22c55e', '#ef4444'];

export function AdminAnalyticsPage() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState<any>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [testAnalytics, setTestAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getAdminDashboard(),
      testService.getAll(),
    ])
      .then(([dashRes, testsRes]) => {
        setDashboard(dashRes.data);
        setTests(testsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTestId) { setTestAnalytics(null); return; }
    analyticsService.getTestAnalytics(selectedTestId)
      .then((res) => setTestAnalytics(res.data))
      .catch(() => setTestAnalytics(null));
  }, [selectedTestId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const distributionData = testAnalytics?.distribution
    ? DISTRIBUTION_LABELS.map((label) => ({
        range: `${label}%`,
        count: testAnalytics.distribution[label] ?? 0,
      }))
    : [];

  const pieData = testAnalytics
    ? [
        { name: t('analytics.pass', 'Pass'), value: testAnalytics.passCount ?? 0 },
        { name: t('analytics.fail', 'Fail'), value: testAnalytics.failCount ?? 0 },
      ]
    : [];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Performance insights"
        title={t('nav.analytics')}
        description="Review platform-wide performance and drill into per-test distributions, pass rates, and top scorers."
      />

      {/* Platform-Wide Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={t('dashboard.totalStudents')}
          value={dashboard?.totalStudents ?? 0}
          color="blue"
        />
        <StatCard
          label={t('dashboard.totalTests')}
          value={dashboard?.totalTests ?? 0}
          color="green"
        />
        <StatCard
          label={t('dashboard.totalAttempts')}
          value={dashboard?.totalAttempts ?? 0}
          color="purple"
        />
        <StatCard
          label={t('dashboard.averageScore')}
          value={dashboard?.avgPercentage ? `${Math.round(dashboard.avgPercentage)}%` : '—'}
          color="orange"
        />
      </div>

      {/* Per-Test Analytics */}
      <AdminSurface className="p-6" tinted>
        <AdminSectionTitle
          title={t('analytics.perTest', 'Per-Test Analytics')}
          description="Select a test to inspect detailed distributions, averages, and pass-fail breakdowns."
        />

        <select
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          className={`w-full max-w-md mb-6 ${adminFilterClass}`}
        >
          <option value="">{t('analytics.selectTest', 'Select a test')}</option>
          {tests.map((test) => (
            <option key={test.id} value={test.id}>
              {test.title} — {test.subject?.name}
            </option>
          ))}
        </select>

        {!selectedTestId && (
          <p className="text-gray-400 text-sm">{t('analytics.selectPrompt', 'Select a test to view detailed analytics')}</p>
        )}

        {testAnalytics && (
          <div className="space-y-8">
            {/* Test Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MiniStat label={t('dashboard.totalAttempts')} value={testAnalytics.totalAttempts} bg="bg-blue-50" text="text-blue-700" />
              <MiniStat label={t('analytics.avgScore', 'Avg Score')} value={testAnalytics.avgScore != null ? Math.round(testAnalytics.avgScore * 10) / 10 : '—'} bg="bg-green-50" text="text-green-700" />
              <MiniStat label={t('analytics.highest', 'Highest')} value={testAnalytics.highestScore ?? '—'} bg="bg-purple-50" text="text-purple-700" />
              <MiniStat label={t('analytics.lowest', 'Lowest')} value={testAnalytics.lowestScore ?? '—'} bg="bg-orange-50" text="text-orange-700" />
              <MiniStat label={t('analytics.passed', 'Passed')} value={testAnalytics.passCount ?? 0} bg="bg-emerald-50" text="text-emerald-700" />
              <MiniStat label={t('analytics.failed', 'Failed')} value={testAnalytics.failCount ?? 0} bg="bg-red-50" text="text-red-700" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Distribution Bar Chart */}
              <AdminSurface className="p-4" tinted>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('analytics.scoreDistribution', 'Score Distribution')}</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </AdminSurface>

              {/* Pass/Fail Pie Chart */}
              <AdminSurface className="p-4" tinted>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('analytics.passFail', 'Pass / Fail')}</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </AdminSurface>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3">
              <a
                href={`/api/results/export/${selectedTestId}/pdf`}
                className={adminButtonSecondary}
              >
                {t('analytics.exportPdf', 'Export PDF')}
              </a>
              <a
                href={`/api/results/export/${selectedTestId}/excel`}
                className={adminButtonPrimary}
              >
                {t('analytics.exportExcel', 'Export Excel')}
              </a>
            </div>

            {/* Top 10 Scorers */}
            {testAnalytics.topScorers?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('analytics.topScorers', 'Top 10 Scorers')}</h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 text-left">
                        <th className="px-4 py-2 rounded-tl-lg">{t('analytics.rank', 'Rank')}</th>
                        <th className="px-4 py-2">{t('analytics.name', 'Name')}</th>
                        <th className="px-4 py-2">{t('analytics.score', 'Score')}</th>
                        <th className="px-4 py-2">{t('analytics.percentage', 'Percentage')}</th>
                        <th className="px-4 py-2 rounded-tr-lg">{t('analytics.time', 'Time')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testAnalytics.topScorers.map((scorer: any) => (
                        <tr key={scorer.rank} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-800">{scorer.rank}</td>
                          <td className="px-4 py-2 text-gray-700">{scorer.name}</td>
                          <td className="px-4 py-2 text-gray-700">{scorer.score}</td>
                          <td className="px-4 py-2 text-gray-700">{scorer.percentage != null ? `${Math.round(scorer.percentage)}%` : '—'}</td>
                          <td className="px-4 py-2 text-gray-700">{scorer.timeTaken ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminSurface>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };
  return (
    <AdminMetricCard label={label} value={value} accent={colorMap[color] ?? 'text-gray-900'} />
  );
}

function MiniStat({ label, value, bg, text }: { label: string; value: string | number; bg: string; text: string }) {
  return (
    <div className={`${bg} rounded-2xl border border-white/70 p-4 text-center shadow-sm`}>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
