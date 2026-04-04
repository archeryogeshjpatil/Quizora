import { useLanguage } from '../../context/LanguageContext';

export function LanguageSelector({
  variant = 'shell',
}: {
  variant?: 'shell' | 'auth';
}) {
  const { language, changeLanguage, languages } = useLanguage();
  const selectClass =
    variant === 'auth'
      ? 'cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-[13px] text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 hover:bg-slate-50 transition'
      : 'cursor-pointer rounded-xl border border-white/15 bg-white/[0.12] px-3.5 py-1.5 text-[13px] text-white shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-300 hover:bg-white/[0.18] transition';

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      className={selectClass}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code} className="bg-white text-slate-900">
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
