import { AdminEmptyState, AdminPageHeader } from '../../components/common/AdminTheme';

export function CertificatesPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Certificate center"
        title="Certificates"
        description="Manage certificate templates, issuance rules, and student award records from a single admin space."
      />

      <AdminEmptyState
        title="Certificate management is coming soon"
        description="This area is now visually aligned with the rest of the admin panel and ready for certificate workflows."
        icon="🏅"
      />
    </div>
  );
}
