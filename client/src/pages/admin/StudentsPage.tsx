import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, BadgeCheck, Search, UserCircle2, Users } from 'lucide-react';
import { userService } from '../../services/user.service';
import { User } from '../../types';
import {
  AdminDataTable,
  AdminEmptyState,
  AdminFilterBar,
  AdminModal,
  AdminPageHeader,
  AdminSurface,
  adminButtonPrimary,
  adminFilterClass,
} from '../../components/common/AdminTheme';

export function StudentsPage() {
  const { t } = useTranslation();
  const [students, setStudents] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Student detail
  const [detailStudent, setDetailStudent] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await userService.getAll(params);
      setStudents(res.data.users);
      setTotal(res.data.total);
    } catch {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await userService.toggleStatus(id);
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'INACTIVE': return 'bg-red-100 text-red-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Student management"
        title={t('nav.students')}
        description={`${total} students registered. Search, filter, review profiles, and activate or deactivate accounts.`}
      />

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      {/* Search & Filter */}
      <AdminFilterBar>
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t('common.search')} by name, email, or mobile...`}
            className={`flex-1 ${adminFilterClass}`}
          />
          <button type="submit" className={`${adminButtonPrimary} inline-flex items-center gap-2`}><Search className="h-4 w-4" />{t('common.search')}</button>
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={adminFilterClass}>
          <option value="">{t('common.all')} Status</option>
          <option value="ACTIVE">{t('common.active')}</option>
          <option value="INACTIVE">{t('common.inactive')}</option>
          <option value="PENDING">{t('common.pending')}</option>
        </select>
      </AdminFilterBar>

      {/* Students Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : students.length === 0 ? (
        <AdminEmptyState title={t('common.noData')} description="No student records match the current filters." icon="🎓" />
      ) : (
        <AdminDataTable
          header={
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">Learner directory</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Registered students</h2>
              </div>
              <div className="rounded-2xl border border-teal-200 bg-white/85 px-3 py-2 text-right shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Total</p>
                <p className="text-lg font-bold text-slate-900">{total}</p>
              </div>
            </div>
          }
        >
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('auth.fullName')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('auth.email')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('auth.mobile')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Registered</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student, i) => (
              <tr key={student.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm text-gray-500">{(page - 1) * 20 + i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.fullName}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{student.email}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{student.mobile}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(student.status)}`}>{student.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(student.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={async () => {
                    setDetailLoading(true);
                    try { const res = await userService.getById(student.id); setDetailStudent(res.data); }
                    catch {} finally { setDetailLoading(false); }
                  }} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">View</button>
                  <button onClick={() => handleToggleStatus(student.id)} className={`text-sm font-medium ${student.status === 'ACTIVE' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}>
                    {student.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminDataTable>
      )}
      {/* Student Detail Modal */}
      {detailStudent && (
        <AdminModal
          title="Student Profile"
          description="Review identity, status, performance summary, attempt history, and certificates."
          icon={<UserCircle2 className="h-5 w-5" />}
          onClose={() => setDetailStudent(null)}
          widthClass="max-w-3xl"
        >

            {/* Profile Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{detailStudent.fullName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{detailStudent.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Mobile</p>
                <p className="font-medium text-gray-900">{detailStudent.mobile}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Status</p>
                <p className={`font-medium ${detailStudent.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{detailStudent.status}</p>
              </div>
            </div>

            {/* Stats */}
            {detailStudent.stats && (
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="mb-2 flex justify-center text-blue-700"><Activity className="h-4 w-4" /></div>
                  <p className="text-xl font-bold text-blue-700">{detailStudent.stats.totalAttempts}</p>
                  <p className="text-[10px] text-gray-500">Tests Taken</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="mb-2 flex justify-center text-green-700"><BadgeCheck className="h-4 w-4" /></div>
                  <p className="text-xl font-bold text-green-700">{detailStudent.stats.avgPercentage ?? '—'}%</p>
                  <p className="text-[10px] text-gray-500">Avg Score</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="mb-2 flex justify-center text-purple-700"><Users className="h-4 w-4" /></div>
                  <p className="text-xl font-bold text-purple-700">{detailStudent.stats.bestPercentage ?? '—'}%</p>
                  <p className="text-[10px] text-gray-500">Best Score</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="mb-2 flex justify-center text-orange-700"><BadgeCheck className="h-4 w-4" /></div>
                  <p className="text-xl font-bold text-orange-700">{detailStudent.stats.certificatesEarned}</p>
                  <p className="text-[10px] text-gray-500">Certificates</p>
                </div>
              </div>
            )}

            {/* Attempt History */}
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Attempt History</h3>
            {detailStudent.attempts?.length === 0 ? (
              <p className="text-sm text-gray-400">No attempts yet</p>
            ) : (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {detailStudent.attempts?.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.test?.title}</p>
                      <p className="text-[10px] text-gray-400">{a.test?.subject?.name} • {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN') : '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${(a.percentage || 0) >= 60 ? 'text-green-600' : 'text-red-600'}`}>{a.percentage ?? '—'}%</p>
                      <p className="text-[10px] text-gray-400">{a.score}/{a.totalMarks}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Certificates */}
            {detailStudent.certificates?.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Certificates Earned</h3>
                <div className="space-y-2">
                  {detailStudent.certificates.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-2">
                      <span className="text-sm text-gray-800">{c.test?.title}</span>
                      <span className="text-xs text-green-700 font-medium">{c.percentage}% — {c.certificateId}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </AdminModal>
      )}
    </div>
  );
}
