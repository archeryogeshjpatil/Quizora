import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BookOpenCheck, BriefcaseBusiness, LayoutDashboard, Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { testService } from '../../services/test.service';
import { Test } from '../../types';
import {
  StudentEmptyState,
  StudentPageHero,
  StudentSurface,
} from '../../components/common/StudentTheme';

function DashboardMetric({
  label,
  value,
  detail,
  icon,
  accentClass,
  valueClass,
}: {
  label: string;
  value: number;
  detail: string;
  icon: ReactNode;
  accentClass: string;
  valueClass: string;
}) {
  return (
    <StudentSurface className="h-full p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className={`mt-3 text-3xl font-bold tracking-tight ${valueClass}`}>{value}</p>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border text-xl shadow-[0_16px_30px_rgba(15,23,42,0.12)] ${accentClass}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
        <div className={`h-full rounded-full ${accentClass.split(' ')[0]}`} />
      </div>
    </StudentSurface>
  );
}

function DashboardSection({
  title,
  caption,
  indicatorClass,
  children,
}: {
  title: string;
  caption: string;
  indicatorClass: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full shadow-[0_0_0_6px_rgba(15,23,42,0.05)] ${indicatorClass}`} />
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{caption}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function TestCard({
  test,
  badge,
  badgeClass,
  icon,
  iconClass,
  metaClass,
  titleHoverClass,
  onClick,
}: {
  test: Test;
  badge: string;
  badgeClass: string;
  icon: ReactNode;
  iconClass: string;
  metaClass: string;
  titleHoverClass: string;
  onClick: () => void;
}) {
  return (
    <StudentSurface className="h-full">
      <button
        type="button"
        onClick={onClick}
        className="group block w-full p-5 text-left transition-transform hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border text-xl text-white shadow-[0_16px_32px_rgba(15,23,42,0.14)] ${iconClass}`}
              >
                {icon}
              </div>
              <div className="min-w-0">
                <h3
                  className={`line-clamp-2 text-base font-semibold text-slate-900 transition ${titleHoverClass}`}
                >
                  {test.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {test.subject?.name || 'No subject assigned'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5 text-xs text-slate-600">
              <span className={`rounded-full border px-3 py-1.5 ${metaClass}`}>
                {test._count?.questions || 0} questions
              </span>
              {typeof test.totalMarks === 'number' && (
                <span className={`rounded-full border px-3 py-1.5 ${metaClass}`}>
                  {test.totalMarks} marks
                </span>
              )}
              {typeof test.duration === 'number' && test.isTimeBased && (
                <span className={`rounded-full border px-3 py-1.5 ${metaClass}`}>
                  {test.duration} min
                </span>
              )}
              {badge === 'Practice' && (
                <span className={`rounded-full border px-3 py-1.5 ${metaClass}`}>
                  Unlimited attempts
                </span>
              )}
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${badgeClass}`}
          >
            {badge}
          </span>
        </div>
      </button>
    </StudentSurface>
  );
}

export function StudentDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testService
      .getAvailable()
      .then((res) => setTests(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const officialTests = tests.filter((test) => test.type === 'OFFICIAL');
  const practiceTests = tests.filter((test) => test.type === 'PRACTICE');

  return (
    <div className="animate-fade-in">
      <StudentPageHero
        eyebrow="Student dashboard"
        icon={<LayoutDashboard className="h-7 w-7" />}
        title={
          <>
            {t('dashboard.welcome')}, {user?.fullName}
          </>
        }
        description="Your workspace is ready with official exams, practice tracks, and quick stats so you can choose the right attempt with confidence."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DashboardMetric
          label={t('dashboard.availableTests')}
          value={officialTests.length}
          detail="Scheduled exam tracks"
          icon={<BookOpenCheck className="h-5 w-5" />}
          accentClass="bg-blue-600 border-blue-500/70 text-white"
          valueClass="text-blue-700"
        />
        <DashboardMetric
          label={t('dashboard.practiceTests')}
          value={practiceTests.length}
          detail="Skill-building retries"
          icon={<Sparkles className="h-5 w-5" />}
          accentClass="bg-slate-900 border-slate-700/80 text-white"
          valueClass="text-slate-900"
        />
        <DashboardMetric
          label="Total available"
          value={tests.length}
          detail="Ready in your batch"
          icon={<Trophy className="h-5 w-5" />}
          accentClass="bg-indigo-600 border-indigo-500/70 text-white"
          valueClass="text-indigo-700"
        />
      </div>

      {loading ? (
        <StudentSurface className="p-12">
          <div className="flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        </StudentSurface>
      ) : tests.length === 0 ? (
        <StudentEmptyState
          icon={<BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-900" />}
          title={t('test.noTestsAvailable')}
          description="No tests are assigned to your batch yet. New assessments will appear here as soon as they are published."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DashboardSection
            title={t('dashboard.availableTests')}
            caption="Official exam panel"
            indicatorClass="bg-blue-600"
          >
            <div className="grid grid-cols-1 gap-4">
              {officialTests.length > 0 ? (
                officialTests.map((test) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    badge="Official"
                    badgeClass="border-blue-200 bg-blue-50 text-blue-700"
                    icon={<BookOpenCheck className="h-5 w-5" />}
                    iconClass="border-blue-400/40 bg-gradient-to-br from-blue-500 to-indigo-700"
                    metaClass="border-blue-100 bg-blue-50/80 text-blue-700"
                    titleHoverClass="group-hover:text-blue-700"
                    onClick={() => navigate(`/student/test/${test.id}/pre-test`)}
                  />
                ))
              ) : (
                <StudentEmptyState
                  icon={<BookOpenCheck className="mx-auto h-10 w-10 text-slate-900" />}
                  title="No official tests"
                  description="Official exams will appear here once your faculty publishes them."
                />
              )}
            </div>
          </DashboardSection>

          <DashboardSection
            title={t('dashboard.practiceTests')}
            caption="Practice and revision"
            indicatorClass="bg-slate-900"
          >
            <div className="grid grid-cols-1 gap-4">
              {practiceTests.length > 0 ? (
                practiceTests.map((test) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    badge="Practice"
                    badgeClass="border-slate-300 bg-slate-900 text-white"
                    icon={<Sparkles className="h-5 w-5" />}
                    iconClass="border-slate-700/70 bg-gradient-to-br from-slate-800 to-blue-700"
                    metaClass="border-slate-200 bg-slate-50/90 text-slate-700"
                    titleHoverClass="group-hover:text-slate-700"
                    onClick={() => navigate(`/student/test/${test.id}/pre-test`)}
                  />
                ))
              ) : (
                <StudentEmptyState
                  icon={<Sparkles className="mx-auto h-10 w-10 text-slate-900" />}
                  title="No practice tests"
                  description="Practice sets will show up here so students can revise outside the official exam schedule."
                />
              )}
            </div>
          </DashboardSection>
        </div>
      )}
    </div>
  );
}
