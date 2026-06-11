import { useNavigate } from 'react-router-dom';
import { Users, ArrowDownToLine, Wallet, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AdminOverview() {
  const navigate = useNavigate();
  const { users, transactions, investments, taskCompletions } = useDataStore();

  const pendingDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending');
  const pendingTasks = taskCompletions.filter((tc) => tc.status === 'pending');
  const activeInvestments = investments.filter((i) => i.status === 'active');

  const totalDeposited = transactions.filter((t) => t.type === 'deposit' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);

  const recentTxs = transactions.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {(pendingDeposits.length > 0 || pendingWithdrawals.length > 0 || pendingTasks.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {pendingDeposits.length > 0 && (
            <div
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => navigate('/admin/deposits')}
            >
              <AlertTriangle size={20} className="text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-amber-800">{pendingDeposits.length} Pending Deposits</div>
                <div className="text-amber-600 text-xs">Awaiting verification</div>
              </div>
            </div>
          )}
          {pendingWithdrawals.length > 0 && (
            <div
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => navigate('/admin/withdrawals')}
            >
              <AlertTriangle size={20} className="text-red-600 shrink-0" />
              <div>
                <div className="font-bold text-red-800">{pendingWithdrawals.length} Pending Withdrawals</div>
                <div className="text-red-600 text-xs">Awaiting approval</div>
              </div>
            </div>
          )}
          {pendingTasks.length > 0 && (
            <div
              className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => navigate('/admin/tasks')}
            >
              <AlertTriangle size={20} className="text-purple-600 shrink-0" />
              <div>
                <div className="font-bold text-purple-800">{pendingTasks.length} Task Submissions</div>
                <div className="text-purple-600 text-xs">Awaiting review</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-50 text-blue-600', sub: `${users.filter((u) => !u.isSuspended).length} active` },
          { label: 'Total Deposited', value: formatCurrency(totalDeposited), icon: ArrowDownToLine, color: 'bg-emerald-50 text-emerald-600', sub: `${transactions.filter((t) => t.type === 'deposit' && t.status === 'approved').length} transactions` },
          { label: 'Total Withdrawn', value: formatCurrency(totalWithdrawn), icon: Wallet, color: 'bg-red-50 text-red-600', sub: `${transactions.filter((t) => t.type === 'withdrawal' && t.status === 'approved').length} transactions` },
          { label: 'Active Investments', value: activeInvestments.length, icon: TrendingUp, color: 'bg-purple-50 text-purple-600', sub: formatCurrency(totalInvested) + ' total' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <div className="text-xl font-black text-slate-900 mb-0.5">{stat.value}</div>
            <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
            <div className="text-slate-400 text-xs mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" /> Pending Actions
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Deposit Verifications', count: pendingDeposits.length, path: '/admin/deposits', color: 'bg-amber-100 text-amber-700' },
              { label: 'Withdrawal Approvals', count: pendingWithdrawals.length, path: '/admin/withdrawals', color: 'bg-red-100 text-red-700' },
              { label: 'Task Submissions', count: pendingTasks.length, path: '/admin/tasks', color: 'bg-purple-100 text-purple-700' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => navigate(item.path)}
              >
                <span className="text-slate-700 font-medium text-sm">{item.label}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.color}`}>
                  {item.count} pending
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-900">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {recentTxs.map((tx) => {
              const u = users.find((u2) => u2.id === tx.userId);
              return (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {u?.fullName ? u.fullName.charAt(0) : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-900 text-sm font-medium truncate">{u?.fullName || 'Unknown'}</div>
                    <div className="text-slate-400 text-xs capitalize">{tx.type.replace('_', ' ')} • {formatDate(tx.createdAt)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm text-slate-900">{formatCurrency(tx.amount)}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      tx.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      tx.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>{tx.status}</span>
                  </div>
                </div>
              );
            })}
            {recentTxs.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">No transactions yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
