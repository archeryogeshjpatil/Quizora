import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { StudentEmptyState, StudentPageHero, StudentSurface } from '../../components/common/StudentTheme';

export function StudentCertificatesPage() {
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates/my-certificates').then((res) => setCertificates(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" /></div>;

  return (
    <div className="animate-fade-in">
      <StudentPageHero
        eyebrow="Achievement archive"
        title={t('nav.certificates')}
        description="Browse certificates earned from official tests and download polished records whenever you need them."
        icon="🏅"
      />

      {certificates.length === 0 ? (
        <StudentEmptyState icon="🎓" title="No Certificates Yet" description="Pass official tests to earn certificates." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {certificates.map((cert: any) => (
            <StudentSurface key={cert.id} className="overflow-hidden">
              <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_36%,#334155_100%)] p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100/80">Certificate of achievement</p>
                    <h3 className="mt-2 text-xl font-semibold">{cert.test?.title}</h3>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/12 text-2xl backdrop-blur-sm">
                    🏅
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-5 grid grid-cols-2 gap-4">
                  <div className="rounded-[22px] border border-slate-200 bg-white/80 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Subject</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{cert.test?.subject?.name}</p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-white/80 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Score</p>
                    <p className="mt-2 text-sm font-semibold text-blue-700">{cert.score} ({cert.percentage}%)</p>
                  </div>
                </div>

                <div className="mb-5 rounded-[22px] border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Certificate ID</p>
                  <p className="mt-2 break-all font-mono text-sm text-slate-700">{cert.certificateId}</p>
                </div>

                <a
                  href={`/api/certificates/download/${cert.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#1d4ed8_0%,#0f172a_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)] transition hover:opacity-95"
                >
                  📥 {t('result.downloadCertificate')}
                </a>
              </div>
            </StudentSurface>
          ))}
        </div>
      )}
    </div>
  );
}
