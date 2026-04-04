import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet, Trophy, Users } from 'lucide-react';
import { testService } from '../../services/test.service';
import { resultService } from '../../services/analytics.service';
import { Test } from '../../types';
import {
  AdminDataTable,
  AdminEmptyState,
  AdminFilterBar,
  AdminMetricCard,
  AdminPageHeader,
  adminButtonPrimary,
  adminButtonSecondary,
  adminFilterClass,
} from '../../components/common/AdminTheme';

export function AdminResultsPage() {
  const { t } = useTranslation();
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testsLoading, setTestsLoading] = useState(true);

  useEffect(() => {
    testService.getAll().then((res) => setTests(res.data)).catch(() => {}).finally(() => setTestsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTestId) { setResults([]); return; }
    setLoading(true);
    resultService.getTestResults(selectedTestId)
      .then((res) => setResults(res.data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [selectedTestId]);

  const formatTime = (seconds: number) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length) : 0;
  const passCount = results.filter((r) => (r.percentage || 0) >= 60).length;

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        eyebrow="Result analytics"
        title={t('nav.results')}
        description="View student rankings, export score reports, and monitor pass-fail performance for each test."
      />

      {/* Test Selector */}
      <AdminFilterBar>
        <div className="flex-1">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Choose assessment</p>
          <div className="flex-1 w-full">
            <select value={selectedTestId} onChange={(e) => setSelectedTestId(e.target.value)} className={`w-full px-4 py-3 ${adminFilterClass}`}>
              <option value="">Choose a test to view results...</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>{test.title} — {test.subject?.name} ({test.type})</option>
              ))}
            </select>
          </div>
        </div>
        {selectedTestId && (
          <div className="flex gap-2 flex-shrink-0">
            <a href={`/api/results/export/${selectedTestId}/pdf`} className={`${adminButtonSecondary} inline-flex items-center gap-2`}>
              <Download className="h-4 w-4" /> {t('result.exportPdf')}
            </a>
            <a href={`/api/results/export/${selectedTestId}/excel`} className={`${adminButtonPrimary} inline-flex items-center gap-2`}>
              <FileSpreadsheet className="h-4 w-4" /> {t('result.exportExcel')}
            </a>
          </div>
        )}
      </AdminFilterBar>

      {!selectedTestId && !testsLoading && (
        <AdminEmptyState title="Select a Test" description="Choose a test from the dropdown above to view student results, scores, and rankings." icon="📋" />
      )}

      {selectedTestId && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <AdminMetricCard label="Students" value={results.length} accent="text-blue-600" icon={<Users className="h-5 w-5" />} />
          <AdminMetricCard label="Average" value={`${avgScore}%`} accent="text-green-600" icon={<Trophy className="h-5 w-5" />} />
          <AdminMetricCard label="Passed" value={passCount} accent="text-emerald-600" icon={<Download className="h-5 w-5" />} />
          <AdminMetricCard label="Failed" value={results.length - passCount} accent="text-red-600" icon={<FileSpreadsheet className="h-5 w-5" />} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : selectedTestId && results.length === 0 ? (
        <AdminEmptyState title="No Results Yet" description="No students have completed this test yet." icon="📭" />
      ) : results.length > 0 && (
        <AdminDataTable
          header={
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">Ranking board</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Student performance table</h2>
              </div>
              <div className="rounded-2xl border border-teal-200 bg-white/80 px-3 py-2 text-right shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Entries</p>
                <p className="text-lg font-bold text-slate-900">{results.length}</p>
              </div>
            </div>
          }
        >
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">{t('result.rank')}</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Student</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">{t('auth.email')}</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">{t('result.score')}</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">%</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Time</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {results.map((r: any, i: number) => (
              <tr key={r.id} className="hover:bg-blue-50/50 transition">
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>{i + 1}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{r.student?.fullName?.charAt(0) || '?'}</div>
                    <span className="text-sm font-medium text-gray-900">{r.student?.fullName || '—'}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{r.student?.email || '—'}</td>
                <td className="px-5 py-3.5 text-sm text-right font-medium text-gray-700">{r.score ?? '—'}/{r.totalMarks ?? '—'}</td>
                <td className="px-5 py-3.5 text-sm text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${(r.percentage || 0) >= 80 ? 'bg-green-100 text-green-700' : (r.percentage || 0) >= 60 ? 'bg-blue-100 text-blue-700' : (r.percentage || 0) >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.percentage ?? '—'}%</span>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{formatTime(r.timeTaken)}</td>
                <td className="px-5 py-3.5 text-sm text-gray-400 text-right">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-IN') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </AdminDataTable>
      )}
    </div>
  );
}
