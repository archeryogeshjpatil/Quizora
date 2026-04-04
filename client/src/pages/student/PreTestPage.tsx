import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { testService } from '../../services/test.service';

export function PreTestPage() {
  const { t } = useTranslation();
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (testId) {
      testService.getPreTestInfo(testId)
        .then((res) => setInfo(res.data))
        .catch((err) => setError(err.response?.data?.error || 'Failed to load test info'))
        .finally(() => setLoading(false));
    }
  }, [testId]);

  const handleStart = async () => {
    if (!testId) return;
    setStarting(true);
    setError('');
    try {
      const res = await testService.startTest(testId);
      // Navigate to exam engine with attempt data
      navigate(`/student/test/${testId}/exam`, {
        state: {
          attemptId: res.data.attemptId,
          questions: res.data.questions,
          testConfig: res.data.test,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start test');
      setStarting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500" /></div>;
  }

  if (!info) {
    return <div className="text-center py-20 text-red-500">{error || 'Test not found'}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <span className="text-3xl">📝</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{info.title}</h1>
          <p className="text-teal-100 mt-1">{info.subject?.name}</p>
        </div>

        <div className="p-8">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-teal-50 rounded-2xl p-4 text-center border border-teal-200/60">
            <p className="text-xs text-teal-600 font-medium">{t('test.totalQuestions')}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{info._count?.questions || 0}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-200/60">
            <p className="text-xs text-emerald-600 font-medium">{t('test.totalMarks')}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{info.totalMarks}</p>
          </div>
          {info.isTimeBased && (
            <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-200/60">
              <p className="text-xs text-amber-600 font-medium">{t('test.duration')}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{info.duration} {t('test.minutes')}</p>
            </div>
          )}
          <div className="bg-indigo-50 rounded-2xl p-4 text-center border border-indigo-200/60">
            <p className="text-xs text-indigo-600 font-medium">{t('test.attemptNumber')}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">#{info.attemptNumber}</p>
          </div>
        </div>

        {info.instructions && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-700 mb-2">{t('test.instructions')}</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: info.instructions }} />
          </div>
        )}

        {info.webcamProctoring && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-sm text-orange-700">
            {t('proctoring.webcamRequired')}
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <div className="flex gap-4">
          <button onClick={() => navigate('/student')} className="flex-1 px-4 py-3 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition font-medium text-slate-500">
            {t('common.back')}
          </button>
          <button onClick={handleStart} disabled={starting} className="flex-1 px-4 py-3 text-sm bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition font-semibold disabled:opacity-50 shadow-lg shadow-teal-500/25">
            {starting ? t('app.loading') : t('test.startTest')}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
