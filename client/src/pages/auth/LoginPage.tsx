import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from '../../components/common/LanguageSelector';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier, password);
      if (user.role === 'STUDENT') navigate('/student', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-xl backdrop-blur-sm">Q</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Quizora</h1>
              <p className="text-xs text-teal-200">by Archer Infotech</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Welcome Back,<br />Student!</h2>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Access your exams, track your performance, and earn certificates — all in one place.
          </p>
          <div className="flex gap-6 mt-12 text-teal-200 text-sm">
            <div><span className="text-2xl font-bold text-white block">AI</span>Powered Exams</div>
            <div><span className="text-2xl font-bold text-white block">5+</span>Question Types</div>
            <div><span className="text-2xl font-bold text-white block">3</span>Languages</div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold">Q</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Quizora</h1>
                <p className="text-[10px] text-gray-400">by Archer Infotech</p>
              </div>
            </div>
            <div className="hidden lg:block" />
            <LanguageSelector variant="auth" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('auth.loginAsStudent')}</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your credentials to access your dashboard</p>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.email')} / {t('auth.mobile')}</label>
              <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-sm" placeholder="Enter email or mobile" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.password')}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-sm" placeholder="Enter password" required />
            </div>

            <div className="flex justify-end"><Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-800">{t('auth.forgotPassword')}</Link></div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition disabled:opacity-50 shadow-sm">
              {loading ? t('app.loading') : t('auth.signIn')}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-500">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-teal-600 hover:text-teal-800 font-medium">{t('auth.signUp')}</Link>
            </p>
            <Link to="/admin/login" className="text-xs text-gray-400 hover:text-gray-600 inline-block">{t('auth.loginAsAdmin')}</Link>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-8">Powered by <a href="https://archerinfotech.com" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:text-teal-600">Archer Infotech</a>, Pune</p>
        </div>
      </div>
    </div>
  );
}
