import { ReactNode } from 'react';

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#ecfeff_0%,#f8fafc_44%,#ecfdf5_100%)] px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.15),transparent_28%),radial-gradient(circle_at_85%_25%,rgba(16,185,129,0.12),transparent_22%),linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.46)_48%,transparent_72%)]" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <span className="inline-flex rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700 shadow-sm">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
        </div>
        {actions && <div className="relative flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function AdminSurface({
  children,
  className,
  tinted = false,
}: {
  children: ReactNode;
  className?: string;
  tinted?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-slate-200 shadow-[0_16px_50px_rgba(15,23,42,0.06)]',
        tinted ? 'bg-[linear-gradient(135deg,#f0fdfa_0%,#ffffff_45%,#eff6ff_100%)]' : 'bg-white',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.08),transparent_22%),linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.42)_48%,transparent_76%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function AdminSectionTitle({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminMetricCard({
  label,
  value,
  accent,
  icon,
}: {
  label: ReactNode;
  value: ReactNode;
  accent?: string;
  icon?: ReactNode;
}) {
  return (
    <AdminSurface className="p-5" tinted>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={cn('mt-2 text-3xl font-bold text-slate-900', accent)}>{value}</p>
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e_0%,#0f172a_100%)] text-white shadow-[0_12px_30px_rgba(15,118,110,0.22)]">
            {icon}
          </div>
        )}
      </div>
    </AdminSurface>
  );
}

export function AdminEmptyState({
  title,
  description,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <AdminSurface className="p-12 text-center" tinted>
      {icon && <div className="mb-3 text-5xl text-slate-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>}
    </AdminSurface>
  );
}

export const adminButtonPrimary =
  'rounded-2xl bg-[linear-gradient(135deg,#0f766e_0%,#0f172a_100%)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(15,118,110,0.22)] transition hover:opacity-95';

export const adminButtonSecondary =
  'rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50';

export const adminFilterClass =
  'rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-teal-400';

export function AdminFilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <AdminSurface className={cn('mb-5 p-4 sm:p-5', className)} tinted>
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">{children}</div>
    </AdminSurface>
  );
}

export function AdminDataTable({
  header,
  children,
  className,
}: {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AdminSurface className={cn('overflow-hidden', className)}>
      {header && (
        <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,#f0fdfa_0%,#f8fafc_56%,#ecfeff_100%)] px-5 py-4">
          {header}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full">{children}</table>
      </div>
    </AdminSurface>
  );
}

export function AdminModal({
  title,
  description,
  icon,
  children,
  onClose,
  widthClass = 'max-w-xl',
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  widthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className={cn('w-full overflow-hidden rounded-[30px] border border-white/15 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.3)]', widthClass)}>
        <div className="relative overflow-hidden border-b border-slate-200/80 bg-[linear-gradient(135deg,#ecfeff_0%,#f8fafc_42%,#ecfdf5_100%)] px-6 py-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.14),transparent_28%),linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.4)_48%,transparent_72%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {icon && (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#0f766e_0%,#0f172a_100%)] text-white shadow-[0_14px_28px_rgba(15,118,110,0.22)]">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              x
            </button>
          </div>
        </div>
        <div className="max-h-[78vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
