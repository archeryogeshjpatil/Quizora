import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function ResultPage() {
  const { t } = useTranslation();
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state as any;

  if (!result) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-gray-500 mb-4">{t('result.resultPending')}</p>
        <button onClick={() => navigate('/student')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">{t('common.back')}</button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xl">
        {/* Header */}
        <div className={`p-8 text-center ${result.passed !== undefined ? (result.passed ? 'bg-gradient-to-r from-teal-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-orange-500') : 'bg-gradient-to-r from-teal-500 to-emerald-600'}`}>
          <div className="text-5xl font-bold mb-2 text-white">{result.percentage}%</div>
          <p className="text-lg text-white/80">
            {result.score} / {result.totalMarks} marks
          </p>
          {result.passed !== undefined && (
            <div className="mt-3">
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${result.passed ? 'bg-white/20 text-white' : 'bg-white/20 text-white'}`}>
                {result.passed ? t('result.passed') : t('result.failed')}
              </span>
              {result.passingPercentage && (
                <p className="text-sm mt-1 text-white/70">Passing: {result.passingPercentage}%</p>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 border-b border-slate-100">
          <div className="p-4 text-center border-r border-slate-100">
            <p className="text-2xl font-bold text-emerald-600">{result.correct}</p>
            <p className="text-xs text-slate-400">{t('result.correct')}</p>
          </div>
          <div className="p-4 text-center border-r border-slate-100">
            <p className="text-2xl font-bold text-red-500">{result.incorrect}</p>
            <p className="text-xs text-gray-500">{t('result.incorrect')}</p>
          </div>
          <div className="p-4 text-center border-r border-slate-100">
            <p className="text-2xl font-bold text-slate-400">{result.unattempted}</p>
            <p className="text-xs text-slate-400">{t('result.unattempted')}</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">{result.timeTaken ? formatTime(result.timeTaken) : '—'}</p>
            <p className="text-xs text-slate-400">{t('result.timeTaken')}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-4">
          <button
            onClick={() => navigate(`/student/test/${testId}/review?attemptId=${result.attemptId}`)}
            className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition shadow-sm"
          >
            {t('test.review')} Answers
          </button>
          <button
            onClick={() => navigate('/student')}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition"
          >
            {t('nav.dashboard')}
          </button>
        </div>

        {!result.showResult && (
          <div className="px-6 pb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
              {t('result.resultPending')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
