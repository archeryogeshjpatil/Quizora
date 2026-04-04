import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BookOpenCheck, CheckCircle2, ChevronRight, Layers3, Trophy } from 'lucide-react';
import { seriesService } from '../../services/series.service';
import { StudentEmptyState, StudentPageHero, StudentSurface } from '../../components/common/StudentTheme';

export function StudentSeriesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seriesService.getStudentSeries().then((res) => setSeriesList(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" /></div>;

  return (
    <div className="animate-fade-in">
      <StudentPageHero
        eyebrow="Guided tracks"
        title={t('nav.series')}
        description="Follow grouped test series with clear progress, completion counts, and direct access to each test."
        icon={<Layers3 className="h-7 w-7" />}
      />

      {seriesList.length === 0 ? (
        <StudentEmptyState icon={<Layers3 className="mx-auto h-10 w-10 text-slate-900" />} title="No Test Series" description="No series available yet." />
      ) : (
        <div className="space-y-5">
          {seriesList.map((series) => {
            const pct = series.progress?.total > 0 ? Math.round((series.progress.completed / series.progress.total) * 100) : 0;
            return (
              <StudentSurface key={series.id} className="overflow-hidden">
                <div className="border-b border-slate-300/70 bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_36%,#334155_100%)] px-6 py-5 text-white">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100/80">Series progress</p>
                      <h3 className="mt-1 text-xl font-semibold">{series.name}</h3>
                      {series.description && <p className="mt-1 text-sm text-slate-200">{series.description}</p>}
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100/80">Completion</p>
                      <p className="text-2xl font-bold">{pct}%</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-[22px] border border-slate-200 bg-white/80 p-4 shadow-sm">
                      <div className="mb-2 flex text-blue-700"><CheckCircle2 className="h-4 w-4" /></div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Completed</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{series.progress?.completed || 0}</p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200 bg-white/80 p-4 shadow-sm">
                      <div className="mb-2 flex text-slate-700"><BookOpenCheck className="h-4 w-4" /></div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total Tests</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{series.progress?.total || 0}</p>
                    </div>
                    <div className="rounded-[22px] border border-slate-200 bg-white/80 p-4 shadow-sm">
                      <div className="mb-2 flex text-blue-700"><Trophy className="h-4 w-4" /></div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Score</p>
                      <p className="mt-2 text-2xl font-bold text-blue-700">
                        {series.progress?.completed > 0 ? `${series.progress.percentage}%` : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="h-3 w-full rounded-full bg-slate-200">
                      <div className="h-3 rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#0f172a_100%)] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    {series.progress?.completed > 0 && (
                      <p className="mt-2 text-xs text-slate-500">
                        Score: {series.progress.totalScore}/{series.progress.totalMarks} ({series.progress.percentage}%)
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {series.tests?.map((st: any, i: number) => (
                      <div
                        key={st.testId}
                        onClick={() => navigate(`/student/test/${st.testId}/pre-test`)}
                        className="group flex cursor-pointer items-center gap-3 rounded-[22px] border border-slate-200 bg-white/80 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                          {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition">{st.test?.title}</p>
                          <p className="text-xs text-slate-500">{st.test?.subject?.name}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">Take <ChevronRight className="h-3.5 w-3.5" /></span>
                      </div>
                    ))}
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
