import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Wallet, ArrowDownToLine, CheckSquare,
  Users, Clock, ArrowRight, Plus, Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate, getStatusColor, timeAgo } from '../../utils/helpers';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const transactions = useDataStore((s) => s.transactions);
  const investments = useDataStore((s) => s.investments);
  const referralRecords = useDataStore((s) => s.referralRecords);

  // Always read the authoritative user record from dataStore (falls back to auth store)
  const u = useDataStore((s) => (user ? s.users.find((uu) => uu.id === user.id) : undefined)) || user;

  const userTxs = transactions.filter((t) => t.userId === user?.id).slice(0, 5);
  const activeInvestments = investments.filter((i) => i.userId === user?.id && i.status === 'active');
  const pendingTxs = transactions.filter((t) => t.userId === user?.id && t.status === 'pending');
  const userReferrals = referralRecords.filter((r) => r.referrerId === user?.id);

  const totalDailyEarning = activeInvestments.reduce((sum, inv) => sum + inv.dailyEarning, 0);

  const statCards = [
    {
      label: 'Account Balance',
      value: formatCurrency(u?.accountBalance || 0),
      icon: Wallet,
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: 'Deposits only — not withdrawable',
      onClick: () => navigate('/dashboard/deposit'),
    },
    {
      label: 'Task Earnings',
      value: formatCurrency(u?.taskBalance || 0),
      icon: CheckSquare,
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: 'Min. GHC 50 to withdraw',
      onClick: () => navigate('/dashboard/tasks'),
    },
    {
      label: 'Daily Earnings',
      value: formatCurrency(totalDailyEarning),
      icon: TrendingUp,
      color: 'bg-purple-600',
      lightColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: `${activeInvestments.length} active plan(s)`,
      onClick: () => navigate('/dashboard/invest'),
    },
    {
      label: 'Referral Earnings',
      value: formatCurrency((u?.referralInvestmentEarnings || 0) + (u?.referralTaskEarnings || 0)),
      icon: Users,
      color: 'bg-amber-600',
      lightColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      change: `${userReferrals.length} total referrals`,
      onClick: () => navigate('/dashboard/referrals'),
    },
  ];

  const quickActions = [
    { label: 'Deposit Funds', icon: ArrowDownToLine, color: 'bg-blue-600 hover:bg-blue-700', path: '/dashboard/deposit' },
    { label: 'Invest Now', icon: TrendingUp, color: 'bg-indigo-600 hover:bg-indigo-700', path: '/dashboard/invest' },
    { label: 'Withdraw', icon: Wallet, color: 'bg-emerald-600 hover:bg-emerald-700', path: '/dashboard/withdraw' },
    { label: 'Earn Tasks', icon: CheckSquare, color: 'bg-purple-600 hover:bg-purple-700', path: '/dashboard/tasks' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium">Good day,</p>
            <h2 className="text-2xl font-black mt-1">{u?.fullName?.split(' ')[0] || 'Investor'} 👋</h2>
            <p className="text-blue-100 text-sm mt-1">
              Your referral code: <span className="font-mono font-bold text-white bg-blue-500/40 px-2 py-0.5 rounded">{u?.referralCode}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-4 py-2">
            <Clock size={16} className="text-blue-200" />
            <span className="text-sm text-blue-100">Verification: up to 23h 59m</span>
          </div>
        </div>

        {pendingTxs.length > 0 && (
          <div className="mt-4 bg-amber-400/20 border border-amber-300/30 rounded-xl px-4 py-3 flex items-center gap-2">
            <Clock size={16} className="text-amber-300" />
            <span className="text-amber-100 text-sm">
              You have {pendingTxs.length} pending transaction(s) awaiting verification.
            </span>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <button
            key={i}
            onClick={card.onClick}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${card.lightColor} rounded-xl flex items-center justify-center`}>
                <card.icon size={20} className={card.iconColor} />
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-xl font-black text-slate-900 mb-1">{card.value}</div>
            <div className="text-slate-500 text-sm font-medium mb-1">{card.label}</div>
            <div className="text-xs text-slate-400">{card.change}</div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="text-slate-900 font-bold text-base mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white rounded-xl p-4 text-sm font-semibold flex flex-col items-center gap-2 transition-colors`}
            >
              <action.icon size={22} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active Investments */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-slate-900 font-bold text-base">Active Investments</h3>
            <button
              onClick={() => navigate('/dashboard/invest')}
              className="text-blue-600 text-sm font-semibold flex items-center gap-1"
            >
              <Plus size={14} /> New Plan
            </button>
          </div>
          <div className="p-5">
            {activeInvestments.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No active investments yet</p>
                <button
                  onClick={() => navigate('/dashboard/invest')}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Investing
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeInvestments.slice(0, 3).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{inv.planName}</div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        Invested: {formatCurrency(inv.amount)} • Expires: {formatDate(inv.expiryDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-600 font-bold text-sm">{formatCurrency(inv.dailyEarning)}/day</div>
                      <div className="text-slate-400 text-xs">Earned: {formatCurrency(inv.totalEarned)}</div>
                    </div>
                  </div>
                ))}
                {activeInvestments.length > 3 && (
                  <button
                    onClick={() => navigate('/dashboard/invest')}
                    className="text-blue-600 text-sm font-semibold w-full text-center py-2"
                  >
                    View all {activeInvestments.length} investments →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-slate-900 font-bold text-base">Recent Transactions</h3>
            <button
              onClick={() => navigate('/dashboard/transactions')}
              className="text-blue-600 text-sm font-semibold flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="p-5">
            {userTxs.length === 0 ? (
              <div className="text-center py-8">
                <Activity size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No transactions yet</p>
                <button
                  onClick={() => navigate('/dashboard/deposit')}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Make First Deposit
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userTxs.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      tx.type === 'deposit' ? 'bg-blue-50 text-blue-600' :
                      tx.type === 'withdrawal' ? 'bg-red-50 text-red-600' :
                      tx.type === 'investment' ? 'bg-purple-50 text-purple-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {tx.type === 'deposit' ? '↓' : tx.type === 'withdrawal' ? '↑' : tx.type === 'investment' ? '★' : '✓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-900 text-sm font-medium capitalize">
                        {tx.type.replace('_', ' ')}
                        {tx.planName && ` – ${tx.planName}`}
                      </div>
                      <div className="text-slate-400 text-xs">{timeAgo(tx.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        tx.type === 'withdrawal' ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
