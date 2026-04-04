import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { questionService } from '../../services/question.service';
import { subjectService } from '../../services/subject.service';
import { topicService } from '../../services/topic.service';
import { testService } from '../../services/test.service';
import { Subject, Topic, Question, QuestionType, Difficulty, Test } from '../../types';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { AdminEmptyState, AdminPageHeader, AdminSurface, adminButtonPrimary, adminButtonSecondary, adminFilterClass } from '../../components/common/AdminTheme';

const QUESTION_TYPES: { value: QuestionType; labelKey: string }[] = [
  { value: 'MCQ', labelKey: 'question.mcq' },
  { value: 'MSQ', labelKey: 'question.msq' },
  { value: 'TRUE_FALSE', labelKey: 'question.trueFalse' },
  { value: 'MATCHING', labelKey: 'question.matching' },
  { value: 'ASSERTION_REASONING', labelKey: 'question.assertionReasoning' },
];

const DIFFICULTIES: { value: Difficulty; labelKey: string }[] = [
  { value: 'SIMPLE', labelKey: 'question.simple' },
  { value: 'MODERATE', labelKey: 'question.moderate' },
  { value: 'HARD', labelKey: 'question.hard' },
  { value: 'VERY_HARD', labelKey: 'question.veryHard' },
];

const AI_DIFFICULTY_OPTIONS = [
  ...DIFFICULTIES,
  { value: 'MIXED' as const, labelKey: 'question.mixed' },
];

const AI_QUESTION_TYPE_OPTIONS = [
  ...QUESTION_TYPES,
  { value: 'MIXED' as const, labelKey: 'question.mixedAllTypes' },
];

interface OptionForm {
  label: string;
  text: string;
}

interface AiGeneratedQuestion {
  question?: string;
  text?: string;
  type?: QuestionType;
  difficulty?: Difficulty;
  options?: { label: string; text: string }[];
  correctAnswers?: string[];
  explanation?: string;
  marks?: number;
  _status?: 'pending' | 'accepted' | 'rejected';
  _editing?: boolean;
}

export function QuestionsPage() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  // Filters
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterTopics, setFilterTopics] = useState<Topic[]>([]);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    subjectId: '',
    topicId: '',
    type: 'MCQ' as QuestionType,
    difficulty: 'MODERATE' as Difficulty,
    text: '',
    marks: 1,
    explanation: '',
  });
  const [formTopics, setFormTopics] = useState<Topic[]>([]);
  const [options, setOptions] = useState<OptionForm[]>([
    { label: 'A', text: '' },
    { label: 'B', text: '' },
    { label: 'C', text: '' },
    { label: 'D', text: '' },
  ]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);

  // AI Generate
  // Bulk Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSubjectId, setImportSubjectId] = useState('');
  const [importTopicId, setImportTopicId] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; total: number; errors: string[] } | null>(null);
  const [importTopics, setImportTopics] = useState<Topic[]>([]);

  // AI Generate
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTab, setAiTab] = useState<'file' | 'text'>('file');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiTopicText, setAiTopicText] = useState('');
  const [aiParams, setAiParams] = useState({
    subjectId: '',
    count: 5,
    types: ['MCQ'] as string[],
    difficulty: 'MODERATE' as string,
    focusArea: '',
    language: 'English',
  });
  const [aiSelectedType, setAiSelectedType] = useState<string>('MCQ');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResults, setAiResults] = useState<AiGeneratedQuestion[]>([]);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiSavePhase, setAiSavePhase] = useState<'none' | 'choose' | 'pickTest' | 'saved'>('none');
  const [aiTests, setAiTests] = useState<Test[]>([]);
  const [aiSelectedTest, setAiSelectedTest] = useState('');

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (filterSubject) params.subjectId = filterSubject;
      if (filterTopic) params.topicId = filterTopic;
      if (filterType) params.type = filterType;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      const res = await questionService.getAll(params);
      setQuestions(res.data.questions);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [page, filterSubject, filterTopic, filterType, filterDifficulty]);

  const fetchSubjects = async () => {
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data);
    } catch {}
  };

  useEffect(() => { fetchSubjects(); }, []);
  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  // Load topics when filter subject changes
  useEffect(() => {
    if (filterSubject) {
      topicService.getBySubject(filterSubject).then((res) => setFilterTopics(res.data)).catch(() => setFilterTopics([]));
    } else {
      setFilterTopics([]);
      setFilterTopic('');
    }
  }, [filterSubject]);

  // Load topics when import subject changes
  useEffect(() => {
    if (importSubjectId) {
      topicService.getBySubject(importSubjectId).then((res) => setImportTopics(res.data)).catch(() => setImportTopics([]));
    } else {
      setImportTopics([]);
    }
  }, [importSubjectId]);

  // Load topics when form subject changes
  useEffect(() => {
    if (form.subjectId) {
      topicService.getBySubject(form.subjectId).then((res) => setFormTopics(res.data)).catch(() => setFormTopics([]));
    } else {
      setFormTopics([]);
    }
  }, [form.subjectId]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      subjectId: subjects[0]?.id || '',
      topicId: '',
      type: 'MCQ',
      difficulty: 'MODERATE',
      text: '',
      marks: 1,
      explanation: '',
    });
    setOptions([
      { label: 'A', text: '' },
      { label: 'B', text: '' },
      { label: 'C', text: '' },
      { label: 'D', text: '' },
    ]);
    setCorrectAnswers([]);
    setShowForm(true);
    setError('');
  };

  const openEdit = async (id: string) => {
    try {
      const res = await questionService.getById(id);
      const q = res.data;
      setEditing(q);
      setForm({
        subjectId: q.subjectId,
        topicId: q.topicId || '',
        type: q.type,
        difficulty: q.difficulty,
        text: q.text,
        marks: q.marks,
        explanation: q.explanation || '',
      });
      setOptions(q.options.map((o: any) => ({ label: o.label, text: o.text })));
      setCorrectAnswers(Array.isArray(q.correctAnswers) ? q.correctAnswers : []);
      setShowForm(true);
      setError('');
    } catch {
      setError('Failed to load question');
    }
  };

  const handleOptionChange = (index: number, text: string) => {
    const updated = [...options];
    updated[index].text = text;
    setOptions(updated);
  };

  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + options.length);
    setOptions([...options, { label: nextLabel, text: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    const removed = options[index];
    setOptions(options.filter((_, i) => i !== index));
    setCorrectAnswers(correctAnswers.filter((a) => a !== removed.label));
  };

  const toggleCorrectAnswer = (label: string) => {
    if (form.type === 'MCQ' || form.type === 'TRUE_FALSE') {
      setCorrectAnswers([label]);
    } else {
      setCorrectAnswers(
        correctAnswers.includes(label)
          ? correctAnswers.filter((a) => a !== label)
          : [...correctAnswers, label]
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) { setError('Question text is required'); return; }
    if (correctAnswers.length === 0) { setError('Select at least one correct answer'); return; }
    setSaving(true);
    setError('');
    try {
      const data = {
        ...form,
        topicId: form.topicId || undefined,
        options,
        correctAnswers,
      };
      if (editing) {
        await questionService.update(editing.id, data);
      } else {
        await questionService.create(data);
      }
      setShowForm(false);
      fetchQuestions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await questionService.remove(id);
      fetchQuestions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete question');
    }
  };

  // --- Bulk Import Logic ---
  const handleImport = async () => {
    if (!importFile) { setError('Please select a file'); return; }
    if (!importSubjectId) { setError('Please select a subject'); return; }
    setImporting(true);
    setError('');
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('subjectId', importSubjectId);
      if (importTopicId) formData.append('topicId', importTopicId);
      const res = await questionService.bulkImport(importFile, importSubjectId, importTopicId);
      setImportResult(res.data);
      fetchQuestions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  // --- AI Generate Logic ---
  const handleAiGenerate = async () => {
    setError('');
    setAiSavePhase('none');

    if (aiTab === 'file' && !aiFile) { setError('Please upload a document'); return; }
    if (aiTab === 'text' && aiTopicText.trim().length < 10) { setError('Please enter topic text (at least 10 characters)'); return; }

    // Build types array
    let typesToSend = aiParams.types;
    if (aiSelectedType === 'MIXED') {
      typesToSend = QUESTION_TYPES.map((qt) => qt.value);
    } else {
      typesToSend = [aiSelectedType];
    }

    setAiGenerating(true);
    setAiResults([]);
    try {
      let res;
      const params = { ...aiParams, types: typesToSend };
      if (aiTab === 'file' && aiFile) {
        res = await questionService.aiGenerate(aiFile, params);
      } else {
        res = await questionService.aiGenerateFromText({
          text: aiTopicText,
          subjectId: params.subjectId,
          count: params.count,
          types: params.types,
          difficulty: params.difficulty,
          language: params.language,
        });
      }
      const generated = (res.data.questions || []).map((q: AiGeneratedQuestion) => ({
        ...q,
        _status: 'pending' as const,
        _editing: false,
      }));
      setAiResults(generated);
    } catch (err: any) {
      setError(err.response?.data?.error || 'AI generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  const aiAcceptQuestion = (index: number) => {
    setAiResults((prev) => prev.map((q, i) => i === index ? { ...q, _status: 'accepted' as const } : q));
  };

  const aiRejectQuestion = (index: number) => {
    setAiResults((prev) => prev.filter((_, i) => i !== index));
  };

  const aiRegenerateQuestion = (index: number) => {
    setAiResults((prev) => prev.filter((_, i) => i !== index));
    // Note: Single-question regeneration is not yet supported by the API.
    // The question has been removed. You can regenerate all questions if needed.
  };

  const aiToggleEdit = (index: number) => {
    setAiResults((prev) => prev.map((q, i) => i === index ? { ...q, _editing: !q._editing } : q));
  };

  const aiUpdateQuestion = (index: number, updates: Partial<AiGeneratedQuestion>) => {
    setAiResults((prev) => prev.map((q, i) => i === index ? { ...q, ...updates } : q));
  };

  const aiUpdateOption = (qIndex: number, oIndex: number, text: string) => {
    setAiResults((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex || !q.options) return q;
        const newOpts = q.options.map((o, j) => (j === oIndex ? { ...o, text } : o));
        return { ...q, options: newOpts };
      })
    );
  };

  const aiToggleCorrect = (qIndex: number, label: string) => {
    setAiResults((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const current = q.correctAnswers || [];
        const isSelected = current.includes(label);
        return { ...q, correctAnswers: isSelected ? current.filter((a) => a !== label) : [...current, label] };
      })
    );
  };

  const aiAcceptAll = () => {
    setAiResults((prev) => prev.map((q) => ({ ...q, _status: 'accepted' as const })));
  };

  const acceptedQuestions = aiResults.filter((q) => q._status === 'accepted');
  const hasAccepted = acceptedQuestions.length > 0;

  const handleSaveToBank = async () => {
    if (!aiParams.subjectId) { setError('Please select a subject before saving'); return; }
    if (acceptedQuestions.length === 0) return;
    setAiSaving(true);
    setError('');
    try {
      const cleaned = acceptedQuestions.map(({ _status, _editing, question, ...rest }) => ({
        ...rest,
        text: rest.text || question || '',
      }));
      await questionService.batchSave(aiParams.subjectId, cleaned);
      setAiSavePhase('saved');
      fetchQuestions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save questions');
    } finally {
      setAiSaving(false);
    }
  };

  const handleAddToTest = async () => {
    if (!aiParams.subjectId) { setError('Please select a subject before saving'); return; }
    if (!aiSelectedTest) { setError('Please select a test'); return; }
    if (acceptedQuestions.length === 0) return;
    setAiSaving(true);
    setError('');
    try {
      const cleaned = acceptedQuestions.map(({ _status, _editing, question, ...rest }) => ({
        ...rest,
        text: rest.text || question || '',
        testId: aiSelectedTest,
      }));
      await questionService.batchSave(aiParams.subjectId, cleaned);
      setAiSavePhase('saved');
      fetchQuestions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save questions');
    } finally {
      setAiSaving(false);
    }
  };

  const openDestinationChoice = async () => {
    setAiSavePhase('choose');
    try {
      const res = await testService.getAll();
      setAiTests(res.data.tests || res.data || []);
    } catch {
      setAiTests([]);
    }
  };

  const closeAiModal = () => {
    setShowAiModal(false);
    setAiResults([]);
    setAiFile(null);
    setAiTopicText('');
    setAiSavePhase('none');
    setAiSelectedTest('');
  };

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'SIMPLE': return 'bg-green-100 text-green-700';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-700';
      case 'HARD': return 'bg-orange-100 text-orange-700';
      case 'VERY_HARD': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    const found = QUESTION_TYPES.find((qt) => qt.value === type);
    return found ? t(found.labelKey) : type;
  };

  // True/False options
  useEffect(() => {
    if (form.type === 'TRUE_FALSE') {
      setOptions([
        { label: 'A', text: 'True' },
        { label: 'B', text: 'False' },
      ]);
      setCorrectAnswers([]);
    }
  }, [form.type]);

  return (
    <div>
      {/* Header */}
      <AdminPageHeader
        eyebrow="Question bank"
        title={t('nav.questions')}
        description={`${total} questions total. Filter, import, generate, and manage question inventory across subjects and topics.`}
        actions={<div className="flex flex-wrap gap-2">
          <a
            href="/api/questions/bulk-import/template"
            className={`${adminButtonSecondary} inline-flex items-center gap-1`}
          >
            {t('question.downloadTemplate')}
          </a>
          <button
            onClick={() => setShowImportModal(true)}
            className={adminButtonSecondary}
          >
            {t('question.bulkImport')}
          </button>
          <button
            onClick={() => setShowAiModal(true)}
            className={adminButtonSecondary}
          >
            {t('question.aiGenerate')}
          </button>
          <button
            onClick={openCreate}
            className={adminButtonPrimary}
          >
            + {t('question.addQuestion')}
          </button>
        </div>}
      />

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      {/* Filters */}
      <AdminSurface className="mb-4 p-4" tinted>
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterSubject}
          onChange={(e) => { setFilterSubject(e.target.value); setFilterTopic(''); setPage(1); }}
          className={adminFilterClass}
        >
          <option value="">{t('common.all')} -- {t('test.subject')}</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={filterTopic}
          onChange={(e) => { setFilterTopic(e.target.value); setPage(1); }}
          className={adminFilterClass}
          disabled={!filterSubject}
        >
          <option value="">{t('common.all')} -- Topic</option>
          {filterTopics.map((tp) => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
        </select>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className={adminFilterClass}
        >
          <option value="">{t('common.all')} -- {t('question.questionType')}</option>
          {QUESTION_TYPES.map((qt) => <option key={qt.value} value={qt.value}>{t(qt.labelKey)}</option>)}
        </select>
        <select
          value={filterDifficulty}
          onChange={(e) => { setFilterDifficulty(e.target.value); setPage(1); }}
          className={adminFilterClass}
        >
          <option value="">{t('common.all')} -- {t('question.difficulty')}</option>
          {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{t(d.labelKey)}</option>)}
        </select>
      </div>
      </AdminSurface>

      {/* Questions Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : questions.length === 0 ? (
        <AdminEmptyState title={t('common.noData')} description="No questions matched the selected filters." icon="❓" />
      ) : (
        <>
          <AdminSurface className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('question.questionText')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('test.subject')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Topic</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('question.questionType')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('question.difficulty')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('question.marks')}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {questions.map((q, i) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-500">{(page - 1) * 20 + i + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {q.text.replace(/<[^>]*>/g, '').slice(0, 80)}{q.text.length > 80 ? '...' : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{q.subject?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{q.topic?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{getTypeLabel(q.type)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{q.marks}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(q.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">{t('common.edit')}</button>
                      <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminSurface>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-30">{t('test.previous')}</button>
              <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-30">{t('test.next')}</button>
            </div>
          )}
        </>
      )}

      {/* ========== Create/Edit Question Modal ========== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? t('question.editQuestion') : t('question.addQuestion')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('test.subject')} *</label>
                  <select
                    value={form.subjectId}
                    onChange={(e) => setForm({ ...form, subjectId: e.target.value, topicId: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800"
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <select
                    value={form.topicId}
                    onChange={(e) => setForm({ ...form, topicId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800"
                    disabled={!form.subjectId}
                  >
                    <option value="">None</option>
                    {formTopics.map((tp) => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('question.questionType')} *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as QuestionType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800"
                  >
                    {QUESTION_TYPES.map((qt) => <option key={qt.value} value={qt.value}>{t(qt.labelKey)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('question.difficulty')} *</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800"
                  >
                    {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{t(d.labelKey)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('question.marks')} *</label>
                  <input
                    type="number"
                    value={form.marks}
                    onChange={(e) => setForm({ ...form, marks: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min={0}
                    step={0.25}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('question.questionText')} *</label>
                <RichTextEditor
                  content={form.text}
                  onChange={(html) => setForm({ ...form, text: html })}
                  placeholder="Type your question here..."
                  minHeight="100px"
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('question.options')} -- click to mark correct</label>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCorrectAnswer(opt.label)}
                        className={`w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 border-2 transition ${
                          correctAnswers.includes(opt.label)
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:border-green-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder={`Option ${opt.label}`}
                        disabled={form.type === 'TRUE_FALSE'}
                        required
                      />
                      {form.type !== 'TRUE_FALSE' && options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-600 text-lg">x</button>
                      )}
                    </div>
                  ))}
                </div>
                {form.type !== 'TRUE_FALSE' && (
                  <button type="button" onClick={addOption} className="mt-2 text-sm text-blue-600 hover:text-blue-800">+ Add option</button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('question.explanation')}</label>
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? t('app.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== AI Generate Modal ========== */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-6">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('question.aiGenerate')}</h2>
              <button
                onClick={closeAiModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => { setAiTab('file'); setAiResults([]); setAiSavePhase('none'); }}
                  className={`px-5 py-2.5 text-sm font-medium border-b-2 transition ${
                    aiTab === 'file'
                      ? 'border-purple-600 text-purple-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => { setAiTab('text'); setAiResults([]); setAiSavePhase('none'); }}
                  className={`px-5 py-2.5 text-sm font-medium border-b-2 transition ${
                    aiTab === 'text'
                      ? 'border-purple-600 text-purple-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Enter Topic
                </button>
              </div>

              {/* Tab 1: File Upload */}
              {aiTab === 'file' && (
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition">
                    <div className="flex flex-col items-center justify-center">
                      {aiFile ? (
                        <>
                          <svg className="w-8 h-8 text-green-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium text-green-700">{aiFile.name}</p>
                          <p className="text-xs text-gray-500">{(aiFile.size / 1024).toFixed(1)} KB -- Click to change</p>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-purple-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm font-semibold text-purple-700">Click to upload file</p>
                          <p className="text-xs text-gray-500">PDF, DOCX, TXT, PPTX, JPG, PNG</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.pptx,.ppt,.jpg,.jpeg,.png"
                      onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Upload a file containing study material, notes, or syllabus from which AI will generate questions.
                    The file can also contain a list of topics and subtopics.
                  </p>
                </div>
              )}

              {/* Tab 2: Text Input */}
              {aiTab === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name & Subtopics *</label>
                  <textarea
                    value={aiTopicText}
                    onChange={(e) => setAiTopicText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={5}
                    placeholder={"Example:\nData Structures in Computer Science\n\nSubtopics:\n- Arrays and their operations\n- Linked Lists (singly, doubly, circular)\n- Stacks and Queues\n- Trees (binary, BST, AVL)\n- Graph traversal algorithms (BFS, DFS)"}
                  />
                  <p className="text-xs text-gray-400 mt-1">Describe the topic and subtopics you want questions from</p>
                </div>
              )}

              {/* Parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('test.subject')} *</label>
                  <select
                    value={aiParams.subjectId}
                    onChange={(e) => setAiParams({ ...aiParams, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800"
                  >
                    <option value="">Select</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                  <input
                    type="number"
                    value={aiParams.count}
                    onChange={(e) => setAiParams({ ...aiParams, count: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min={1}
                    max={30}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('question.questionType')}</label>
                  <select
                    value={aiSelectedType}
                    onChange={(e) => setAiSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800"
                  >
                    {AI_QUESTION_TYPE_OPTIONS.map((qt) => (
                      <option key={qt.value} value={qt.value}>
                        {qt.value === 'MIXED' ? 'Mixed (All Types)' : t(qt.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('question.difficulty')}</label>
                  <select
                    value={aiParams.difficulty}
                    onChange={(e) => setAiParams({ ...aiParams, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800"
                  >
                    {AI_DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.value === 'MIXED' ? 'Mixed' : t(d.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    value={aiParams.language}
                    onChange={(e) => setAiParams({ ...aiParams, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Marathi</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              {aiResults.length === 0 && !aiGenerating && (
                <div className="flex justify-end">
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiTab === 'file' ? !aiFile : aiTopicText.trim().length < 10}
                    className="px-6 py-2.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-40 font-medium"
                  >
                    Generate Questions
                  </button>
                </div>
              )}

              {/* Generation Progress */}
              {aiGenerating && (
                <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
                  <span className="text-sm text-purple-700 font-medium">Generating questions with AI... This may take 10-20 seconds.</span>
                </div>
              )}

              {/* Results */}
              {aiResults.length > 0 && aiSavePhase !== 'saved' && (
                <>
                  {/* Summary bar */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-semibold text-gray-700">
                        {aiResults.length} question{aiResults.length !== 1 ? 's' : ''} generated
                      </p>
                      <span className="text-xs text-gray-500">
                        {acceptedQuestions.length} accepted
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={aiAcceptAll}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        Accept All
                      </button>
                      <button
                        onClick={handleAiGenerate}
                        className="px-3 py-1.5 text-xs text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition font-medium"
                      >
                        Regenerate All
                      </button>
                    </div>
                  </div>

                  {/* Question cards */}
                  <div className="max-h-[28rem] overflow-y-auto space-y-3 pr-1">
                    {aiResults.map((q, i) => (
                      <div
                        key={i}
                        className={`rounded-lg border p-4 transition ${
                          q._status === 'accepted'
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        {/* Question header with actions */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            {q._editing ? (
                              <textarea
                                value={q.text || q.question || ''}
                                onChange={(e) => aiUpdateQuestion(i, { text: e.target.value, question: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                rows={2}
                              />
                            ) : (
                              <p className="text-sm font-medium text-gray-900">
                                <span className="text-purple-600 font-bold mr-1">Q{i + 1}.</span>
                                {q.text || q.question}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Accept */}
                            <button
                              onClick={() => aiAcceptQuestion(i)}
                              title="Accept"
                              className={`p-1.5 rounded-lg transition ${
                                q._status === 'accepted'
                                  ? 'bg-green-100 text-green-600'
                                  : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => aiToggleEdit(i)}
                              title="Edit"
                              className={`p-1.5 rounded-lg transition ${
                                q._editing
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            {/* Regenerate */}
                            <button
                              onClick={() => aiRegenerateQuestion(i)}
                              title="Regenerate (removes this question)"
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            {/* Reject */}
                            <button
                              onClick={() => aiRejectQuestion(i)}
                              title="Reject"
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Options */}
                        {q.options && (
                          <div className="grid grid-cols-2 gap-1 mt-2">
                            {q.options.map((opt, oIdx) => (
                              <div key={opt.label} className="flex items-center gap-1">
                                {q._editing ? (
                                  <div className="flex items-center gap-1 w-full">
                                    <button
                                      type="button"
                                      onClick={() => aiToggleCorrect(i, opt.label)}
                                      className={`w-5 h-5 rounded-full text-xs font-bold flex-shrink-0 border transition ${
                                        q.correctAnswers?.includes(opt.label)
                                          ? 'bg-green-500 border-green-500 text-white'
                                          : 'bg-white border-gray-300 text-gray-400'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                    <input
                                      value={opt.text}
                                      onChange={(e) => aiUpdateOption(i, oIdx, e.target.value)}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                    />
                                  </div>
                                ) : (
                                  <p className={`text-xs px-2 py-1 rounded w-full ${
                                    q.correctAnswers?.includes(opt.label)
                                      ? 'bg-green-100 text-green-800 font-medium'
                                      : 'text-gray-600'
                                  }`}>
                                    {opt.label}. {opt.text}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Explanation in edit mode */}
                        {q._editing && (
                          <div className="mt-2">
                            <input
                              value={q.explanation || ''}
                              onChange={(e) => aiUpdateQuestion(i, { explanation: e.target.value })}
                              placeholder="Explanation (optional)"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        )}

                        {q.explanation && !q._editing && (
                          <p className="text-xs text-gray-400 mt-2 italic">{q.explanation}</p>
                        )}

                        {/* Status badge */}
                        {q._status === 'accepted' && (
                          <div className="mt-2">
                            <span className="text-xs text-green-600 font-medium">Accepted</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Destination choice */}
                  {aiSavePhase === 'none' && hasAccepted && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={openDestinationChoice}
                        disabled={!aiParams.subjectId}
                        className="px-5 py-2.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-40 font-medium"
                      >
                        Save {acceptedQuestions.length} Accepted Question{acceptedQuestions.length !== 1 ? 's' : ''}
                      </button>
                    </div>
                  )}

                  {aiSavePhase === 'none' && !hasAccepted && aiResults.length > 0 && (
                    <p className="text-xs text-gray-400 text-center">Accept at least one question to save</p>
                  )}

                  {!aiParams.subjectId && hasAccepted && (
                    <p className="text-xs text-red-500 text-center">Please select a subject above before saving</p>
                  )}

                  {/* Choose destination */}
                  {aiSavePhase === 'choose' && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Where would you like to save the accepted questions?</p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveToBank}
                          disabled={aiSaving}
                          className="flex-1 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                        >
                          {aiSaving ? 'Saving...' : 'Save to Question Bank'}
                        </button>
                        <button
                          onClick={() => setAiSavePhase('pickTest')}
                          className="flex-1 px-4 py-2.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          Add to Test
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pick test */}
                  {aiSavePhase === 'pickTest' && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Select a test to add questions to</p>
                      <select
                        value={aiSelectedTest}
                        onChange={(e) => setAiSelectedTest(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 mb-3"
                      >
                        <option value="">Select test</option>
                        {aiTests.map((test) => (
                          <option key={test.id} value={test.id}>
                            {test.title} ({test.status})
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setAiSavePhase('choose')}
                          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleAddToTest}
                          disabled={aiSaving || !aiSelectedTest}
                          className="flex-1 px-4 py-2.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-40 font-medium"
                        >
                          {aiSaving ? 'Saving...' : 'Save to Bank & Add to Test'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Saved confirmation */}
              {aiSavePhase === 'saved' && (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 p-4 rounded-lg text-sm font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Questions saved successfully!
                </div>
              )}

              {/* Close button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={closeAiModal}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('question.bulkImport')}</h2>
              <button onClick={() => { setShowImportModal(false); setImportResult(null); setImportFile(null); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <div className="space-y-4">
              {/* Step 1: Download template info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-800 mb-1">How to import:</p>
                <ol className="text-blue-700 space-y-1 list-decimal list-inside text-xs">
                  <li>Download the Excel template using the "Download Template" button</li>
                  <li>Fill in your questions following the sample rows and instructions</li>
                  <li>Select a subject below and upload the filled file</li>
                </ol>
                <a href="/api/questions/bulk-import/template" className="inline-block mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition">
                  Download Template (.xlsx)
                </a>
              </div>

              {/* Subject & Topic */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('test.subject')} *</label>
                  <select
                    value={importSubjectId}
                    onChange={(e) => { setImportSubjectId(e.target.value); setImportTopicId(''); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800"
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic (optional)</label>
                  <select
                    value={importTopicId}
                    onChange={(e) => setImportTopicId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800"
                    disabled={!importSubjectId}
                  >
                    <option value="">No specific topic</option>
                    {importTopics.map((tp) => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-green-300 rounded-xl cursor-pointer bg-green-50 hover:bg-green-100 hover:border-green-400 transition">
                  <div className="flex flex-col items-center justify-center">
                    {importFile ? (
                      <>
                        <svg className="w-7 h-7 text-green-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-sm font-medium text-green-700">{importFile.name}</p>
                        <p className="text-xs text-gray-500">Click to change</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-7 h-7 text-green-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="text-sm font-semibold text-green-700">Click to upload Excel/CSV</p>
                        <p className="text-xs text-gray-500">.xlsx or .csv files</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>

              {/* Import Result */}
              {importResult && (
                <div className={`rounded-lg p-4 text-sm ${importResult.errors.length > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                  <p className="font-semibold text-gray-800 mb-2">Import Summary</p>
                  <div className="grid grid-cols-3 gap-3 text-center mb-2">
                    <div>
                      <p className="text-lg font-bold text-gray-800">{importResult.total}</p>
                      <p className="text-xs text-gray-500">Total Rows</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{importResult.imported}</p>
                      <p className="text-xs text-gray-500">Imported</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-600">{importResult.errors.length}</p>
                      <p className="text-xs text-gray-500">Failed</p>
                    </div>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="max-h-32 overflow-y-auto border-t border-yellow-200 pt-2 mt-2">
                      {importResult.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-600">{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowImportModal(false); setImportResult(null); setImportFile(null); }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('common.close')}
                </button>
                {!importResult && (
                  <button
                    onClick={handleImport}
                    disabled={importing || !importFile || !importSubjectId}
                    className="px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-40 font-medium"
                  >
                    {importing ? 'Importing...' : 'Import Questions'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
