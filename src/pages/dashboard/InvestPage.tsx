import { useState } from 'react';
import { CheckCircle, AlertCircle, Zap, Calendar, DollarSign, Clock, Info } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { generateId, formatCurrency, calculateDailyEarning, getDaysRemaining, formatDate, getStatusColor } from '../../utils/helpers';

  const planColors: Record<string, string> = {
  starter: 'from-emerald-400 to-teal-500',
  bronze: 'from-amber-400 to-orange-500',
  silver: 'from-slate-400 to-gray-500',
  smart: 'from-cyan-400 to-blue-500',
  gold: 'from-yellow-400 to-amber-500',
  premium: 'from-blue-500 to-indigo-600',
  elite: 'from-purple-400 to-violet-500',
  executive: 'from-rose-400 to-pink-500',
  platinum: 'from-sky-400 to-cyan-600',
  diamond: 'from-violet-500 to-purple-700',
  custom: 'from-teal-400 to-emerald-600',
};

  const planEmoji: Record<string, string> = {
    starter: '🌱',
    bronze: '🥉',
    silver: '🥈',
    smart: '💡',
    gold: '🔥',
    premium: '🚀',
    elite: '👑',
    executive: '🏅',
    platinum: '💠',
    diamond: '💎',
    custom: '✨',
  };

export default function InvestPage() {
  const { user, updateUser } = useAuthStore();
  const { investmentPlans, investments, addInvestment, addTransaction, updateInvestment, updateUserData, getUserById, adminConfig } = useDataStore();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const freshUser = user ? getUserById(user.id) : null;
  const u = freshUser || user;

  const userInvestments = investments.filter((i) => i.userId === user?.id);
  const activeInvestments = userInvestments.filter((i) => i.status === 'active');

  const handleInvest = (planId: string) => {
    setError('');
    setSuccess('');

    const plan = investmentPlans.find((p) => p.id === planId);
    if (!plan) return;

    const amount = plan.isCustom ? parseFloat(customAmount) : plan.amount;

    if (!amount || isNaN(amount)) { setError('Please enter a valid amount.'); return; }
    if (amount < adminConfig.minDeposit) {
      setError(`Minimum investment is ${formatCurrency(adminConfig.minDeposit)}.`);
      return;
    }
    if (amount > adminConfig.maxDailyDeposit) {
      setError(`Maximum single investment is ${formatCurrency(adminConfig.maxDailyDeposit)}.`);
      return;
    }
      if ((u?.accountBalance || 0) < amount) {
        setError(`Insufficient funds. Your account balance is ${formatCurrency(u?.accountBalance || 0)}.`);
      return;
    }

    const dailyEarning = plan.isCustom ? calculateDailyEarning(amount) : plan.dailyEarning;
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 365);

    const investmentId = generateId();
    const newBalance = (u?.accountBalance || 0) - amount;

    addInvestment({
      id: investmentId,
      userId: user!.id,
      planId,
      planName: plan.isCustom ? `Custom Plan (${formatCurrency(amount)})` : plan.name,
      amount,
      dailyEarning,
      totalEarned: 0,
      startDate: startDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      status: 'active',
    });

    addTransaction({
      id: generateId(),
      userId: user!.id,
      type: 'investment',
      amount,
      status: 'approved',
      planName: plan.name,
      createdAt: new Date().toISOString(),
    });

    updateUserData(user!.id, {
      accountBalance: parseFloat(newBalance.toFixed(2)),
      totalInvested: parseFloat(((u?.totalInvested || 0) + amount).toFixed(2)),
    });

    updateUser({ accountBalance: parseFloat(newBalance.toFixed(2)) });

    setSuccess(`Successfully invested ${formatCurrency(amount)} in ${plan.isCustom ? 'Custom Plan' : plan.name}! Daily earnings: ${formatCurrency(dailyEarning)}.`);
    setSelectedPlan(null);
    setCustomAmount('');
  };

  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = (invId: string) => {
    setError('');
    setSuccess('');
    const inv = investments.find((i) => i.id === invId);
    if (!inv || inv.status !== 'active') { setError('Investment not found or not active.'); return; }

    const last = inv.lastEarningDate ? new Date(inv.lastEarningDate) : new Date(inv.startDate);
    const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    if (next > now) {
      setError('Claim not yet available.');
      return;
    }

    setClaimingId(invId);

    // update investment record
    updateInvestment(invId, {
      totalEarned: parseFloat((inv.totalEarned + inv.dailyEarning).toFixed(2)),
      lastEarningDate: new Date().toISOString(),
    });

    // credit user's investment earnings (withdrawable)
    const usr = getUserById(inv.userId);
    if (usr) {
      updateUserData(inv.userId, {
        investmentBalance: parseFloat(((usr.investmentBalance || 0) + inv.dailyEarning).toFixed(2)),
      });
      if (user?.id === inv.userId) {
        updateUser({ investmentBalance: parseFloat(((user?.investmentBalance || 0) + inv.dailyEarning).toFixed(2)) });
      }

      // pay referral commission to referrer as investment earnings
      if (usr.referredBy) {
        const referrer = getUserById(usr.referredBy);
        if (referrer) {
          const commissionRate = adminConfig.referralInvestmentRate || 5;
          const commission = parseFloat(((commissionRate / 100) * inv.dailyEarning).toFixed(2));
          updateUserData(referrer.id, {
            investmentBalance: parseFloat((referrer.investmentBalance + commission).toFixed(2)),
            referralInvestmentEarnings: parseFloat((referrer.referralInvestmentEarnings + commission).toFixed(2)),
          });
        }
      }
    }

    setSuccess(`Claimed ${formatCurrency(inv.dailyEarning)} for ${inv.planName}.`);
    setClaimingId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Investment Plans</h2>
        <p className="text-slate-500 mt-1">Choose a plan and start earning daily returns for 365 days.</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-blue-200 text-sm">Account Balance (deposits available to invest)</p>
            <p className="text-3xl font-black mt-1">{formatCurrency(u?.accountBalance || 0)}</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 text-center">
              <div className="text-blue-200 text-xs">Active Plans</div>
              <div className="text-white font-black text-xl">{activeInvestments.length}</div>
            </div>
            <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 text-center">
              <div className="text-blue-200 text-xs">Total Invested</div>
              <div className="text-white font-black text-lg">{formatCurrency(u?.totalInvested || 0)}</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm">
          <CheckCircle size={16} className="shrink-0" /> {success}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-blue-800 text-sm">
          All investment plans have a <strong>365-day validity period</strong>. Daily earnings are credited to your investment balance. Higher capital plans yield proportionally higher daily returns.
        </p>
      </div>

      {/* Investment Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {investmentPlans.filter((p) => p.isActive && !p.isCustom).map((plan) => {
          const colorClass = planColors[plan.category] || 'from-blue-500 to-indigo-600';
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${
                isSelected ? 'border-blue-500 shadow-blue-100' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
              }`}
            >
              <div className={`h-1.5 rounded-t-2xl bg-gradient-to-r ${colorClass}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{plan.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">365-day plan • Daily credits</p>
                  </div>
                  <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-sm`}>
                    <span className="text-2xl leading-none">{planEmoji[plan.category] || '📈'}</span>
                  </div>
                </div>

                <div className="space-y-2.5 mb-5">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <DollarSign size={14} /> Investment
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{formatCurrency(plan.amount)}</span>
                      {plan.name === 'Gold Profit Plan' && (
                        <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Hot 🔥</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Zap size={14} /> Daily Earnings
                    </div>
                    <span className="font-black text-emerald-600 text-lg">{formatCurrency(plan.dailyEarning)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Calendar size={14} /> Validity
                    </div>
                    <span className="font-semibold text-slate-700">365 Days</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-4 text-center">
                  <div className="text-slate-400 text-xs">Annual Return Estimate</div>
                  <div className="text-blue-600 font-black text-xl mt-0.5">
                    {formatCurrency(plan.dailyEarning * 365)}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setSelectedPlan(isSelected ? null : plan.id);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                    isSelected
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-slate-900 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isSelected ? 'Cancel' : 'Select Plan'}
                </button>

                {isSelected && (
                  <div className="mt-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                      <p className="text-blue-800 text-sm">
                        All investment plans have a <strong>365-day validity period</strong>. Daily earnings are credited to your investment earnings (withdrawable). Higher capital plans yield proportionally higher daily returns.
                      </p>
                    </div>
                    <button
                      onClick={() => handleInvest(plan.id)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm"
                    >
                      Confirm Investment
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Custom Plan Card */}
        {investmentPlans.find((p) => p.isCustom && p.isActive) && (
          <div className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${
            selectedPlan === 'plan-custom' ? 'border-teal-500 shadow-teal-100' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
          }`}>
            <div className="h-1.5 rounded-t-2xl bg-gradient-to-r from-teal-400 to-emerald-600" />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-base">Custom Investment Plan</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Your amount, your earnings</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl leading-none">{planEmoji['custom']}</span>
                </div>
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Min Amount</span>
                  <span className="font-bold text-slate-900">{formatCurrency(adminConfig.minDeposit)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">Max Amount</span>
                  <span className="font-bold text-slate-900">{formatCurrency(adminConfig.maxDailyDeposit)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 text-sm">Daily Rate</span>
                  <span className="font-black text-emerald-600">6.9% / day</span>
                </div>
              </div>

              {customAmount && !isNaN(parseFloat(customAmount)) && parseFloat(customAmount) >= adminConfig.minDeposit && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4 text-center">
                  <div className="text-emerald-600 text-xs font-semibold">Estimated Daily Earnings</div>
                  <div className="text-emerald-700 font-black text-xl mt-0.5">
                    {formatCurrency(calculateDailyEarning(parseFloat(customAmount)))}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setSelectedPlan(selectedPlan === 'plan-custom' ? null : 'plan-custom');
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                  selectedPlan === 'plan-custom'
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-slate-900 hover:bg-teal-600 text-white'
                }`}
              >
                {selectedPlan === 'plan-custom' ? 'Cancel' : 'Enter Custom Amount'}
              </button>

              {selectedPlan === 'plan-custom' && (
                <div className="mt-3 space-y-3">
                  <input
                    type="number"
                    placeholder={`Min: GHC ${adminConfig.minDeposit}`}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min={adminConfig.minDeposit}
                    max={adminConfig.maxDailyDeposit}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                  <button
                    onClick={() => handleInvest('plan-custom')}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors text-sm"
                  >
                    Confirm Investment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Investments are shown on the dedicated Claims page; list removed here. */}
    </div>
  );
}
