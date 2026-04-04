import { useState, useEffect, useCallback, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { subjectService } from '../../services/subject.service';
import { topicService } from '../../services/topic.service';
import { Subject, Topic } from '../../types';
import { AdminModal, AdminPageHeader, AdminSurface, adminButtonPrimary, adminButtonSecondary } from '../../components/common/AdminTheme';

export function SubjectsPage() {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Topic state
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [topicsBySubject, setTopicsBySubject] = useState<Record<string, Topic[]>>({});
  const [topicsLoading, setTopicsLoading] = useState<Record<string, boolean>>({});
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({ name: '', description: '' });
  const [topicFormSubjectId, setTopicFormSubjectId] = useState<string | null>(null);
  const [savingTopic, setSavingTopic] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data);
    } catch {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const fetchTopics = useCallback(async (subjectId: string) => {
    setTopicsLoading((prev) => ({ ...prev, [subjectId]: true }));
    try {
      const res = await topicService.getBySubject(subjectId);
      setTopicsBySubject((prev) => ({ ...prev, [subjectId]: res.data }));
    } catch {
      setError('Failed to load topics');
    } finally {
      setTopicsLoading((prev) => ({ ...prev, [subjectId]: false }));
    }
  }, []);

  const toggleExpand = (subjectId: string) => {
    if (expandedSubjectId === subjectId) {
      setExpandedSubjectId(null);
    } else {
      setExpandedSubjectId(subjectId);
      if (!topicsBySubject[subjectId]) {
        fetchTopics(subjectId);
      }
    }
  };

  // ---- Subject CRUD ----

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setShowForm(true);
    setError('');
  };

  const openEdit = (subject: Subject) => {
    setEditing(subject);
    setForm({ name: subject.name, description: subject.description || '' });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Subject name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await subjectService.update(editing.id, form);
      } else {
        await subjectService.create(form);
      }
      setShowForm(false);
      setForm({ name: '', description: '' });
      setEditing(null);
      fetchSubjects();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await subjectService.remove(id);
      if (expandedSubjectId === id) setExpandedSubjectId(null);
      fetchSubjects();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete subject');
    }
  };

  // ---- Topic CRUD ----

  const openCreateTopic = (subjectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTopic(null);
    setTopicForm({ name: '', description: '' });
    setTopicFormSubjectId(subjectId);
    setShowTopicForm(true);
    setError('');
  };

  const openEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicForm({ name: topic.name, description: topic.description || '' });
    setTopicFormSubjectId(topic.subjectId);
    setShowTopicForm(true);
    setError('');
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.name.trim()) { setError('Topic name is required'); return; }
    if (!topicFormSubjectId) return;
    setSavingTopic(true);
    setError('');
    try {
      if (editingTopic) {
        await topicService.update(editingTopic.id, { name: topicForm.name, description: topicForm.description || undefined });
      } else {
        await topicService.create({ name: topicForm.name, subjectId: topicFormSubjectId, description: topicForm.description || undefined });
      }
      setShowTopicForm(false);
      setTopicForm({ name: '', description: '' });
      setEditingTopic(null);
      fetchTopics(topicFormSubjectId);
      setTopicFormSubjectId(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save topic');
    } finally {
      setSavingTopic(false);
    }
  };

  const handleDeleteTopic = async (topic: Topic) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    try {
      await topicService.remove(topic.id);
      fetchTopics(topic.subjectId);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete topic');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

  return (
    <div>
      <AdminPageHeader
        eyebrow="Subject management"
        title={t('nav.subjects')}
        description="Organize subjects, manage descriptions, and expand rows to work with topics."
        actions={<button onClick={openCreate} className={adminButtonPrimary}>+ {t('common.create')}</button>}
      />

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      {/* Subject Create/Edit Form Modal */}
      {showForm && (
        <AdminModal
          title={
            <>
              {editing ? t('common.edit') : t('common.create')} — {t('nav.subjects')}
            </>
          }
          description="Update the subject title and optional description."
          onClose={() => setShowForm(false)}
          widthClass="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className={adminButtonSecondary}>
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={saving} className={`${adminButtonPrimary} disabled:opacity-50`}>
                  {saving ? t('app.loading') : t('common.save')}
                </button>
              </div>
            </form>
        </AdminModal>
      )}

      {/* Topic Create/Edit Form Modal */}
      {showTopicForm && (
        <AdminModal
          title={
            <>
              {editingTopic ? t('common.edit') : t('common.create')} — Topic
            </>
          }
          description="Maintain topic names and optional descriptions for the selected subject."
          onClose={() => setShowTopicForm(false)}
          widthClass="max-w-md"
        >
            <form onSubmit={handleTopicSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name *</label>
                <input
                  type="text"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowTopicForm(false)} className={adminButtonSecondary}>
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={savingTopic} className={`${adminButtonPrimary} disabled:opacity-50`}>
                  {savingTopic ? t('app.loading') : t('common.save')}
                </button>
              </div>
            </form>
        </AdminModal>
      )}

      {/* Subjects Table */}
      {subjects.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">{t('common.noData')}</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-700 px-6 py-5 text-white">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-100/90">Subjects on dashboard</p>
                <h2 className="mt-1 text-xl font-semibold">Subject directory</h2>
                <p className="mt-1 text-sm text-slate-200">Click any row to reveal topics and manage the learning structure from one place.</p>
              </div>
              <div className="inline-flex items-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-100/80">Total subjects</p>
                  <p className="text-2xl font-semibold leading-none">{subjects.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50/90">
              <tr>
                <th className="w-8 px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"></th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">#</th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Subject</th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Overview</th>
                <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((subject, index) => {
                const isExpanded = expandedSubjectId === subject.id;
                const topics = topicsBySubject[subject.id] || [];
                const isLoadingTopics = topicsLoading[subject.id];

                return (
                  <Fragment key={subject.id}>
                    <tr
                      className={`cursor-pointer transition ${isExpanded ? 'bg-teal-50/50' : 'hover:bg-slate-50/80'}`}
                      onClick={() => toggleExpand(subject.id)}
                    >
                      <td className="px-6 py-5 text-sm text-slate-400">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] shadow-sm transition-transform ${isExpanded ? 'rotate-90 text-teal-600 border-teal-200' : ''}`}>
                          &#9654;
                        </span>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-2xl bg-slate-100 px-3 text-sm font-semibold text-slate-600">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-sm font-bold text-white shadow-lg shadow-teal-500/20">
                            {getInitials(subject.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">{subject.name}</p>
                              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-700">
                                {topicsBySubject[subject.id] ? `${topics.length} loaded topic${topics.length !== 1 ? 's' : ''}` : 'Expandable'}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">Tap to {isExpanded ? 'collapse topics' : 'view and manage topics'}.</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        {subject.description ? (
                          <div className="max-w-xl">
                            <p className="line-clamp-2 text-sm leading-6 text-slate-600">{subject.description}</p>
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-400">
                            No description added
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right align-top" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap justify-end gap-2">
                        <button onClick={(e) => openCreateTopic(subject.id, e)} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">
                          + Topic
                        </button>
                        <button onClick={() => openEdit(subject)} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100">
                          {t('common.edit')}
                        </button>
                        <button onClick={() => handleDelete(subject.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100">
                          {t('common.delete')}
                        </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded topics rows */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="border-y border-teal-100 bg-gradient-to-br from-teal-50 via-white to-slate-50">
                            {isLoadingTopics ? (
                              <div className="flex items-center gap-3 px-12 py-6 text-sm text-slate-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                                {t('app.loading')}
                              </div>
                            ) : topics.length === 0 ? (
                              <div className="px-12 py-6 text-sm text-slate-500">
                                <span className="font-medium text-slate-700">No topics yet.</span> Create the first topic to start grouping questions and tests under this subject.
                                <button
                                  onClick={(e) => openCreateTopic(subject.id, e)}
                                  className="ml-2 font-medium text-blue-600 hover:text-blue-800"
                                >
                                  + Add Topic
                                </button>
                              </div>
                            ) : (
                              <div className="px-8 py-6">
                                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">Topics under {subject.name}</p>
                                    <p className="text-xs text-slate-500">Each topic groups related questions and tests for this subject.</p>
                                  </div>
                                  <span className="inline-flex w-fit rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                                    {topics.length} topic{topics.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
                                {topics.map((topic) => (
                                  <div key={topic.id} className="flex flex-col gap-4 px-6 py-4 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium text-slate-800">{topic.name}</span>
                                        {topic._count && (
                                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                            {topic._count.questions} question{topic._count.questions !== 1 ? 's' : ''} / {topic._count.tests} test{topic._count.tests !== 1 ? 's' : ''}
                                          </span>
                                        )}
                                      </div>
                                      {topic.description && (
                                        <p className="mt-1 text-sm text-slate-500">{topic.description}</p>
                                      )}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                      <button
                                        onClick={() => openEditTopic(topic)}
                                        className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                                      >
                                        {t('common.edit')}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTopic(topic)}
                                        className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
                                      >
                                        {t('common.delete')}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              </div>
                            )}
                          </div>
                        </td>
                    </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
