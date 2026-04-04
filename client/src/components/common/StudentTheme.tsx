import { ReactNode } from 'react';

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function StudentPageHero({
  eyebrow,
  title,
  description,
  icon,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[30px] border border-slate-300/80 bg-[linear-gradient(135deg,#dbeafe_0%,#c7d2fe_26%,#e2e8f0_78%,#f8fafc_100%)] px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(59,130,246,0.18),transparent_20%),linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.24)_48%,transparent_74%)]" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-slate-950/90 text-2xl text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)]">
              {icon}
            </div>
          )}
          <div>
            <span className="inline-flex rounded-full border border-slate-300/80 bg-slate-950/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm">
              {eyebrow}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
            {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
          </div>
        </div>
        {actions && <div className="relative flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function StudentSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-[26px] border border-slate-300/80 bg-[linear-gradient(160deg,#ffffff_0%,#f8fafc_58%,#e2e8f0_100%)] shadow-[0_18px_42px_rgba(15,23,42,0.08)]', className)}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(30,64,175,0.04)_0%,transparent_24%),linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.42)_48%,transparent_74%)]" />
      <div className="pointer-events-none absolute -right-10 top-0 h-24 w-24 rounded-full bg-blue-100/50 blur-2xl" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function StudentEmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <StudentSurface className="p-14 text-center">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </StudentSurface>
  );
}

export const studentFilterClass =
  'rounded-2xl border border-slate-300 bg-white/85 px-4 py-2.5 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400';

export function StudentFilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <StudentSurface className={cn('mb-5 p-4 sm:p-5', className)}>
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">{children}</div>
    </StudentSurface>
  );
}

export function StudentDataTable({
  header,
  children,
  className,
}: {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <StudentSurface className={cn('overflow-hidden', className)}>
      {header && (
        <div className="border-b border-slate-300/80 bg-[linear-gradient(135deg,#dbeafe_0%,#e2e8f0_58%,#f8fafc_100%)] px-5 py-4">
          {header}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full">{children}</table>
      </div>
    </StudentSurface>
  );
}
