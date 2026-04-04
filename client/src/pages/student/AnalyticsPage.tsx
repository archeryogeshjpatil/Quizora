import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { analyticsService, resultService } from '../../services/analytics.service';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Result {
  id: string;
  testId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number;
  submittedAt: string;
  test: {
    title: string;
    type: string;
    subject: { name: string };
    duration: number;
  };
}

interface Dashboard {
  totalAttempts: number;
  avgPercentage: number;
  bestPercentage: number;
}

function MetricTile({
  icon,
  eyebrow,
  value,
  note,
  accentClass,
}: {
  icon: string;
  eyebrow: string;
  value: string | number;
  note: string;
  accentClass: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-slate-300/80 bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_42%,#e2e8f0_100%)] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)]">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${accentClass}`} />
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100/60 blur-2xl" />
      <div className="relative">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-xl text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]">
            {icon}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</span>
        </div>
        <p className="text-4xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{note}</p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  kicker,
  icon,
  children,
  className = '',
}: {
  title: string;
  kicker: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative h-full overflow-hidden rounded-[30px] border border-slate-300/80 bg-[linear-gradient(160deg,#ffffff_0%,#f8fafc_58%,#e2e8f0_100%)] p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)] ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(30,64,175,0.04)_0%,transparent_24%),linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.42)_48%,transparent_74%)]" />
      <div className="pointer-events-none absolute -right-12 top-0 h-32 w-32 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="relative">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1e3a8a_0%,#0f172a_100%)] text-xl text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)]">
            {icon}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700/80">{kicker}</p>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function InsightRow({
  rank,
  icon,
  label,
  sublabel,
  value,
  tone,
}: {
  rank: string;
  icon: string;
  label: string;
  sublabel: string;
  value: string;
  tone: 'blue' | 'slate';
}) {
  const toneClasses =
    tone === 'blue'
      ? 'border-blue-200 bg-[linear-gradient(135deg,#eff6ff_0%,#dbeafe_100%)] text-blue-700'
      : 'border-slate-300 bg-[linear-gradient(135deg,#f8fafc_0%,#e2e8f0_100%)] text-slate-700';

  return (
    <div className={`flex items-center justify-between rounded-[22px] border px-4 py-3 shadow-sm transition hover:translate-x-1 ${toneClasses}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 text-lg shadow-inner">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{sublabel}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-80">{rank}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function StudentAnalyticsPage() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getStudentDashboard(),
      resultService.getMyResults(),
    ])
      .then(([dashRes, resultsRes]) => {
        setDashboard(dashRes.data);
        setResults(resultsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const subjectStats = useMemo(() => {
    const map: Record<string, { count: number; totalPct: number }> = {};
    for (const r of results) {
      const name = r.test?.subject?.name || 'Unknown';
      if (!map[name]) map[name] = { count: 0, totalPct: 0 };
      map[name].count++;
      map[name].totalPct += r.percentage || 0;
    }
    return map;
  }, [results]);

  const subjectChartData = useMemo(
    () =>
      Object.entries(subjectStats)
        .map(([subject, stats]) => ({
          subject,
          avg: Math.round(stats.totalPct / stats.count),
          tests: stats.count,
        }))
        .sort((a, b) => b.avg - a.avg),
    [subjectStats]
  );

  const trendData = useMemo(
    () =>
      [...results]
        .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
        .map((r) => ({
          date: new Date(r.submittedAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          }),
          percentage: r.percentage,
          title: r.test?.title || 'Test',
        })),
    [results]
  );

  const { strengths, weaknesses } = useMemo(() => {
    const sorted = [...subjectChartData];
    return {
      strengths: sorted.slice(0, 3).filter((s) => s.tests > 0),
      weaknesses: sorted.slice().reverse().slice(0, 3).filter((s) => s.tests > 0),
    };
  }, [subjectChartData]);

  const comparison = useMemo(() => {
    const practice = { count: 0, totalPct: 0, totalTime: 0 };
    const official = { count: 0, totalPct: 0, totalTime: 0 };
    for (const r of results) {
      const bucket = r.test?.type === 'practice' ? practice : official;
      bucket.count++;
      bucket.totalPct += r.percentage || 0;
      bucket.totalTime += r.timeTaken || 0;
    }
    return { practice, official };
  }, [results]);

  const timeStats = useMemo(() => {
    if (results.length === 0) return { avgTaken: 0, avgAllowed: 0 };
    let totalTaken = 0;
    let totalAllowed = 0;
    for (const r of results) {
      totalTaken += r.timeTaken || 0;
      totalAllowed += (r.test?.duration || 0) * 60;
    }
    return {
      avgTaken: Math.round(totalTaken / results.length),
      avgAllowed: Math.round(totalAllowed / results.length),
    };
  }, [results]);

  const formatTime = (seconds: number) => {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  };

  const practiceAvg = comparison.practice.count > 0 ? Math.round(comparison.practice.totalPct / comparison.practice.count) : 0;
  const officialAvg = comparison.official.count > 0 ? Math.round(comparison.official.totalPct / comparison.official.count) : 0;
  const practiceTime = comparison.practice.count > 0 ? Math.round(comparison.practice.totalTime / comparison.practice.count) : 0;
  const officialTime = comparison.official.count > 0 ? Math.round(comparison.official.totalTime / comparison.official.count) : 0;
  const timeUsage = timeStats.avgAllowed > 0 ? Math.round((timeStats.avgTaken / timeStats.avgAllowed) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-[30px] border border-slate-300/80 bg-[linear-gradient(135deg,#dbeafe_0%,#c7d2fe_26%,#e2e8f0_78%,#f8fafc_100%)] px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(59,130,246,0.18),transparent_20%),linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.24)_48%,transparent_74%)]" />
        <div className="relative">
          <span className="inline-flex rounded-full border border-slate-300/80 bg-slate-950/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm">
            Performance
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{t('analytics.performance')}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Your score story across tests, subjects, timing, and momentum.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile icon="🧪" eyebrow="Attempts" value={dashboard?.totalAttempts || 0} note="Tests completed across your learning journey" accentClass="bg-[linear-gradient(90deg,#2563eb_0%,#0f172a_100%)]" />
        <MetricTile icon="📊" eyebrow="Average" value={dashboard?.avgPercentage ? `${Math.round(dashboard.avgPercentage)}%` : '—'} note="Your current overall scoring level" accentClass="bg-[linear-gradient(90deg,#0f172a_0%,#334155_100%)]" />
        <MetricTile icon="🏅" eyebrow="Best" value={dashboard?.bestPercentage ? `${Math.round(dashboard.bestPercentage)}%` : '—'} note="Your highest recorded course score" accentClass="bg-[linear-gradient(90deg,#4338ca_0%,#0f172a_100%)]" />
        <MetricTile icon="📚" eyebrow="Coverage" value={Object.keys(subjectStats).length} note="Subjects you have already attempted" accentClass="bg-[linear-gradient(90deg,#1d4ed8_0%,#475569_100%)]" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title={t('analytics.scoreTrend', 'Score Trend')} kicker="Hero Chart" icon="📈">
          {trendData.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noData', 'No data available')}</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{trendData[trendData.length - 1]?.percentage ?? '—'}%</p>
                  <p className="text-sm text-slate-500">Most recent score</p>
                </div>
                <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Trend line
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Score']} />
                  <Line type="monotone" dataKey="percentage" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 4, fill: '#0f172a' }} activeDot={{ r: 7, fill: '#2563eb' }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </SectionCard>

        <SectionCard title={t('analytics.subjectWise', 'Subject-wise Performance')} kicker="Breakdown" icon="🧭">
          {subjectChartData.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noData', 'No data available')}</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Avg Score']} />
                  <Bar dataKey="avg" fill="#0f172a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </SectionCard>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title={t('analytics.strengths', 'Strengths')} kicker="Top Subjects" icon="💪">
          {strengths.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noData', 'No data available')}</p>
          ) : (
            <div className="space-y-3">
              {strengths.map((s, i) => (
                <InsightRow
                  key={s.subject}
                  rank={`Rank ${i + 1}`}
                  icon={i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  label={s.subject}
                  sublabel={`${s.tests} ${t('analytics.tests', 'tests')}`}
                  value={`${s.avg}%`}
                  tone="blue"
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title={t('analytics.weaknesses', 'Weaknesses')} kicker="Focus Areas" icon="🎯">
          {weaknesses.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noData', 'No data available')}</p>
          ) : (
            <div className="space-y-3">
              {weaknesses.map((s, i) => (
                <InsightRow
                  key={s.subject}
                  rank={`Focus ${i + 1}`}
                  icon="🧩"
                  label={s.subject}
                  sublabel={`${s.tests} ${t('analytics.tests', 'tests')}`}
                  value={`${s.avg}%`}
                  tone="slate"
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title={t('analytics.practiceVsOfficial', 'Practice vs Official')} kicker="Head To Head" icon="⚖️">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <div className="rounded-[24px] border border-blue-200 bg-[linear-gradient(150deg,#eff6ff_0%,#dbeafe_100%)] p-5 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/75 text-2xl shadow-inner">📝</div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">{t('analytics.practice', 'Practice')}</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{comparison.practice.count}</p>
              <p className="text-xs text-slate-500">{t('analytics.tests', 'tests')}</p>
              <div className="mt-4 space-y-1 border-t border-blue-200 pt-4 text-sm text-slate-600">
                <p>Avg Score: <span className="font-semibold">{practiceAvg}%</span></p>
                <p>Avg Time: <span className="font-semibold">{formatTime(practiceTime)}</span></p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-slate-950 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]">
                VS
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-300 bg-[linear-gradient(150deg,#f8fafc_0%,#e2e8f0_100%)] p-5 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/75 text-2xl shadow-inner">🏛️</div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">{t('analytics.official', 'Official')}</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{comparison.official.count}</p>
              <p className="text-xs text-slate-500">{t('analytics.tests', 'tests')}</p>
              <div className="mt-4 space-y-1 border-t border-slate-300 pt-4 text-sm text-slate-600">
                <p>Avg Score: <span className="font-semibold">{officialAvg}%</span></p>
                <p>Avg Time: <span className="font-semibold">{formatTime(officialTime)}</span></p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={t('analytics.timeManagement', 'Time Management')} kicker="Pacing" icon="⏱️">
          {results.length === 0 ? (
            <p className="text-sm text-slate-400">{t('common.noData', 'No data available')}</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_220px] xl:items-center">
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">{t('analytics.avgTimeTaken', 'Avg Time Taken')}</span>
                    <span className="font-semibold text-slate-900">{formatTime(timeStats.avgTaken)}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200">
                    <div className="h-3 rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#0f172a_100%)] transition-all" style={{ width: `${Math.min(100, timeUsage)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">{t('analytics.avgTimeAllowed', 'Avg Time Allowed')}</span>
                    <span className="font-semibold text-slate-900">{formatTime(timeStats.avgAllowed)}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200">
                    <div className="h-3 w-full rounded-full bg-slate-400" />
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-[28px] border border-blue-200 bg-[linear-gradient(150deg,#eff6ff_0%,#dbeafe_100%)] p-5 text-center shadow-sm">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.5),transparent_30%)]" />
                <div className="relative">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/75 text-2xl shadow-inner">⌛</div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Usage</p>
                  <p className="mt-2 text-4xl font-bold text-slate-900">{timeUsage || '—'}%</p>
                  <p className="mt-1 text-xs text-slate-500">{t('analytics.ofAllowedTime', 'of allowed time used')}</p>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
