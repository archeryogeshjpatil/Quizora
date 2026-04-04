import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { testService } from '../../services/test.service';

interface ExamQuestion {
  id: string;
  orderIndex: number;
  question: {
    id: string;
    text: string;
    type: string;
    difficulty: string;
    marks: number;
    imageUrl?: string;
    options: { id: string; label: string; text: string }[];
  };
}

export function ExamPage() {
  const { t } = useTranslation();
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    attemptId: string;
    questions: ExamQuestion[];
    testConfig: any;
  } | null;

  const [attemptId] = useState(state?.attemptId || '');
  const [questions] = useState<ExamQuestion[]>(state?.questions || []);
  const [config] = useState(state?.testConfig || {});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(config.isTimeBased ? (config.duration || 30) * 60 : 0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Redirect if no state
  useEffect(() => {
    if (!state) navigate('/student', { replace: true });
  }, [state]);

  // Timer
  useEffect(() => {
    if (!config.isTimeBased || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (config.autoSubmitOnTimeout) handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [config.isTimeBased]);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveTimer.current = setInterval(async () => {
      if (testId && attemptId && Object.keys(responses).length > 0) {
        try {
          await testService.autoSave(testId, { attemptId, responses });
          setAutoSaveStatus('Saved');
          setTimeout(() => setAutoSaveStatus(''), 2000);
        } catch {}
      }
    }, 30000);
    return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current); };
  }, [responses, testId, attemptId]);

  // Tab switch detection
  useEffect(() => {
    if (!config.tabSwitchPrevention) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          if (config.tabSwitchAction === 'AUTO_SUBMIT' && config.maxTabSwitches && next >= config.maxTabSwitches) {
            handleSubmit(true);
          }
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [config]);

  const handleSelectOption = (questionId: string, label: string) => {
    const q = questions[currentIndex]?.question;
    if (!q) return;

    if (q.type === 'MSQ') {
      const current = responses[questionId] ? responses[questionId].split(',') : [];
      const updated = current.includes(label)
        ? current.filter((l) => l !== label)
        : [...current, label];
      setResponses({ ...responses, [questionId]: updated.join(',') });
    } else {
      setResponses({ ...responses, [questionId]: label });
    }
  };

  const toggleBookmark = (questionId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    if (!auto && !showConfirm) { setShowConfirm(true); return; }
    setSubmitting(true);
    setShowConfirm(false);
    try {
      const res = await testService.submitTest(testId!, { attemptId, responses });
      navigate(`/student/test/${testId}/result`, { state: res.data, replace: true });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit');
      setSubmitting(false);
    }
  }, [submitting, showConfirm, testId, attemptId, responses, navigate]);

  if (!state || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const qId = currentQ.question.id;
  const selectedLabels = responses[qId] ? responses[qId].split(',') : [];
  const answeredCount = Object.keys(responses).length;
  const totalQ = questions.length;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getNavStatus = (q: ExamQuestion) => {
    const answered = !!responses[q.question.id];
    const bookmarked = bookmarks.has(q.question.id);
    if (bookmarked && answered) return 'bg-purple-500 text-white';
    if (bookmarked) return 'bg-purple-200 text-purple-800';
    if (answered) return 'bg-green-500 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-semibold text-gray-900">{config.title}</h1>
          <p className="text-xs text-gray-500">
            {t('test.question')} {currentIndex + 1} {t('test.of')} {totalQ}
            {autoSaveStatus && <span className="ml-2 text-green-600">• {autoSaveStatus}</span>}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {tabSwitchCount > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Tab switches: {tabSwitchCount}</span>
          )}
          {config.isTimeBased && (
            <div className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : timeLeft < 300 ? 'text-orange-600' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </div>
          )}
          <button onClick={() => handleSubmit(false)} disabled={submitting} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50">
            {t('test.submitTest')}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Question Area */}
        <main className="flex-1 p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {/* Question header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">Q{currentIndex + 1}</span>
                <span className="text-xs text-gray-400">{currentQ.question.type} • {currentQ.question.marks} marks</span>
              </div>
              <button
                onClick={() => toggleBookmark(qId)}
                className={`text-sm px-3 py-1 rounded-full border transition ${
                  bookmarks.has(qId)
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'border-gray-300 text-gray-500 hover:border-purple-300'
                }`}
              >
                {bookmarks.has(qId) ? 'Bookmarked' : t('test.bookmark')}
              </button>
            </div>

            {/* Question text */}
            <div className="text-gray-900 text-lg mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQ.question.text }} />

            {currentQ.question.imageUrl && (
              <img src={currentQ.question.imageUrl} alt="Question" className="max-w-md mb-6 rounded-lg border" />
            )}

            {/* Options */}
            <div className="space-y-3">
              {currentQ.question.options.map((opt) => {
                const isSelected = selectedLabels.includes(opt.label);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(qId, opt.label)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition flex items-center gap-4 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {opt.label}
                    </span>
                    <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                  </button>
                );
              })}
            </div>

            {currentQ.question.type === 'MSQ' && (
              <p className="text-xs text-gray-400 mt-3">Select all correct answers</p>
            )}

            {/* Clear response */}
            {responses[qId] && (
              <button
                onClick={() => {
                  const updated = { ...responses };
                  delete updated[qId];
                  setResponses(updated);
                }}
                className="mt-4 text-sm text-red-500 hover:text-red-700"
              >
                Clear response
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-6 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-30 font-medium"
            >
              {t('test.previous')}
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(totalQ - 1, currentIndex + 1))}
              disabled={currentIndex === totalQ - 1}
              className="px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-30 font-medium"
            >
              {t('test.next')}
            </button>
          </div>
        </main>

        {/* Question Navigator Sidebar */}
        <aside className="w-56 bg-white border-l p-4 hidden lg:block">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Questions</h3>
            <span className="text-xs text-gray-400">{answeredCount}/{totalQ}</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => (
              <button
                key={q.question.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition ${
                  i === currentIndex ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                } ${getNavStatus(q)}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500" /> Answered</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gray-200" /> Not answered</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-purple-500" /> Bookmarked</div>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-3">{t('test.submitTest')}</h2>
            <p className="text-sm text-gray-600 mb-2">{t('test.confirmSubmit')}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-green-600">{answeredCount}</p>
                <p className="text-xs text-gray-500">Answered</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-400">{totalQ - answeredCount}</p>
                <p className="text-xs text-gray-500">Unanswered</p>
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600">{bookmarks.size}</p>
                <p className="text-xs text-gray-500">Bookmarked</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                {t('common.cancel')}
              </button>
              <button onClick={() => handleSubmit(false)} disabled={submitting} className="flex-1 px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50">
                {submitting ? t('app.loading') : t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
