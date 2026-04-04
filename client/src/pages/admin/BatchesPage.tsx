import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { batchService } from '../../services/batch.service';
import { userService } from '../../services/user.service';
import { testService } from '../../services/test.service';
import { AdminEmptyState, AdminPageHeader, AdminSurface, adminButtonPrimary } from '../../components/common/AdminTheme';

interface Batch {
  id: string;
  name: string;
  description?: string;
  _count?: { students: number; tests: number };
}

export function BatchesPage() {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // CRUD form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Detail view
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add students modal
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Assign tests modal
  const [showAssignTests, setShowAssignTests] = useState(false);
  const [allTests, setAllTests] = useState<any[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);

  const fetchBatches = async () => {
    try {
      const res = await batchService.getAll();
      setBatches(res.data);
    } catch { setError('Failed to load batches'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBatches(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setShowForm(true);
    setError('');
  };

  const openEdit = (batch: Batch) => {
    setEditing(batch);
    setForm({ name: batch.name, description: batch.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) await batchService.update(editing.id, form);
      else await batchService.create(form);
      setShowForm(false);
      fetchBatches();
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this batch?')) return;
    try { await batchService.remove(id); fetchBatches(); setDetail(null); }
    catch (err: any) { setError(err.response?.data?.error || 'Failed to delete'); }
  };

  const openDetail = async (batch: Batch) => {
    setDetailLoading(true);
    try {
      const res = await batchService.getById(batch.id);
      setDetail(res.data);
    } catch { setError('Failed to load batch details'); }
    finally { setDetailLoading(false); }
  };

  const openAddStudents = async () => {
    try {
      const res = await userService.getAll({ limit: '500' });
      const currentIds = new Set((detail?.students || []).map((s: any) => s.studentId));
      setAllStudents(res.data.users.filter((u: any) => !currentIds.has(u.id)));
      setSelectedStudentIds([]);
      setShowAddStudents(true);
    } catch {}
  };

  const handleAddStudents = async () => {
    if (!detail || selectedStudentIds.length === 0) return;
    try {
      await batchService.addStudents(detail.id, selectedStudentIds);
      setShowAddStudents(false);
      openDetail(detail);
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to add'); }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!detail) return;
    try {
      await batchService.removeStudent(detail.id, studentId);
      openDetail(detail);
    } catch {}
  };

  const openAssignTests = async () => {
    try {
      const res = await testService.getAll();
      const currentIds = new Set((detail?.tests || []).map((t: any) => t.testId));
      setAllTests(res.data.filter((t: any) => !currentIds.has(t.id)));
      setSelectedTestIds([]);
      setShowAssignTests(true);
    } catch {}
  };

  const handleAssignTests = async () => {
    if (!detail || selectedTestIds.length === 0) return;
    try {
      await batchService.assignTests(detail.id, selectedTestIds);
      setShowAssignTests(false);
      openDetail(detail);
      fetchBatches();
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to assign'); }
  };

  const handleRemoveTest = async (testId: string) => {
    if (!detail) return;
    try {
      await batchService.removeTest(detail.id, testId);
      openDetail(detail);
      fetchBatches();
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Batch operations"
        title="Batches / Standards"
        description="Manage groups of students, assign tests in bulk, and review batch composition from one place."
        actions={<button onClick={openCreate} className={adminButtonPrimary}>+ Create Batch</button>}
      />

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch List */}
        <div className="lg:col-span-1">
          {batches.length === 0 ? (
            <AdminEmptyState title="No batches created yet" description="Create a batch to start grouping students and assigning tests." icon="👥" />
          ) : (
            <div className="space-y-2">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => openDetail(batch)}
                  className={`cursor-pointer transition ${detail?.id === batch.id ? '' : ''}`}
                >
                  <AdminSurface className={`p-4 ${detail?.id === batch.id ? 'ring-2 ring-teal-300' : ''}`} tinted>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{batch.name}</h3>
                        {batch.description && <p className="text-xs text-gray-500 mt-0.5">{batch.description}</p>}
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <p>{batch._count?.students || 0} students</p>
                        <p>{batch._count?.tests || 0} tests</p>
                      </div>
                    </div>
                  </AdminSurface>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Batch Detail */}
        <div className="lg:col-span-2">
          {!detail ? (
            <AdminEmptyState title="Select a batch to view details" description="Choose a batch from the left side to inspect students and assigned tests." icon="📚" />
          ) : detailLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
          ) : (
            <AdminSurface className="p-6" tinted>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{detail.name}</h2>
                  {detail.description && <p className="text-sm text-gray-500">{detail.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(detail)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">{t('common.edit')}</button>
                  <button onClick={() => handleDelete(detail.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">{t('common.delete')}</button>
                </div>
              </div>

              {/* Students */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Students ({detail.students?.length || 0})</h3>
                  <button onClick={openAddStudents} className="rounded-xl bg-[linear-gradient(135deg,#0f766e_0%,#0f172a_100%)] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:opacity-95">+ Add Students</button>
                </div>
                {detail.students?.length === 0 ? (
                  <p className="text-sm text-gray-400">No students in this batch</p>
                ) : (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {detail.students?.map((bs: any) => (
                      <div key={bs.studentId} className="flex items-center justify-between px-4 py-2 border-b last:border-0 hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{bs.student.fullName}</p>
                          <p className="text-xs text-gray-400">{bs.student.email}</p>
                        </div>
                        <button onClick={() => handleRemoveStudent(bs.studentId)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tests */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Assigned Tests ({detail.tests?.length || 0})</h3>
                  <button onClick={openAssignTests} className="rounded-xl bg-[linear-gradient(135deg,#0f766e_0%,#0f172a_100%)] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:opacity-95">+ Assign Tests</button>
                </div>
                {detail.tests?.length === 0 ? (
                  <p className="text-sm text-gray-400">No tests assigned to this batch</p>
                ) : (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {detail.tests?.map((bt: any) => (
                      <div key={bt.testId} className="flex items-center justify-between px-4 py-2 border-b last:border-0 hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{bt.test.title}</p>
                          <p className="text-xs text-gray-400">{bt.test.subject?.name} • {bt.test.type}</p>
                        </div>
                        <button onClick={() => handleRemoveTest(bt.testId)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AdminSurface>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Create'} Batch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={2} />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? t('app.loading') : t('common.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Students Modal */}
      {showAddStudents && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-lg font-semibold mb-4">Add Students to {detail?.name}</h2>
            <div className="border rounded-lg max-h-64 overflow-y-auto mb-4">
              {allStudents.length === 0 ? (
                <p className="text-sm text-gray-400 p-4 text-center">All students are already in this batch</p>
              ) : (
                allStudents.map((s: any) => (
                  <label key={s.id} className="flex items-center gap-3 px-4 py-2 border-b last:border-0 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={selectedStudentIds.includes(s.id)} onChange={() => setSelectedStudentIds(selectedStudentIds.includes(s.id) ? selectedStudentIds.filter((id) => id !== s.id) : [...selectedStudentIds, s.id])} className="rounded" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.fullName}</p>
                      <p className="text-xs text-gray-400">{s.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowAddStudents(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">{t('common.cancel')}</button>
              <button onClick={handleAddStudents} disabled={selectedStudentIds.length === 0} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40">Add {selectedStudentIds.length} Students</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Tests Modal */}
      {showAssignTests && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-lg font-semibold mb-4">Assign Tests to {detail?.name}</h2>
            <div className="border rounded-lg max-h-64 overflow-y-auto mb-4">
              {allTests.length === 0 ? (
                <p className="text-sm text-gray-400 p-4 text-center">All tests are already assigned</p>
              ) : (
                allTests.map((t: any) => (
                  <label key={t.id} className="flex items-center gap-3 px-4 py-2 border-b last:border-0 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={selectedTestIds.includes(t.id)} onChange={() => setSelectedTestIds(selectedTestIds.includes(t.id) ? selectedTestIds.filter((id) => id !== t.id) : [...selectedTestIds, t.id])} className="rounded" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.title}</p>
                      <p className="text-xs text-gray-400">{t.subject?.name} • {t.type}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowAssignTests(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">{t('common.cancel')}</button>
              <button onClick={handleAssignTests} disabled={selectedTestIds.length === 0} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40">Assign {selectedTestIds.length} Tests</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
