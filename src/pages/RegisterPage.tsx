import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Lock, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { generateId, generateReferralCode } from '../utils/helpers';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const { registerUser, getUserByEmail, getUserByReferralCode } = useDataStore();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: searchParams.get('ref') || '',
  });

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setForm((f) => ({ ...f, referralCode: ref }));
  }, [searchParams]);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.fullName.trim() || form.fullName.trim().split(' ').length < 2)
      return 'Please enter your full name (first and last name).';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      return 'Please enter a valid email address.';
    if (!form.phone || form.phone.length < 10)
      return 'Please enter a valid Ghana phone number.';
    if (!form.password || form.password.length < 8)
      return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword)
      return 'Passwords do not match.';
    if (getUserByEmail(form.email))
      return 'An account with this email already exists.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    let referredBy: string | undefined;
    if (form.referralCode.trim()) {
      const referrer = getUserByReferralCode(form.referralCode.trim().toUpperCase());
      if (referrer) referredBy = referrer.id;
    }

    const userId = generateId();
    const referralCode = generateReferralCode(form.fullName);

    const newUser = {
      id: userId,
      fullName: form.fullName.trim(),
      email: form.email.toLowerCase(),
      phone: form.phone,
      accountBalance: 0,
      referralCode,
      referredBy,
      joinedAt: new Date().toISOString(),
      investmentBalance: 0,
      taskBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalInvested: 0,
      referralInvestmentEarnings: 0,
      referralTaskEarnings: 0,
      isActive: true,
      isSuspended: false,
      password: form.password,
    };

    registerUser(newUser);

    login({
      id: userId,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      accountBalance: 0,
      referralCode,
      referredBy,
      joinedAt: newUser.joinedAt,
      investmentBalance: 0,
      taskBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalInvested: 0,
      referralInvestmentEarnings: 0,
      referralTaskEarnings: 0,
      isActive: true,
      isSuspended: false,
    });

    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo size="md" variant="light" />
          </Link>
          <p className="text-slate-400 mt-4">Create your account and start earning today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Create Account</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-red-600 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-700 text-sm font-semibold block mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="fullName"
                  type="text"
                  placeholder="Kwame Asante"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 text-sm font-semibold block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  placeholder="kwame@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 text-sm font-semibold block mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="0551234567"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-700 text-sm font-semibold block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-700 text-sm font-semibold block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-700 text-sm font-semibold block mb-1.5">
                Referral Code <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Gift size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="referralCode"
                  type="text"
                  placeholder="e.g. NXRKWAM7X"
                  value={form.referralCode}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 uppercase"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-blue-700 text-xs leading-relaxed">
                  By creating an account, you agree to our Terms of Service and acknowledge that all transactions require manual verification (3–59 mins).
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-base shadow-sm"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
