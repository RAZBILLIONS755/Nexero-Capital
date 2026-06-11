import { useState } from 'react';
import { Gift, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate, getDaysRemaining } from '../../utils/helpers';

export default function ClaimsPage() {
  const { user, updateUser } = useAuthStore();
  const { investments, getUserById, updateInvestment, updateUserData } = useDataStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const userInvestments = investments.filter((i) => i.userId === user?.id && i.status === 'active');

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

    updateInvestment(invId, {
      totalEarned: parseFloat((inv.totalEarned + inv.dailyEarning).toFixed(2)),
      lastEarningDate: new Date().toISOString(),
    });

    const usr = getUserById(inv.userId);
    if (usr) {
      updateUserData(inv.userId, {
        investmentBalance: parseFloat(((usr.investmentBalance || 0) + inv.dailyEarning).toFixed(2)),
      });
      if (user?.id === inv.userId) {
        updateUser({ investmentBalance: parseFloat(((user?.investmentBalance || 0) + inv.dailyEarning).toFixed(2)) });
      }

      if (usr.referredBy) {
        const referrer = getUserById(usr.referredBy);
        if (referrer) {
          // default referral rate handled in adminConfig elsewhere; use 5% fallback
          const commission = parseFloat(((0.05) * inv.dailyEarning).toFixed(2));
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
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Gift size={20} /> Claim Rewards</h2>
        <p className="text-slate-500 mt-1">All your invested products are listed here, claim daily earnings when available.</p>
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-900">My Investments (Claimable)</h3>
        </div>
        <div className="p-5 space-y-3">
          {userInvestments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No active investments found.</div>
          ) : (
            userInvestments.map((inv) => {
              const last = inv.lastEarningDate ? new Date(inv.lastEarningDate) : new Date(inv.startDate);
              const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
              const now = new Date();
              const canClaim = next <= now;
              const timeLeft = Math.max(0, next.getTime() - now.getTime());
              const hours = Math.floor(timeLeft / (1000 * 60 * 60));
              const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

              return (
                <div key={inv.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{inv.planName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-slate-600">{inv.status}</span>
                    </div>
                    <div className="text-slate-400 text-xs">Invested: {formatCurrency(inv.amount)} • Started: {formatDate(inv.startDate)} • Expires: {formatDate(inv.expiryDate)}</div>
                  </div>
                  <div className="flex gap-4 shrink-0 items-center">
                    <div className="text-center">
                      <div className="text-emerald-600 font-black">{formatCurrency(inv.dailyEarning)}</div>
                      <div className="text-slate-400 text-xs">Per Day</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-600 font-black">{formatCurrency(inv.totalEarned)}</div>
                      <div className="text-slate-400 text-xs">Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-slate-700 font-bold"><Clock size={12} />{getDaysRemaining(inv.expiryDate)}d</div>
                      <div className="text-slate-400 text-xs">Left</div>
                    </div>
                    <div className="text-center">
                      {canClaim ? (
                        <button
                          onClick={() => handleClaim(inv.id)}
                          disabled={claimingId === inv.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                        >
                          {claimingId === inv.id ? 'Claiming...' : `Claim ${formatCurrency(inv.dailyEarning)}`}
                        </button>
                      ) : (
                        <div className="text-slate-500 text-xs">Next: {hours}h {mins}m</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
