import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { testService } from '../../services/test.service';
import { aiService } from '../../services/ai.service';

interface ReviewQuestion {
  questionId: string;
  text: string;
  type: string;
  difficulty: string;
  marks: number;
  options: { id: string; label: string; text: string }[];
  correctAnswers: string[];
  studentAnswer: string | null;
  isCorrect: boolean;
  explanation?: string;
}

interface ReviewPayload {
  test: { title: string; subject: string };
  score: number;
  totalMarks: number;
  percentage: number;
  timeTaken?: number;
  review: ReviewQuestion[];
}

export function ReviewPage() {
  const { t } = useTranslation();
  const { testId } = useParams<{ testId: string }>();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const navigate = useNavigate();

  const [review, setReview] = useState<ReviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // AI Assist
  const [aiModal, setAiModal] = useState<{ questionIndex: number; provider: string } | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!testId || !attemptId) {
      setError('Review link is incomplete');
      setLoading(false);
      return;
    }

    testService.getReview(testId, attemptId)
      .then((res) => {
        const data = res.data;
        if (!data || !Array.isArray(data.review) || !data.test) {
          setError('Review data is not available');
          return;
        }
        setReview(data);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load review'))
      .finally(() => setLoading(false));
  }, [testId, attemptId]);

  const handleAskAI = async (questionIndex: number, provider: string) => {
    if (!review?.review?.[questionIndex]) {
      return;
    }
    const q = review.review[questionIndex];
    setAiModal({ questionIndex, provider });
    setAiResponse('');
    setAiLoading(true);

    const data = {
      questionText: q.text.replace(/<[^>]*>/g, ''),
      studentAnswer: q.studentAnswer || 'Not attempted',
      correctAnswer: q.correctAnswers.join(', '),
    };

    try {
      let res;
      // Use Groq for all providers since it's the only one configured
      // In production, each would call its own API
      switch (provider) {
        case 'claude': res = await aiService.askClaude(data); break;
        case 'chatgpt': res = await aiService.askChatGPT(data); break;
        case 'gemini': res = await aiService.askGemini(data); break;
        case 'grok': res = await aiService.askGrok(data); break;
        default: res = await aiService.askClaude(data);
      }
      setAiResponse(res.data.response);
    } catch {
      setAiResponse('Failed to get AI response. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  }

  if (error || !review || !Array.isArray(review.review)) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-red-500 mb-4">{error || 'Review not available'}</p>
        <button onClick={() => navigate('/student')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">{t('common.back')}</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{review.test.title} — {t('test.review')}</h1>
            <p className="text-sm text-gray-500">{review.test.subject}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{review.score}/{review.totalMarks}</p>
            <p className="text-sm text-gray-500">{review.percentage}%</p>
          </div>
        </div>
      </div>

      {/* Bookmark Filter */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
          className={`px-4 py-2 text-sm rounded-lg border transition font-medium ${
            showBookmarkedOnly
              ? 'bg-purple-100 border-purple-300 text-purple-700'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {showBookmarkedOnly ? `Showing ${bookmarkedIds.size} Bookmarked` : 'Show Bookmarked Only'}
        </button>
        <span className="text-xs text-gray-400">{bookmarkedIds.size} bookmarked</span>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {review.review
          .filter((_q: ReviewQuestion, i: number) => !showBookmarkedOnly || bookmarkedIds.has(String(i)))
          .map((q: ReviewQuestion, index: number) => (
          <div key={q.questionId} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${q.isCorrect ? 'border-l-4 border-l-green-500' : q.studentAnswer ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-gray-300'}`}>
            <div className="p-6">
              {/* Question header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${q.isCorrect ? 'bg-green-100 text-green-700' : q.studentAnswer ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    Q{index + 1}
                  </span>
                  <span className="text-xs text-gray-400">{q.type} • {q.marks} marks • {q.difficulty}</span>
                </div>
                <span className={`text-sm font-medium ${q.isCorrect ? 'text-green-600' : q.studentAnswer ? 'text-red-600' : 'text-gray-400'}`}>
                  {q.isCorrect ? t('result.correct') : q.studentAnswer ? t('result.incorrect') : t('result.unattempted')}
                </span>
              </div>

              {/* Question text */}
              <div className="text-gray-900 mb-4" dangerouslySetInnerHTML={{ __html: q.text }} />

              {/* Options */}
              <div className="space-y-2 mb-4">
                {q.options.map((opt) => {
                  const isCorrectOpt = q.correctAnswers.includes(opt.label);
                  const isStudentChoice = q.studentAnswer?.split(',').includes(opt.label);
                  let cls = 'border-gray-200 bg-white text-gray-700';
                  if (isCorrectOpt) cls = 'border-green-300 bg-green-50 text-green-800';
                  if (isStudentChoice && !isCorrectOpt) cls = 'border-red-300 bg-red-50 text-red-800';

                  return (
                    <div key={opt.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${cls}`}>
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCorrectOpt ? 'bg-green-500 text-white' : isStudentChoice ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {opt.label}
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                      {isCorrectOpt && <span className="ml-auto text-xs text-green-600 font-medium">{t('result.correctAnswer')}</span>}
                      {isStudentChoice && !isCorrectOpt && <span className="ml-auto text-xs text-red-600 font-medium">{t('result.yourAnswer')}</span>}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-blue-700 mb-1">{t('result.explanation')}</p>
                  <p className="text-sm text-blue-900">{q.explanation}</p>
                </div>
              )}

              {/* Bookmark + AI Assist */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setBookmarkedIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(String(index))) next.delete(String(index));
                    else next.add(String(index));
                    return next;
                  })}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                    bookmarkedIds.has(String(index))
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-purple-50'
                  }`}
                >
                  {bookmarkedIds.has(String(index)) ? 'Bookmarked' : 'Bookmark'}
                </button>
                <span className="text-xs text-gray-300 mx-1">|</span>
                <span className="text-xs text-gray-400 mr-1">Ask AI:</span>
                {[
                  { key: 'claude', label: t('ai.askClaude'), color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
                  { key: 'chatgpt', label: t('ai.askChatGPT'), color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                  { key: 'gemini', label: t('ai.askGemini'), color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
                  { key: 'grok', label: t('ai.askGrok'), color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
                ].map((ai) => (
                  <button
                    key={ai.key}
                    onClick={() => handleAskAI(index, ai.key)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${ai.color}`}
                  >
                    {ai.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button onClick={() => navigate('/student')} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          {t('nav.dashboard')}
        </button>
      </div>

      {/* AI Response Modal */}
      {aiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                AI Explanation — {aiModal.provider.charAt(0).toUpperCase() + aiModal.provider.slice(1)}
              </h3>
              <button onClick={() => setAiModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            {aiLoading ? (
              <div className="flex items-center gap-3 py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                <span className="text-sm text-gray-600">{t('ai.loading')}</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
