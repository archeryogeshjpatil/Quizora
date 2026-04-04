import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { testService } from '../../services/test.service';
import { subjectService } from '../../services/subject.service';
import { topicService } from '../../services/topic.service';
import { questionService } from '../../services/question.service';
import { Subject, Topic, Test, Question, QuestionType, Difficulty } from '../../types';
import { batchService } from '../../services/batch.service';
import { AdminEmptyState, AdminPageHeader, AdminSurface, adminButtonPrimary, adminButtonSecondary } from '../../components/common/AdminTheme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuestionUsageMap {
  [questionId: string]: { testId: string; testTitle: string }[];
}

interface TestForm {
  title: string;
  subjectId: string;
  topicId: string;
  type: 'OFFICIAL' | 'PRACTICE';
  instructions: string;
  isTimeBased: boolean;
  duration: number;
  autoSubmitOnTimeout: boolean;
  startDate: string;
  endDate: string;
  attemptLimit: number;
  marksPerQuestion: number;
  negativeMarking: boolean;
  negativeMarksValue: number;
  questionsPerPage: number;
  allowReview: boolean;
  tabSwitchPrevention: boolean;
  tabSwitchAction: string;
  maxTabSwitches: number;
  webcamProctoring: boolean;
  showResultImmediately: boolean;
  enableCertificate: boolean;
  passingPercentage: number;
}

interface AutoCreateForm {
  title: string;
  subjectId: string;
  topicId: string;
  type: 'OFFICIAL' | 'PRACTICE';
  numberOfQuestions: number;
  difficulty: Difficulty | 'MIXED';
  questionType: QuestionType | 'MIXED';
  duration: number;
  negativeMarking: boolean;
  negativeMarksValue: number;
  includeUsed: boolean;
}

const EMPTY_FORM: TestForm = {
  title: '',
  subjectId: '',
  topicId: '',
  type: 'OFFICIAL',
  instructions: '',
  isTimeBased: true,
  duration: 60,
  autoSubmitOnTimeout: true,
  startDate: '',
  endDate: '',
  attemptLimit: 1,
  marksPerQuestion: 1,
  negativeMarking: false,
  negativeMarksValue: 0,
  questionsPerPage: 1,
  allowReview: true,
  tabSwitchPrevention: false,
  tabSwitchAction: 'WARN',
  maxTabSwitches: 3,
  webcamProctoring: false,
  showResultImmediately: true,
  enableCertificate: false,
  passingPercentage: 60,
};

const EMPTY_AUTO: AutoCreateForm = {
  title: '',
  subjectId: '',
  topicId: '',
  type: 'OFFICIAL',
  numberOfQuestions: 10,
  difficulty: 'MIXED',
  questionType: 'MIXED',
  duration: 60,
  negativeMarking: false,
  negativeMarksValue: 0,
  includeUsed: false,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-700';
    case 'PUBLISHED':
      return 'bg-green-100 text-green-700';
    case 'ARCHIVED':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function typeBadgeClass(type: string): string {
  return type === 'OFFICIAL'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-purple-100 text-purple-700';
}

function difficultyBadgeClass(d: string): string {
  switch (d) {
    case 'SIMPLE':
      return 'bg-green-50 text-green-700';
    case 'MODERATE':
      return 'bg-yellow-50 text-yellow-700';
    case 'HARD':
      return 'bg-orange-50 text-orange-700';
    case 'VERY_HARD':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-50 text-gray-600';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TestsPage() {
  const { t } = useTranslation();

  // Data
  const [tests, setTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Batches
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);

  // Create form
  const [form, setForm] = useState<TestForm>({ ...EMPTY_FORM });
  const [formTopics, setFormTopics] = useState<Topic[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [questionUsage, setQuestionUsage] = useState<QuestionUsageMap>({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto create form
  const [autoForm, setAutoForm] = useState<AutoCreateForm>({ ...EMPTY_AUTO });
  const [autoTopics, setAutoTopics] = useState<Topic[]>([]);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoResult, setAutoResult] = useState<string>('');

  // Detail / edit
  const [detailTest, setDetailTest] = useState<Test | null>(null);
  const [detailQuestions, setDetailQuestions] = useState<Question[]>([]);
  const [detailForm, setDetailForm] = useState<TestForm>({ ...EMPTY_FORM });
  const [detailTopics, setDetailTopics] = useState<Topic[]>([]);
  const [detailAvailableQuestions, setDetailAvailableQuestions] = useState<Question[]>([]);
  const [detailSelectedIds, setDetailSelectedIds] = useState<string[]>([]);
  const [detailQuestionsLoading, setDetailQuestionsLoading] = useState(false);
  const [detailQuestionUsage, setDetailQuestionUsage] = useState<QuestionUsageMap>({});
  const [detailSaving, setDetailSaving] = useState(false);
  const [showAddQuestions, setShowAddQuestions] = useState(false);

  // ------ Data fetching ------

  const fetchTests = useCallback(async () => {
    try {
      const res = await testService.getAll();
      setTests(res.data);
    } catch {
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data);
    } catch {}
  }, []);

  const fetchBatches = useCallback(async () => {
    try { const res = await batchService.getAll(); setAllBatches(res.data); } catch {}
  }, []);

  useEffect(() => {
    fetchTests();
    fetchSubjects();
    fetchBatches();
  }, [fetchTests, fetchSubjects, fetchBatches]);

  // ------ Grouped tests: Subject > Topic ------

  const groupedTests = useMemo(() => {
    const subjectMap = new Map<string, { subject: Subject; general: Test[]; byTopic: Map<string, { topic: Topic; tests: Test[] }> }>();

    for (const test of tests) {
      const subjectId = test.subjectId;
      const subjectName = test.subject?.name || 'Unknown';

      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          subject: test.subject || { id: subjectId, name: subjectName },
          general: [],
          byTopic: new Map(),
        });
      }

      const group = subjectMap.get(subjectId)!;

      if (!test.topicId || !test.topic) {
        group.general.push(test);
      } else {
        if (!group.byTopic.has(test.topicId)) {
          group.byTopic.set(test.topicId, { topic: test.topic, tests: [] });
        }
        group.byTopic.get(test.topicId)!.tests.push(test);
      }
    }

    return Array.from(subjectMap.values());
  }, [tests]);

  // ------ Create Test modal logic ------

  const openCreateModal = () => {
    setForm({ ...EMPTY_FORM });
    setFormTopics([]);
    setAvailableQuestions([]);
    setSelectedQuestionIds([]);
    setSelectedBatchIds([]);
    setQuestionUsage({});
    setError('');
    setShowCreateModal(true);
  };

  useEffect(() => {
    if (!showCreateModal || !form.subjectId) {
      setFormTopics([]);
      setAvailableQuestions([]);
      setSelectedQuestionIds([]);
      return;
    }
    topicService.getBySubject(form.subjectId).then((res) => setFormTopics(res.data)).catch(() => {});
  }, [form.subjectId, showCreateModal]);

  // Auto-load questions when subject or topic changes in create modal
  useEffect(() => {
    if (showCreateModal && form.subjectId) {
      loadQuestions();
    }
  }, [form.subjectId, form.topicId, showCreateModal]);

  const loadQuestions = async () => {
    if (!form.subjectId) return;
    setQuestionsLoading(true);
    try {
      const params: Record<string, string> = { subjectId: form.subjectId, limit: '200' };
      if (form.topicId) params.topicId = form.topicId;
      const res = await questionService.getAll(params);
      const questions: Question[] = res.data.questions || res.data;
      setAvailableQuestions(questions);

      // Fetch usage info
      if (questions.length > 0) {
        try {
          const usageRes = await testService.getQuestionUsage(questions.map((q) => q.id));
          setQuestionUsage(usageRes.data || {});
        } catch {
          setQuestionUsage({});
        }
      }
    } catch {
      setAvailableQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Test title is required');
      return;
    }
    if (!form.subjectId) {
      setError('Subject is required');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      setError('Select at least one question');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const totalMarks = selectedQuestionIds.length * form.marksPerQuestion;
      await testService.create({
        ...form,
        topicId: form.topicId || null,
        totalMarks,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        attemptLimit: form.type === 'PRACTICE' ? null : form.attemptLimit,
        questionIds: selectedQuestionIds,
        batchIds: selectedBatchIds.length > 0 ? selectedBatchIds : undefined,
      });
      setShowCreateModal(false);
      fetchTests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create test');
    } finally {
      setSaving(false);
    }
  };

  // ------ Auto Create modal logic ------

  const openAutoModal = () => {
    setAutoForm({ ...EMPTY_AUTO });
    setAutoTopics([]);
    setAutoResult('');
    setError('');
    setShowAutoModal(true);
  };

  useEffect(() => {
    if (!showAutoModal || !autoForm.subjectId) {
      setAutoTopics([]);
      return;
    }
    topicService.getBySubject(autoForm.subjectId).then((res) => setAutoTopics(res.data)).catch(() => {});
  }, [autoForm.subjectId, showAutoModal]);

  const handleAutoCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoForm.title.trim() || !autoForm.subjectId) {
      setError('Title and subject are required');
      return;
    }
    setAutoSaving(true);
    setError('');
    setAutoResult('');
    try {
      const res = await testService.autoCreate({
        title: autoForm.title,
        subjectId: autoForm.subjectId,
        topicId: autoForm.topicId || null,
        type: autoForm.type,
        count: autoForm.numberOfQuestions,
        difficulty: autoForm.difficulty === 'MIXED' ? 'MIXED' : autoForm.difficulty,
        questionType: autoForm.questionType === 'MIXED' ? 'MIXED' : autoForm.questionType,
        includeUsedQuestions: autoForm.includeUsed,
        isTimeBased: true,
        duration: autoForm.duration,
        negativeMarking: autoForm.negativeMarking,
        negativeMarksValue: autoForm.negativeMarksValue,
        marksPerQuestion: 1,
        batchIds: selectedBatchIds.length > 0 ? selectedBatchIds : undefined,
      });
      const data = res.data;
      setAutoResult(data.message || `Test "${data.test?.title}" created successfully!`);
      fetchTests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to auto-create test');
    } finally {
      setAutoSaving(false);
    }
  };

  // ------ Detail / edit modal logic ------

  const openDetail = async (test: Test) => {
    setError('');
    setShowAddQuestions(false);
    setDetailAvailableQuestions([]);
    setDetailSelectedIds([]);
    setDetailQuestionUsage({});
    try {
      const res = await testService.getById(test.id);
      const full = res.data;
      setDetailTest(full);
      setDetailQuestions((full.questions || []).map((tq: any) => tq.question || tq));
      setDetailForm({
        title: full.title || '',
        subjectId: full.subjectId || '',
        topicId: full.topicId || '',
        type: full.type || 'OFFICIAL',
        instructions: full.instructions || '',
        isTimeBased: full.isTimeBased ?? true,
        duration: full.duration || 60,
        autoSubmitOnTimeout: full.autoSubmitOnTimeout ?? true,
        startDate: full.startDate ? full.startDate.slice(0, 16) : '',
        endDate: full.endDate ? full.endDate.slice(0, 16) : '',
        attemptLimit: full.attemptLimit || 1,
        marksPerQuestion: full.marksPerQuestion || 1,
        negativeMarking: full.negativeMarking ?? false,
        negativeMarksValue: full.negativeMarksValue || 0,
        questionsPerPage: full.questionsPerPage || 1,
        allowReview: full.allowReview ?? true,
        tabSwitchPrevention: full.tabSwitchPrevention ?? false,
        tabSwitchAction: 'WARN',
        maxTabSwitches: 3,
        webcamProctoring: full.webcamProctoring ?? false,
        showResultImmediately: full.showResultImmediately ?? true,
        enableCertificate: full.enableCertificate ?? false,
        passingPercentage: full.passingPercentage || 60,
      });
      // Load topics for subject
      if (full.subjectId) {
        topicService.getBySubject(full.subjectId).then((r) => setDetailTopics(r.data)).catch(() => {});
      }
      setShowDetailModal(true);
    } catch {
      setError('Failed to load test details');
    }
  };

  useEffect(() => {
    if (!showDetailModal || !detailForm.subjectId) return;
    topicService.getBySubject(detailForm.subjectId).then((r) => setDetailTopics(r.data)).catch(() => {});
  }, [detailForm.subjectId, showDetailModal]);

  const loadDetailAvailableQuestions = async () => {
    if (!detailForm.subjectId) return;
    setDetailQuestionsLoading(true);
    try {
      const params: Record<string, string> = { subjectId: detailForm.subjectId, limit: '200' };
      if (detailForm.topicId) params.topicId = detailForm.topicId;
      const res = await questionService.getAll(params);
      const questions: Question[] = res.data.questions || res.data;
      // Exclude questions already in the test
      const existingIds = new Set(detailQuestions.map((q) => q.id));
      const filtered = questions.filter((q) => !existingIds.has(q.id));
      setDetailAvailableQuestions(filtered);

      if (filtered.length > 0) {
        try {
          const usageRes = await testService.getQuestionUsage(filtered.map((q) => q.id));
          setDetailQuestionUsage(usageRes.data || {});
        } catch {
          setDetailQuestionUsage({});
        }
      }
    } catch {
      setDetailAvailableQuestions([]);
    } finally {
      setDetailQuestionsLoading(false);
    }
  };

  const handleDetailSave = async () => {
    if (!detailTest) return;
    setDetailSaving(true);
    setError('');
    try {
      const questionIds = detailQuestions.map((q) => q.id);
      const totalMarks = questionIds.length * detailForm.marksPerQuestion;
      await testService.update(detailTest.id, {
        ...detailForm,
        topicId: detailForm.topicId || null,
        totalMarks,
        startDate: detailForm.startDate || null,
        endDate: detailForm.endDate || null,
        attemptLimit: detailForm.type === 'PRACTICE' ? null : detailForm.attemptLimit,
        questionIds,
      });
      setShowDetailModal(false);
      fetchTests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update test');
    } finally {
      setDetailSaving(false);
    }
  };

  const handleStatusChange = async (status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    if (!detailTest) return;
    try {
      await testService.update(detailTest.id, { status });
      setDetailTest({ ...detailTest, status });
      fetchTests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const removeQuestionFromDetail = (qId: string) => {
    setDetailQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const addSelectedToDetail = () => {
    const toAdd = detailAvailableQuestions.filter((q) => detailSelectedIds.includes(q.id));
    setDetailQuestions((prev) => [...prev, ...toAdd]);
    setDetailAvailableQuestions((prev) => prev.filter((q) => !detailSelectedIds.includes(q.id)));
    setDetailSelectedIds([]);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) return;
    try {
      await testService.remove(id);
      if (showDetailModal && detailTest?.id === id) setShowDetailModal(false);
      fetchTests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete test');
    }
  };

  // ------ Render helpers ------

  const renderTestCard = (test: Test) => (
    <div
      key={test.id}
      onClick={() => openDetail(test)}
      className="cursor-pointer group rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#f0fdfa_0%,#ffffff_45%,#eff6ff_100%)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{test.title}</h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeBadgeClass(test.type)}`}>
              {t(`test.${test.type.toLowerCase()}`)}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusBadgeClass(test.status)}`}>
              {test.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
            <span>{test._count?.questions || 0} questions</span>
            <span>{test.totalMarks} marks</span>
            {test.isTimeBased && <span>{test.duration} min</span>}
            {test.startDate && (
              <span>{formatDate(test.startDate)} - {formatDate(test.endDate)}</span>
            )}
          </div>
          {(test as any).batches?.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className="text-[10px] text-gray-400">Batches:</span>
              {(test as any).batches.map((bt: any) => (
                <span key={bt.batch?.id || bt.batchId} className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{bt.batch?.name || 'Batch'}</span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={(e) => handleDelete(test.id, e)}
          className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition p-1"
          title="Delete test"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderFormFields = (
    f: TestForm,
    setF: (v: TestForm) => void,
    topics: Topic[]
  ) => (
    <>
      {/* Basic Details */}
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Basic Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('test.title')} *</label>
            <input
              type="text"
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('test.subject')} *</label>
            <select
              value={f.subjectId}
              onChange={(e) => setF({ ...f, subjectId: e.target.value, topicId: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              required
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <select
              value={f.topicId}
              onChange={(e) => setF({ ...f, topicId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              disabled={!f.subjectId}
            >
              <option value="">All topics (General)</option>
              {topics.map((tp) => (
                <option key={tp.id} value={tp.id}>{tp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('test.type')}</label>
            <select
              value={f.type}
              onChange={(e) => setF({ ...f, type: e.target.value as 'OFFICIAL' | 'PRACTICE' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="OFFICIAL">{t('test.official')}</option>
              <option value="PRACTICE">{t('test.practice')}</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('test.instructions')}</label>
            <textarea
              value={f.instructions}
              onChange={(e) => setF({ ...f, instructions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Timing & Scheduling */}
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Timing & Scheduling</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm col-span-2">
            <input
              type="checkbox"
              checked={f.isTimeBased}
              onChange={(e) => setF({ ...f, isTimeBased: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Time-based test
          </label>
          {f.isTimeBased && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('test.duration')} ({t('test.minutes')})</label>
                <input
                  type="number"
                  value={f.duration}
                  onChange={(e) => setF({ ...f, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min={1}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.autoSubmitOnTimeout}
                  onChange={(e) => setF({ ...f, autoSubmitOnTimeout: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Auto-submit on timeout
              </label>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={f.startDate}
              onChange={(e) => setF({ ...f, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="datetime-local"
              value={f.endDate}
              onChange={(e) => setF({ ...f, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Marking Scheme */}
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Marking Scheme</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('test.marksPerQuestion')}</label>
            <input
              type="number"
              value={f.marksPerQuestion}
              onChange={(e) => setF({ ...f, marksPerQuestion: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min={0}
              step={0.25}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={f.negativeMarking}
              onChange={(e) => setF({ ...f, negativeMarking: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {t('test.negativeMarking')}
          </label>
          {f.negativeMarking && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Negative Marks</label>
              <input
                type="number"
                value={f.negativeMarksValue}
                onChange={(e) => setF({ ...f, negativeMarksValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min={0}
                step={0.25}
              />
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Settings</h3>
        <div className="grid grid-cols-2 gap-3">
          {f.type === 'OFFICIAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
              <input
                type="number"
                value={f.attemptLimit}
                onChange={(e) => setF({ ...f, attemptLimit: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min={1}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Questions per page</label>
            <input
              type="number"
              value={f.questionsPerPage}
              onChange={(e) => setF({ ...f, questionsPerPage: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min={1}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.allowReview} onChange={(e) => setF({ ...f, allowReview: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Allow review/revisit
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.showResultImmediately} onChange={(e) => setF({ ...f, showResultImmediately: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Show result immediately
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.tabSwitchPrevention} onChange={(e) => setF({ ...f, tabSwitchPrevention: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Tab-switch prevention
          </label>
          {f.type === 'OFFICIAL' && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.webcamProctoring} onChange={(e) => setF({ ...f, webcamProctoring: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Webcam proctoring
            </label>
          )}
          {f.type === 'OFFICIAL' && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={f.enableCertificate} onChange={(e) => setF({ ...f, enableCertificate: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Enable certificate
              </label>
              {f.enableCertificate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing %</label>
                  <input
                    type="number"
                    value={f.passingPercentage}
                    onChange={(e) => setF({ ...f, passingPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min={0}
                    max={100}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  const renderQuestionRow = (
    q: Question,
    selected: boolean,
    onToggle: () => void,
    usage?: QuestionUsageMap
  ) => (
    <label
      key={q.id}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer"
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
      />
      <span className="text-sm flex-1 min-w-0 truncate text-gray-800">
        {stripHtml(q.text).slice(0, 120)}
      </span>
      <div className="flex items-center gap-2 flex-shrink-0">
        {usage && usage[q.id] && usage[q.id].length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium whitespace-nowrap" title={usage[q.id].map((u) => u.testTitle).join(', ')}>
            Used in {usage[q.id].length} test{usage[q.id].length > 1 ? 's' : ''}
          </span>
        )}
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{q.type}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${difficultyBadgeClass(q.difficulty)}`}>{q.difficulty}</span>
      </div>
    </label>
  );

  // ------ Main render ------

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <AdminPageHeader
        eyebrow="Assessment builder"
        title={t('nav.tests')}
        description="Create manual or auto-generated tests, organize them by subject and topic, and manage publication state."
        actions={<div className="flex flex-wrap gap-2">
          <button
            onClick={openAutoModal}
            className={adminButtonSecondary}
          >
            Auto Create Test
          </button>
          <button
            onClick={openCreateModal}
            className={adminButtonPrimary}
          >
            + Create Test
          </button>
        </div>}
      />

      {error && !showCreateModal && !showAutoModal && !showDetailModal && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {/* Test listing grouped by Subject > Topic */}
      {tests.length === 0 ? (
        <AdminEmptyState title={t('common.noData')} description="Create your first test to get started." icon="📝" />
      ) : (
        <div className="space-y-6">
          {groupedTests.map((group) => (
            <AdminSurface key={group.subject.id} className="overflow-hidden" tinted>
              {/* Subject header */}
              <div className="px-5 py-3 bg-gray-50 border-b">
                <h2 className="text-sm font-semibold text-gray-800">{group.subject.name}</h2>
              </div>

              <div className="p-4 space-y-4">
                {/* General tests (no topic) */}
                {group.general.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">General</h3>
                    <div className="grid gap-2">
                      {group.general.map(renderTestCard)}
                    </div>
                  </div>
                )}

                {/* Topic groups */}
                {Array.from(group.byTopic.values()).map((topicGroup) => (
                  <div key={topicGroup.topic.id}>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-1">
                      {topicGroup.topic.name}
                    </h3>
                    <div className="grid gap-2">
                      {topicGroup.tests.map(renderTestCard)}
                    </div>
                  </div>
                ))}
              </div>
            </AdminSurface>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* CREATE TEST MODAL                                            */}
      {/* ============================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-xl shadow-2xl w-full mx-4 my-4" style={{ maxWidth: '90vw' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Create Test</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="px-6 py-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                {renderFormFields(form, setForm, formTopics)}

                {/* Batch Assignment (Optional) */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Assign to Batch (optional)
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">Students can only see tests assigned to their batch. If no batch is selected, the test won't be visible to any student.</p>
                  <div className="flex flex-wrap gap-2">
                    {allBatches.map((batch: any) => (
                      <label key={batch.id} className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm cursor-pointer transition ${
                        selectedBatchIds.includes(batch.id) ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedBatchIds.includes(batch.id)}
                          onChange={() => setSelectedBatchIds(selectedBatchIds.includes(batch.id) ? selectedBatchIds.filter((id) => id !== batch.id) : [...selectedBatchIds, batch.id])}
                          className="rounded"
                        />
                        {batch.name}
                        <span className="text-xs text-gray-400">({batch._count?.students || 0})</span>
                      </label>
                    ))}
                    {allBatches.length === 0 && <p className="text-xs text-gray-400">No batches created. Create batches in Batches section first.</p>}
                  </div>
                </div>

                {/* Question Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Questions ({selectedQuestionIds.length} of {availableQuestions.length} selected)
                    </h3>
                    <div className="flex gap-2">
                      {availableQuestions.length > 0 && (
                        <>
                          <button type="button" onClick={() => setSelectedQuestionIds(availableQuestions.map((q) => q.id))} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Select All</button>
                          <button type="button" onClick={() => setSelectedQuestionIds([])} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Deselect All</button>
                        </>
                      )}
                      <button type="button" onClick={loadQuestions} disabled={!form.subjectId || questionsLoading} className="text-xs text-green-600 hover:text-green-800 font-medium disabled:text-gray-400">
                        {questionsLoading ? 'Loading...' : 'Refresh'}
                      </button>
                    </div>
                  </div>

                  {!form.subjectId && (
                    <p className="text-sm text-gray-400">Select a subject first to load questions.</p>
                  )}

                  {questionsLoading && (
                    <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
                  )}

                  {form.subjectId && availableQuestions.length === 0 && !questionsLoading && (
                    <p className="text-sm text-gray-400">
                      No questions found for this subject/topic. Create questions first.
                    </p>
                  )}

                  {availableQuestions.length > 0 && (
                    <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto">
                      {availableQuestions.map((q) =>
                        renderQuestionRow(
                          q,
                          selectedQuestionIds.includes(q.id),
                          () => toggleQuestion(q.id),
                          questionUsage
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? t('app.loading') : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* AUTO CREATE TEST MODAL                                       */}
      {/* ============================================================ */}
      {showAutoModal && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Auto Create Test</h2>
              <button onClick={() => setShowAutoModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAutoCreate}>
              <div className="px-6 py-4 space-y-4">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                {autoResult && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium">{autoResult}</div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={autoForm.title}
                    onChange={(e) => setAutoForm({ ...autoForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <select
                      value={autoForm.subjectId}
                      onChange={(e) => setAutoForm({ ...autoForm, subjectId: e.target.value, topicId: '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                      required
                    >
                      <option value="">Select subject</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <select
                      value={autoForm.topicId}
                      onChange={(e) => setAutoForm({ ...autoForm, topicId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                      disabled={!autoForm.subjectId}
                    >
                      <option value="">Any topic</option>
                      {autoTopics.map((tp) => (
                        <option key={tp.id} value={tp.id}>{tp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                    <select
                      value={autoForm.type}
                      onChange={(e) => setAutoForm({ ...autoForm, type: e.target.value as 'OFFICIAL' | 'PRACTICE' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="OFFICIAL">Official</option>
                      <option value="PRACTICE">Practice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions *</label>
                    <input
                      type="number"
                      value={autoForm.numberOfQuestions}
                      onChange={(e) => setAutoForm({ ...autoForm, numberOfQuestions: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min={1}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={autoForm.difficulty}
                      onChange={(e) => setAutoForm({ ...autoForm, difficulty: e.target.value as Difficulty | 'MIXED' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="MIXED">Mixed</option>
                      <option value="SIMPLE">Simple</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="HARD">Hard</option>
                      <option value="VERY_HARD">Very Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                    <select
                      value={autoForm.questionType}
                      onChange={(e) => setAutoForm({ ...autoForm, questionType: e.target.value as QuestionType | 'MIXED' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="MIXED">Mixed</option>
                      <option value="MCQ">MCQ</option>
                      <option value="MSQ">MSQ</option>
                      <option value="TRUE_FALSE">True/False</option>
                      <option value="MATCHING">Matching</option>
                      <option value="ASSERTION_REASONING">Assertion & Reasoning</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={autoForm.duration}
                      onChange={(e) => setAutoForm({ ...autoForm, duration: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min={1}
                    />
                  </div>
                  <div className="space-y-2 pt-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={autoForm.negativeMarking}
                        onChange={(e) => setAutoForm({ ...autoForm, negativeMarking: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Negative Marking
                    </label>
                  </div>
                </div>

                {autoForm.negativeMarking && (
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Negative Marks Value</label>
                    <input
                      type="number"
                      value={autoForm.negativeMarksValue}
                      onChange={(e) => setAutoForm({ ...autoForm, negativeMarksValue: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min={0}
                      step={0.25}
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={autoForm.includeUsed}
                    onChange={(e) => setAutoForm({ ...autoForm, includeUsed: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Include questions already used in other tests
                </label>

                {/* Batch Assignment */}
                {allBatches.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Batch (optional)</label>
                    <div className="flex flex-wrap gap-2">
                      {allBatches.map((batch: any) => (
                        <label key={batch.id} className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs cursor-pointer transition ${
                          selectedBatchIds.includes(batch.id) ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-600'
                        }`}>
                          <input type="checkbox" checked={selectedBatchIds.includes(batch.id)} onChange={() => setSelectedBatchIds(selectedBatchIds.includes(batch.id) ? selectedBatchIds.filter((id) => id !== batch.id) : [...selectedBatchIds, batch.id])} className="rounded" />
                          {batch.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end px-6 py-4 border-t bg-gray-50 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setShowAutoModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={autoSaving}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {autoSaving ? t('app.loading') : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TEST DETAIL / EDIT MODAL                                     */}
      {/* ============================================================ */}
      {showDetailModal && detailTest && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-4">
          <div className="bg-white rounded-xl shadow-2xl w-full mx-4 my-4" style={{ maxWidth: '90vw' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Edit Test</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeClass(detailTest.status)}`}>
                  {detailTest.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Status change buttons */}
                {detailTest.status !== 'PUBLISHED' && (
                  <button
                    onClick={() => handleStatusChange('PUBLISHED')}
                    className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Publish
                  </button>
                )}
                {detailTest.status !== 'DRAFT' && (
                  <button
                    onClick={() => handleStatusChange('DRAFT')}
                    className="text-xs px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Draft
                  </button>
                )}
                {detailTest.status !== 'ARCHIVED' && (
                  <button
                    onClick={() => handleStatusChange('ARCHIVED')}
                    className="text-xs px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(detailTest.id, e)}
                  className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 ml-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex divide-x divide-gray-200 max-h-[calc(100vh-200px)]">
              {/* Left: form fields */}
              <div className="w-1/2 px-6 py-4 space-y-4 overflow-y-auto">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
                {renderFormFields(detailForm, setDetailForm, detailTopics)}
              </div>

              {/* Right: questions */}
              <div className="w-1/2 px-6 py-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Questions ({detailQuestions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddQuestions(!showAddQuestions);
                      if (!showAddQuestions) loadDetailAvailableQuestions();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showAddQuestions ? 'Hide' : '+ Add Questions'}
                  </button>
                </div>

                {/* Current questions list */}
                {detailQuestions.length === 0 ? (
                  <p className="text-sm text-gray-400 mb-4">No questions in this test.</p>
                ) : (
                  <div className="border border-gray-200 rounded-lg mb-4 max-h-60 overflow-y-auto">
                    {detailQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-0 group"
                      >
                        <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">{idx + 1}.</span>
                        <span className="text-sm flex-1 min-w-0 truncate text-gray-800">
                          {stripHtml(q.text).slice(0, 80)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 flex-shrink-0">{q.type}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${difficultyBadgeClass(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        <button
                          onClick={() => removeQuestionFromDetail(q.id)}
                          className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                          title="Remove question"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add questions section */}
                {showAddQuestions && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-gray-600">Available Questions</h4>
                      {detailSelectedIds.length > 0 && (
                        <button
                          onClick={addSelectedToDetail}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Add {detailSelectedIds.length} Selected
                        </button>
                      )}
                    </div>

                    {detailQuestionsLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                      </div>
                    ) : detailAvailableQuestions.length === 0 ? (
                      <p className="text-xs text-gray-400">No additional questions available for this subject/topic.</p>
                    ) : (
                      <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                        {detailAvailableQuestions.map((q) =>
                          renderQuestionRow(
                            q,
                            detailSelectedIds.includes(q.id),
                            () =>
                              setDetailSelectedIds((prev) =>
                                prev.includes(q.id) ? prev.filter((x) => x !== q.id) : [...prev, q.id]
                              ),
                            detailQuestionUsage
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 justify-end px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDetailSave}
                disabled={detailSaving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {detailSaving ? t('app.loading') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
