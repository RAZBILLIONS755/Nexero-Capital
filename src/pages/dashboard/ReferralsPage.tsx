import { useState } from 'react';
import { Copy, CheckCircle, Users, DollarSign, Target, Share2, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function ReferralsPage() {
  const { user } = useAuthStore();
  const { referralRecords, users, adminConfig, getUserById } = useDataStore();

  const freshUser = user ? getUserById(user.id) : null;
  const u = freshUser || user;

  const [copied, setCopied] = useState(false);

  const myReferrals = referralRecords.filter((r) => r.referrerId === user?.id);



  const referredUsers = users.filter((u2) => u2.referredBy === user?.id);

  const referralLink = `${window.location.origin}/register?ref=${u?.referralCode}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Referral Program</h2>
        <p className="text-slate-500 mt-1">Earn commissions when your referrals invest or complete tasks.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Referrals', value: referredUsers.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Investment Commissions', value: formatCurrency(u?.referralInvestmentEarnings || 0), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Task Commissions', value: formatCurrency(u?.referralTaskEarnings || 0), icon: Target, color: 'bg-purple-50 text-purple-600' },
          { label: 'Total Earned', value: formatCurrency((u?.referralInvestmentEarnings || 0) + (u?.referralTaskEarnings || 0)), icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <div className="text-slate-900 font-black text-lg">{stat.value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Share2 size={20} />
          <span className="font-bold">Your Referral Link</span>
        </div>
        <p className="text-blue-200 text-sm mb-4">
          Share this link with friends and family. When they sign up and invest or complete tasks, you earn automatically.
        </p>

        <div className="space-y-3">
          <div>
            <div className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Referral Code</div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black font-mono tracking-wider">{u?.referralCode}</span>
              <button
                onClick={() => handleCopy(u?.referralCode || '')}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          <div>
            <div className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Referral Link</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/15 rounded-xl px-3 py-2 font-mono text-sm text-blue-100 truncate">
                {referralLink}
              </div>
              <button
                onClick={() => handleCopy(referralLink)}
                className="shrink-0 flex items-center gap-1.5 bg-white text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-xl text-sm font-bold transition-colors"
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Rates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Investment Referral</h4>
              <p className="text-slate-400 text-xs">Credited to investment balance</p>
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 mb-1">{adminConfig.referralInvestmentRate}%</div>
          <p className="text-slate-500 text-sm">
            You earn {adminConfig.referralInvestmentRate}% of every deposit or investment made by your referrals.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Target size={20} className="text-purple-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Task Referral</h4>
              <p className="text-slate-400 text-xs">Credited to task earnings</p>
            </div>
          </div>
          <div className="text-3xl font-black text-purple-600 mb-1">{adminConfig.referralTaskRate}%</div>
          <p className="text-slate-500 text-sm">
            You earn {adminConfig.referralTaskRate}% of every task completed by your referrals.
          </p>
        </div>
      </div>

      {/* Referred Users */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-900">People You've Referred ({referredUsers.length})</h3>
        </div>
        <div className="p-5">
          {referredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-4">You haven't referred anyone yet.</p>
              <p className="text-slate-400 text-sm">
                Share your referral code <strong className="text-blue-600">{u?.referralCode}</strong> to start earning commissions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referredUsers.map((ru) => (
                <div key={ru.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {ru.fullName ? ru.fullName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">{ru.fullName}</div>
                    <div className="text-slate-400 text-xs">Joined: {formatDate(ru.joinedAt)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-emerald-600 font-bold text-sm">
                      {formatCurrency(referralRecords.filter((r) => r.referredUserId === ru.id).reduce((s, r) => s + r.commission, 0))}
                    </div>
                    <div className="text-slate-400 text-xs">Earned</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Commission History */}
      {myReferrals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-900">Commission History</h3>
          </div>
          <div className="p-5 space-y-3">
            {myReferrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-medium text-slate-900 text-sm">{r.referredUserName}</div>
                  <div className="text-slate-400 text-xs mt-0.5 capitalize">{r.type} commission • {formatDate(r.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600 font-bold">{formatCurrency(r.commission)}</div>
                  <div className="text-slate-400 text-xs">on {formatCurrency(r.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
