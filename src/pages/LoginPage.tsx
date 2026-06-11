import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { getUserByEmail } = useDataStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    // If admin credentials are entered on the regular login page, redirect to the dedicated admin login
    if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setLoading(false);
      navigate('/admin/login');
      return;
    }

    const user = getUserByEmail(email);
    if (!user || user.password !== password) {
      setError('Invalid email address or password. Please try again.');
      setLoading(false);
      return;
    }

    if (user.isSuspended) {
      setError('Your account has been suspended. Please contact support.');
      setLoading(false);
      return;
    }

    login({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      accountBalance: user.accountBalance,
      momoNumber: user.momoNumber,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      joinedAt: user.joinedAt,
      investmentBalance: user.investmentBalance,
      taskBalance: user.taskBalance,
      totalDeposited: user.totalDeposited,
      totalWithdrawn: user.totalWithdrawn,
      totalInvested: user.totalInvested,
      referralInvestmentEarnings: user.referralInvestmentEarnings,
      referralTaskEarnings: user.referralTaskEarnings,
      isActive: user.isActive,
      isSuspended: user.isSuspended,
    });

    setLoading(false);
    // ensure router sees updated auth state before navigating
    setTimeout(() => navigate('/dashboard'), 50);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo size="md" variant="light" />
          </Link>
          <p className="text-slate-400 mt-4">Welcome back. Sign in to your account.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Sign In</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-red-600 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-700 text-sm font-semibold block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 text-sm font-semibold">Password</label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-9 pr-10 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-base shadow-sm mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          All transactions are manually verified within 3-59 minutes.
        </p>
      </div>
    </div>
  );
}
