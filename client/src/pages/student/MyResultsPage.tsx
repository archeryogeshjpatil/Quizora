import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChartNoAxesColumn, FileSearch, TimerReset } from 'lucide-react';
import { resultService } from '../../services/analytics.service';
import { StudentEmptyState, StudentPageHero, StudentSurface } from '../../components/common/StudentTheme';

export function MyResultsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resultService.getMyResults().then((res) => setResults(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const formatTime = (s: number) => {
    if (!s) return '—';
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" /></div>;

  return (
    <div className="animate-fade-in">
      <StudentPageHero
        eyebrow="Result archive"
        title={t('nav.results')}
        description="Review completed tests, revisit performance details, and open full review mode for any attempt."
        icon={<FileSearch className="h-7 w-7" />}
      />

      {results.length === 0 ? (
        <StudentEmptyState
          icon={<FileSearch className="mx-auto h-10 w-10 text-slate-900" />}
          title="No Results Yet"
          description="Complete a test to see your results here."
        />
      ) : (
        <div className="space-y-4">
          {results.map((r: any) => {
            const pct = r.percentage || 0;
            const tone =
              pct >= 80
                ? 'from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700'
                : pct >= 60
                ? 'from-blue-100 to-blue-50 border-blue-200 text-blue-700'
                : pct >= 40
                ? 'from-amber-100 to-amber-50 border-amber-200 text-amber-700'
                : 'from-red-100 to-red-50 border-red-200 text-red-700';

            return (
              <StudentSurface key={r.id} className="cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)]" >
                <div onClick={() => navigate(`/student/test/${r.testId}/review?attemptId=${r.id}`)} className="flex items-center gap-4 group">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border bg-gradient-to-br ${tone} text-lg font-bold shadow-sm`}>
                    {pct}%
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition">{r.test?.title || 'Test'}</h3>
                      <span className="rounded-full border border-slate-300 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        Completed
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/75 px-2.5 py-1"><FileSearch className="h-3.5 w-3.5" /> {r.test?.subject?.name || '—'}</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/75 px-2.5 py-1"><ChartNoAxesColumn className="h-3.5 w-3.5" /> {r.score}/{r.totalMarks}</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/75 px-2.5 py-1"><TimerReset className="h-3.5 w-3.5" /> {formatTime(r.timeTaken)}</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/75 px-2.5 py-1"><CalendarDays className="h-3.5 w-3.5" /> {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-IN') : '—'}</span>
                    </div>
                  </div>
                  <div className="hidden shrink-0 md:block">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition group-hover:translate-x-1">
                      →
                    </div>
                  </div>
                </div>
              </StudentSurface>
            );
          })}
        </div>
      )}
    </div>
  );
}
