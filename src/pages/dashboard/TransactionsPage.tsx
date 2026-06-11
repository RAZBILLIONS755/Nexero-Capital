import { useState } from 'react';
import { Activity, ArrowDownToLine, ArrowUpFromLine, TrendingUp, CheckSquare, Users, Filter } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';

const txIcons: Record<string, React.ReactNode> = {
  deposit: <ArrowDownToLine size={16} className="text-blue-600" />,
  withdrawal: <ArrowUpFromLine size={16} className="text-red-600" />,
  investment: <TrendingUp size={16} className="text-purple-600" />,
  task_earning: <CheckSquare size={16} className="text-emerald-600" />,
  referral_investment: <Users size={16} className="text-amber-600" />,
  referral_task: <Users size={16} className="text-amber-600" />,
};

const txColors: Record<string, string> = {
  deposit: 'bg-blue-50',
  withdrawal: 'bg-red-50',
  investment: 'bg-purple-50',
  task_earning: 'bg-emerald-50',
  referral_investment: 'bg-amber-50',
  referral_task: 'bg-amber-50',
};

type FilterType = 'all' | 'deposit' | 'withdrawal' | 'investment' | 'task_earning' | 'referral_investment';

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const { transactions } = useDataStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const userTxs = transactions.filter((t) => t.userId === user?.id);

  const filtered = userTxs.filter((t) => {
    const typeMatch = filter === 'all' || t.type === filter;
    const statusMatch = statusFilter === 'all' || t.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const totalDeposited = userTxs.filter((t) => t.type === 'deposit' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = userTxs.filter((t) => t.type === 'withdrawal' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);
  const totalInvested = userTxs.filter((t) => t.type === 'investment' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Transaction History</h2>
        <p className="text-slate-500 mt-1">Complete record of all your financial activity.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Deposited', value: formatCurrency(totalDeposited), color: 'text-blue-600' },
          { label: 'Total Invested', value: formatCurrency(totalInvested), color: 'text-purple-600' },
          { label: 'Total Withdrawn', value: formatCurrency(totalWithdrawn), color: 'text-red-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
            <div className={`font-black text-lg ${s.color}`}>{s.value}</div>
            <div className="text-slate-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-slate-400" />
          <span className="font-semibold text-slate-700 text-sm">Filter Transactions</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {(['all', 'deposit', 'withdrawal', 'investment', 'task_earning', 'referral_investment'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Transactions ({filtered.length})</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No transactions found.</p>
            </div>
          ) : (
            filtered.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
                <div className={`w-9 h-9 ${txColors[tx.type] || 'bg-gray-50'} rounded-xl flex items-center justify-center shrink-0`}>
                  {txIcons[tx.type] || <Activity size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-sm capitalize">
                    {tx.type.replace(/_/g, ' ')}
                    {tx.planName && <span className="text-slate-500 font-normal"> – {tx.planName}</span>}
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    {formatDate(tx.createdAt)}
                    {tx.reference && <span> • Ref: <span className="font-mono">{tx.reference}</span></span>}
                    {tx.note && <span> • {tx.note}</span>}
                  </div>
                  {tx.chargeBreakdown && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      Net: <span className="text-emerald-600 font-semibold">{formatCurrency(tx.chargeBreakdown.netReceivable)}</span>
                      {' '}(10% charge: {formatCurrency(tx.chargeBreakdown.totalCharge)})
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-black text-base ${
                    tx.type === 'withdrawal' || tx.type === 'investment' ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {tx.type === 'withdrawal' || tx.type === 'investment' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
