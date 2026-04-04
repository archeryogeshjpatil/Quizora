import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Medal, ScanSearch, Trophy } from 'lucide-react';
import { testService } from '../../services/test.service';
import { analyticsService } from '../../services/analytics.service';
import { seriesService } from '../../services/series.service';
import { useAuth } from '../../context/AuthContext';
import { Test, TestSeries, LeaderboardEntry } from '../../types';
import { StudentDataTable, StudentEmptyState, StudentFilterBar, StudentPageHero, studentFilterClass } from '../../components/common/StudentTheme';

interface SeriesLeaderboardEntry extends LeaderboardEntry {
  testsCompleted: number;
}

type Tab = 'test' | 'series';

export function LeaderboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('test');
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [testLeaderboard, setTestLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const [seriesList, setSeriesList] = useState<TestSeries[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [seriesLeaderboard, setSeriesLeaderboard] = useState<SeriesLeaderboardEntry[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(false);

  useEffect(() => {
    testService.getAvailable().then((res) => {
      const official = res.data.filter((t: Test) => t.type === 'OFFICIAL');
      setTests(official);
      if (official.length > 0) setSelectedTestId(official[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    seriesService.getAll().then((res) => {
      const list = res.data;
      setSeriesList(list);
      if (list.length > 0) setSelectedSeriesId(list[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTestId) return;
    setTestLoading(true);
    analyticsService.getTestLeaderboard(selectedTestId).then((res) => setTestLeaderboard(res.data)).catch(() => setTestLeaderboard([])).finally(() => setTestLoading(false));
  }, [selectedTestId]);

  useEffect(() => {
    if (!selectedSeriesId) return;
    setSeriesLoading(true);
    seriesService.getLeaderboard(selectedSeriesId).then((res) => setSeriesLeaderboard(res.data)).catch(() => setSeriesLeaderboard([])).finally(() => setSeriesLoading(false));
  }, [selectedSeriesId]);

  const isCurrentUser = (studentName: string) => user?.fullName === studentName;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-gray-300 text-gray-800';
    if (rank === 3) return 'bg-orange-300 text-orange-900';
    return 'bg-gray-100 text-gray-600';
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return 'text-green-600';
    if (pct >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'test', label: t('leaderboard.testLeaderboard', 'Test Leaderboard') },
    { key: 'series', label: t('leaderboard.seriesLeaderboard', 'Series Leaderboard') },
  ];

  return (
    <div>
      <StudentPageHero
        eyebrow="Rankings"
        title={t('nav.leaderboard')}
        description="Track where you stand across single tests and full series leaderboards."
        icon={<Trophy className="h-7 w-7" />}
      />

      <div className="mb-5 flex w-fit gap-1 rounded-2xl border border-slate-300/80 bg-white/80 p-1.5 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-[linear-gradient(135deg,#1d4ed8_0%,#0f172a_100%)] text-white shadow-[0_10px_20px_rgba(15,23,42,0.12)]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'test' && (
        <div>
          <StudentFilterBar>
            <select value={selectedTestId} onChange={(e) => setSelectedTestId(e.target.value)} className={`min-w-[320px] ${studentFilterClass}`}>
              <option value="">{t('leaderboard.selectTest', 'Select a test')}</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>{test.title} — {test.subject?.name}</option>
              ))}
            </select>
          </StudentFilterBar>

          {testLoading ? (
            <div className="flex justify-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" /></div>
          ) : testLeaderboard.length === 0 ? (
            <StudentEmptyState icon={<Medal className="mx-auto h-10 w-10 text-slate-900" />} title={t('common.noData')} description="No leaderboard data is available for this test yet." />
          ) : (
            <StudentDataTable
              header={
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Test rankings</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">Performance leaderboard</h2>
                  </div>
                  <div className="rounded-2xl border border-slate-300/80 bg-white/80 px-3 py-2 text-right shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Entries</p>
                    <p className="text-lg font-bold text-slate-900">{testLeaderboard.length}</p>
                  </div>
                </div>
              }
            >
              <thead className="border-b border-slate-300 bg-slate-50/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('result.rank')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('leaderboard.student', 'Student')}</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('result.score')}</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('result.percentage')}</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('result.timeTaken')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {testLeaderboard.map((entry) => (
                  <tr key={entry.rank} className={`transition ${isCurrentUser(entry.studentName) ? 'bg-blue-50/70 hover:bg-blue-100/60' : 'hover:bg-slate-50/70'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getRankStyle(entry.rank)}`}>{entry.rank}</span>
                        {getRankBadge(entry.rank) && <span className="text-lg">{getRankBadge(entry.rank)}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {entry.studentName}
                      {isCurrentUser(entry.studentName) && <span className="ml-2 text-xs font-semibold text-blue-600">({t('leaderboard.you', 'You')})</span>}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">{entry.score}</td>
                    <td className="px-6 py-4 text-right text-sm"><span className={`font-semibold ${getPercentageColor(entry.percentage)}`}>{entry.percentage}%</span></td>
                    <td className="px-6 py-4 text-right text-sm text-slate-500">{formatTime(entry.timeTaken)}</td>
                  </tr>
                ))}
              </tbody>
            </StudentDataTable>
          )}
        </div>
      )}

      {activeTab === 'series' && (
        <div>
          <StudentFilterBar>
            <select value={selectedSeriesId} onChange={(e) => setSelectedSeriesId(e.target.value)} className={`min-w-[320px] ${studentFilterClass}`}>
              <option value="">{t('leaderboard.selectSeries', 'Select a series')}</option>
              {seriesList.map((series) => (
                <option key={series.id} value={series.id}>{series.name}</option>
              ))}
            </select>
          </StudentFilterBar>

          {seriesLoading ? (
            <div className="flex justify-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" /></div>
          ) : seriesLeaderboard.length === 0 ? (
            <StudentEmptyState icon={<ScanSearch className="mx-auto h-10 w-10 text-slate-900" />} title={t('common.noData')} description="No leaderboard data is available for this series yet." />
          ) : (
            <StudentDataTable
              header={
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">Series rankings</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">Cumulative leaderboard</h2>
                  </div>
                  <div className="rounded-2xl border border-slate-300/80 bg-white/80 px-3 py-2 text-right shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Entries</p>
                    <p className="text-lg font-bold text-slate-900">{seriesLeaderboard.length}</p>
                  </div>
                </div>
              }
            >
              <thead className="border-b border-slate-300 bg-slate-50/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('result.rank')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('leaderboard.student', 'Student')}</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('leaderboard.cumulativeScore', 'Cumulative Score')}</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('result.percentage')}</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('leaderboard.testsCompleted', 'Tests Completed')}</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('leaderboard.totalTime', 'Total Time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {seriesLeaderboard.map((entry) => (
                  <tr key={entry.rank} className={`transition ${isCurrentUser(entry.studentName) ? 'bg-blue-50/70 hover:bg-blue-100/60' : 'hover:bg-slate-50/70'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getRankStyle(entry.rank)}`}>{entry.rank}</span>
                        {getRankBadge(entry.rank) && <span className="text-lg">{getRankBadge(entry.rank)}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {entry.studentName}
                      {isCurrentUser(entry.studentName) && <span className="ml-2 text-xs font-semibold text-blue-600">({t('leaderboard.you', 'You')})</span>}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">{entry.score}</td>
                    <td className="px-6 py-4 text-right text-sm"><span className={`font-semibold ${getPercentageColor(entry.percentage)}`}>{entry.percentage}%</span></td>
                    <td className="px-6 py-4 text-right text-sm text-slate-700">{entry.testsCompleted}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-500">{formatTime(entry.timeTaken)}</td>
                  </tr>
                ))}
              </tbody>
            </StudentDataTable>
          )}
        </div>
      )}
    </div>
  );
}
