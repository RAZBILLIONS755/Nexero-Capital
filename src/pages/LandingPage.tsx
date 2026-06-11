import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  TrendingUp, Shield, Users, Zap, ChevronRight, Star,
  CheckCircle, ArrowRight, Phone, BarChart3, Award, Clock,
  DollarSign, Target, Globe, Lock, Menu, X
} from 'lucide-react';

const plans = [
  { name: 'Starter Growth', amount: 50, daily: 3.45, color: 'from-emerald-400 to-teal-500' },
  { name: 'Bronze Wealth', amount: 120, daily: 8.28, color: 'from-amber-400 to-orange-500' },
  { name: 'Silver Income', amount: 200, daily: 13.80, color: 'from-slate-400 to-gray-500' },
  { name: 'Gold Profit', amount: 500, daily: 34.50, color: 'from-yellow-400 to-amber-500' },
  { name: 'Premium Capital', amount: 1000, daily: 69.00, color: 'from-blue-500 to-indigo-600' },
  { name: 'Diamond Capital', amount: 10000, daily: 690.00, color: 'from-purple-500 to-violet-600' },
];

const testimonials = [
  {
    name: 'Kwame Asante',
    location: 'Accra',
    text: 'Nexero Capital changed my financial life. I started with the Starter Plan and now I earn daily without stress.',
    rating: 5,
    avatar: 'KA',
  },
  {
    name: 'Abena Mensah',
    location: 'Kumasi',
    text: 'As a small business owner, this platform helped me grow my savings while earning through tasks. Highly recommended!',
    rating: 5,
    avatar: 'AM',
  },
  {
    name: 'Kofi Boateng',
    location: 'Takoradi',
    text: 'The referral system is amazing. I referred 5 friends and I earn commissions every time they invest or complete tasks.',
    rating: 5,
    avatar: 'KB',
  },
];

const features = [
  { icon: Shield, title: 'Secure & Trusted', desc: 'Bank-grade security with manual verification on every transaction.' },
  { icon: TrendingUp, title: 'Daily Earnings', desc: 'Earn daily returns on your investments for up to 365 days.' },
  { icon: Phone, title: 'MTN MoMo Payments', desc: 'Seamless deposits and withdrawals via Ghana Mobile Money.' },
  { icon: Users, title: 'Referral Rewards', desc: 'Earn commissions when your referrals invest or complete tasks.' },
  { icon: Zap, title: 'Task Earnings', desc: 'Start earning with zero capital through social media tasks.' },
  { icon: BarChart3, title: 'Transparent Returns', desc: 'Clear daily earning calculations with full breakdown visibility.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="sm" />
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">Features</a>
              <a href="#plans" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">Investment Plans</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">How It Works</a>
              <a href="#testimonials" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">Testimonials</a>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign In
              </button>
              <a href="/admin/login" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Admin</a>
              <button
                onClick={() => navigate('/register')}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                Get Started
              </button>
            </div>
            <button
              className="md:hidden p-2 rounded-lg text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
            <a href="#features" className="block text-slate-700 text-sm font-medium py-2">Features</a>
            <a href="#plans" className="block text-slate-700 text-sm font-medium py-2">Investment Plans</a>
            <a href="#how-it-works" className="block text-slate-700 text-sm font-medium py-2">How It Works</a>
            <a href="#testimonials" className="block text-slate-700 text-sm font-medium py-2">Testimonials</a>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-2.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg"
              >
                Sign In
              </button>
              <a href="/admin/login" target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg text-center">Admin</a>
              <button
                onClick={() => navigate('/register')}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/92 via-blue-950/88 to-indigo-950/92" />

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-400/10"
              style={{
                width: Math.random() * 200 + 50,
                height: Math.random() * 200 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `pulse ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-blue-200 text-sm font-medium">Ghana's #1 Investment & Task Earning Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Build Your Wealth
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Without Startup Capital
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-10 max-w-3xl mx-auto">
              Nexero Capital empowers small business owners and everyday Ghanaians to earn daily income through structured investment plans, simple social media tasks, and a rewarding referral system — all in Ghana Cedis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => navigate('/register')}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-900/40 text-lg"
              >
                Start Earning Today
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/20 text-lg"
              >
                Sign In to Dashboard
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: 'Active Investors', value: '12,400+' },
                { label: 'Daily Payouts', value: 'GHC 340K+' },
                { label: 'Investment Plans', value: '10 Plans' },
                { label: 'Uptime', value: '99.9%' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl p-4">
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-4">
              Everything You Need to Grow
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              A complete financial empowerment ecosystem built for Ghana — from first deposit to daily earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <feature.icon size={24} className="text-blue-600" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Plans Preview */}
      <section id="plans" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Investment Plans</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-4">
              Choose Your Growth Path
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              10 structured investment plans ranging from GHC 50 to GHC 10,000, each delivering daily earnings for 365 days.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {plans.map((plan, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className={`h-2 bg-gradient-to-r ${plan.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{plan.name} Plan</h3>
                      <p className="text-slate-500 text-sm mt-1">365-day validity</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-sm`}>
                      <TrendingUp size={18} className="text-white" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-slate-500 text-sm">Investment</span>
                      <span className="font-bold text-slate-900">GHC {plan.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-500 text-sm">Daily Earnings</span>
                      <span className="font-black text-emerald-600 text-lg">GHC {plan.daily.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                  >
                    Invest Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold rounded-xl transition-all"
            >
              View All 10 Plans <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-900 to-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3 mb-4">
              How Nexero Capital Works
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Get started in minutes. No experience required. Just register, deposit, and watch your money grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Create Your Account',
                desc: 'Register with your name, phone number, and Ghana Mobile Money details. Get your unique referral code instantly.',
                color: 'text-blue-400',
              },
              {
                step: '02',
                icon: Phone,
                title: 'Deposit via MTN MoMo',
                desc: 'Send your chosen amount to our MTN MoMo number. Submit your reference number for manual verification within 24 hours.',
                color: 'text-emerald-400',
              },
              {
                step: '03',
                icon: TrendingUp,
                title: 'Earn Daily Returns',
                desc: 'Select your investment plan and start earning daily. Withdraw earnings or complete tasks for additional income.',
                color: 'text-amber-400',
              },
            ].map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex w-16 h-16 rounded-2xl bg-white/10 border border-white/20 items-center justify-center mb-6">
                  <step.icon size={28} className={step.color} />
                </div>
                <div className={`text-6xl font-black ${step.color} opacity-20 absolute top-0 right-1/4 -translate-y-2`}>
                  {step.step}
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[40%] border-t-2 border-dashed border-white/20" />
                )}
              </div>
            ))}
          </div>

          {/* Task Earning Banner */}
          <div className="bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/30 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={20} className="text-yellow-400" />
                  <span className="text-yellow-400 font-semibold text-sm">Zero Capital Required</span>
                </div>
                <h3 className="text-white text-2xl font-black mb-2">Start with Task Earnings</h3>
                <p className="text-slate-300">
                  No money to invest? Complete simple social media tasks and earn GHC 3 – GHC 10 per task.
                  Accumulate GHC 50 and withdraw your task earnings at any time.
                </p>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="shrink-0 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black rounded-xl transition-colors text-lg"
              >
                Start Free Tasks
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Referral Program</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-6">
                Earn More When You Share
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Share your unique referral link with friends and family. Every time they invest or complete a task, you earn a commission — automatically credited to your account.
              </p>
              <div className="space-y-4">
                {[
                  { icon: DollarSign, title: 'Investment Referral Commission', desc: 'Earn a % when your referral makes a deposit or investment. Credited to your investment balance.', color: 'text-emerald-600 bg-emerald-50' },
                  { icon: Target, title: 'Task Referral Commission', desc: 'Earn when your referred user completes tasks. Credited to your task earnings account.', color: 'text-blue-600 bg-blue-50' },
                  { icon: Globe, title: 'Unlimited Referrals', desc: 'There\'s no cap on how many people you can refer. The more you share, the more you earn.', color: 'text-purple-600 bg-purple-50' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 rounded-xl border border-slate-100">
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/register')}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                Get My Referral Link <ArrowRight size={18} />
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-blue-400" />
                </div>
                <div>
                  <div className="font-bold">Your Referral Dashboard</div>
                  <div className="text-slate-400 text-sm">Live commission tracking</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/8 rounded-xl p-4 border border-white/10">
                  <div className="text-slate-400 text-xs mb-1">Total Referrals</div>
                  <div className="text-3xl font-black">24</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4">
                    <div className="text-emerald-400 text-xs mb-1">Investment Commissions</div>
                    <div className="text-xl font-black text-emerald-300">GHC 840</div>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                    <div className="text-blue-400 text-xs mb-1">Task Commissions</div>
                    <div className="text-xl font-black text-blue-300">GHC 120</div>
                  </div>
                </div>
                <div className="bg-white/8 rounded-xl p-4 border border-white/10">
                  <div className="text-slate-400 text-xs mb-2">Your Referral Link</div>
                  <div className="bg-white/10 rounded-lg px-3 py-2 font-mono text-sm text-blue-300 break-all">
                    nexerocapital.gh/ref/NXR<span className="text-white">KWAME7X</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-4">
              What Our Members Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-slate-400 text-xs">{t.location}, Ghana</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Lock, label: 'Secure Transactions' },
              { icon: Clock, label: '24-Hour Verification' },
              { icon: Award, label: 'Certified Platform' },
              { icon: CheckCircle, label: 'Verified Payouts' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <item.icon size={22} className="text-blue-600" />
                </div>
                <span className="text-slate-700 font-semibold text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            Ready to Start Your Financial Journey?
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Join over 12,000 Ghanaians who are already earning daily income with Nexero Capital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-white text-blue-600 font-black rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-xl"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-white/20 text-white font-black rounded-xl hover:bg-white/30 transition-colors text-lg border border-white/30"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-1 md:col-span-2">
              <Logo size="sm" variant="light" />
              <p className="mt-4 text-slate-500 text-sm leading-relaxed max-w-xs">
                Nexero Capital is Ghana's trusted platform for investment, task-based earning, and financial empowerment for small business owners and individuals.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#plans" className="hover:text-white transition-colors">Investment Plans</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Task Earnings</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/register')}>Register</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Phone size={14} /> 0551 234 567</li>
                <li>support@nexerocapital.gh</li>
                <li>Mon – Sat, 8AM – 8PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 Nexero Capital Limited. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-white transition-colors cursor-pointer">Disclaimer</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
