import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { seriesService } from '../../services/series.service';
import { testService } from '../../services/test.service';
import { Test } from '../../types';
import { AdminEmptyState, AdminPageHeader, AdminSurface, adminButtonPrimary } from '../../components/common/AdminTheme';

export function SeriesPage() {
  const { t } = useTranslation();
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    scoringMethod: 'SUM',
    passingPercentage: 60,
    enableCertificate: false,
  });
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);

  // Detail
  const [detailSeries, setDetailSeries] = useState<any>(null);

  const fetchAll = async () => {
    try {
      const [seriesRes, testsRes] = await Promise.all([seriesService.getAll(), testService.getAll()]);
      setSeriesList(seriesRes.data);
      setTests(testsRes.data.filter((t: Test) => t.type === 'OFFICIAL'));
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', scoringMethod: 'SUM', passingPercentage: 60, enableCertificate: false });
    setSelectedTestIds([]);
    setShowForm(true);
    setError('');
  };

  const openEdit = (series: any) => {
    setEditing(series);
    setForm({
      name: series.name,
      description: series.description || '',
      scoringMethod: series.scoringMethod,
      passingPercentage: series.passingPercentage || 60,
      enableCertificate: series.enableCertificate,
    });
    setSelectedTestIds(series.tests?.map((t: any) => t.testId) || []);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Series name is required'); return; }
    if (selectedTestIds.length === 0) { setError('Select at least one test'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await seriesService.update(editing.id, { ...form, testIds: selectedTestIds });
      } else {
        await seriesService.create({ ...form, testIds: selectedTestIds });
      }
      setShowForm(false);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save series');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this series?')) return;
    try { await seriesService.remove(id); fetchAll(); }
    catch (err: any) { setError(err.response?.data?.error || 'Failed to delete'); }
  };

  const toggleTest = (testId: string) => {
    setSelectedTestIds(selectedTestIds.includes(testId)
      ? selectedTestIds.filter((id) => id !== testId)
      : [...selectedTestIds, testId]);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Test collections"
        title={t('nav.series')}
        description="Combine official tests into reusable series with scoring rules, passing thresholds, and certificates."
        actions={
          <button onClick={openCreate} className={adminButtonPrimary}>
          + {t('common.create')} Series
          </button>
        }
      />

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      {/* Series List */}
      {seriesList.length === 0 ? (
        <AdminEmptyState title={t('common.noData')} description="Create a test series to bundle multiple official tests into one learning path." icon="📚" />
      ) : (
        <div className="space-y-4">
          {seriesList.map((series) => (
            <AdminSurface key={series.id} className="p-5" tinted>
              <div className="flex items-start justify-between">
                <div className="cursor-pointer flex-1" onClick={() => setDetailSeries(detailSeries?.id === series.id ? null : series)}>
                  <h3 className="text-lg font-semibold text-gray-900">{series.name}</h3>
                  {series.description && <p className="text-sm text-gray-500 mt-1">{series.description}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>{series.tests?.length || 0} tests</span>
                    <span>Scoring: {series.scoringMethod}</span>
                    {series.passingPercentage && <span>Passing: {series.passingPercentage}%</span>}
                    {series.enableCertificate && <span className="text-green-600">Certificate enabled</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(series)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">{t('common.edit')}</button>
                  <button onClick={() => handleDelete(series.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">{t('common.delete')}</button>
                </div>
              </div>

              {/* Expanded detail */}
              {detailSeries?.id === series.id && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Tests in Series</h4>
                  <div className="space-y-2">
                    {series.tests?.map((st: any, i: number) => (
                      <div key={st.testId} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 shadow-sm">
                        <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                        <span className="text-sm font-medium text-gray-800 flex-1">{st.test?.title}</span>
                        <span className="text-xs text-gray-400">{st.test?.subject?.name}</span>
                        <span className="text-xs text-gray-400">{st.test?._count?.questions || 0} Q</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AdminSurface>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-6">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <h2 className="text-lg font-semibold mb-4">{editing ? t('common.edit') : t('common.create')} Series</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Series Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scoring Method</label>
                  <select value={form.scoringMethod} onChange={(e) => setForm({ ...form, scoringMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                    <option value="SUM">Sum of Scores</option>
                    <option value="AVERAGE">Average Percentage</option>
                    <option value="WEIGHTED_AVERAGE">Weighted Average</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing %</label>
                  <input type="number" value={form.passingPercentage} onChange={(e) => setForm({ ...form, passingPercentage: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min={0} max={100} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.enableCertificate} onChange={(e) => setForm({ ...form, enableCertificate: e.target.checked })} className="rounded" />
                Enable series-level certificate
              </label>

              {/* Test Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Tests ({selectedTestIds.length} selected)</label>
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {tests.map((test) => (
                    <label key={test.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 border-b last:border-0 cursor-pointer">
                      <input type="checkbox" checked={selectedTestIds.includes(test.id)} onChange={() => toggleTest(test.id)} className="rounded" />
                      <span className="text-sm flex-1">{test.title}</span>
                      <span className="text-xs text-gray-400">{test.subject?.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? t('app.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
