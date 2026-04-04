import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from '../../components/common/LanguageSelector';

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register({ fullName: form.fullName, email: form.email, mobile: form.mobile, password: form.password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0"><div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" /><div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" /></div>
        <div className="relative flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm">Q</div>
            <div><h1 className="text-2xl font-bold text-white">Quizora</h1><p className="text-xs text-teal-200">by Archer Infotech</p></div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Join the Smart<br />Exam Platform</h2>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">Create your free account, take exams, track your progress, and earn certificates.</p>
          <div className="mt-12 space-y-3">
            {['Take official & practice tests', 'AI-powered answer explanations', 'Performance analytics & leaderboard', 'Downloadable PDF certificates'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-blue-100">
                <svg className="w-5 h-5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold">Q</div>
              <h1 className="text-xl font-bold text-gray-900">Quizora</h1>
            </div>
            <div className="hidden lg:block" />
            <LanguageSelector variant="auth" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('auth.register')}</h2>
          <p className="text-sm text-gray-500 mb-6">Create your student account</p>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label><input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label><input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.mobile')}</label><input type="tel" name="mobile" value={form.mobile} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label><input type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm" required minLength={8} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label><input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-gray-50 text-sm" required /></div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition disabled:opacity-50 shadow-sm">{loading ? t('app.loading') : t('auth.signUp')}</button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">{t('auth.hasAccount')}{' '}<Link to="/login" className="text-teal-600 hover:text-blue-800 font-medium">{t('auth.signIn')}</Link></p>
          <p className="text-center text-[10px] text-gray-400 mt-6">Powered by <a href="https://archerinfotech.com" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:text-teal-600">Archer Infotech</a>, Pune</p>
        </div>
      </div>
    </div>
  );
}
