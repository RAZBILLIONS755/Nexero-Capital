import { useState } from 'react';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AdminDeposits() {
  const { transactions, updateTransaction, updateUserData, getUserById, adminConfig } = useDataStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const deposits = transactions
    .filter((t) => t.type === 'deposit')
    .filter((t) => filter === 'all' || t.status === filter);

  const handleApprove = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    updateTransaction(txId, { status: 'approved', processedAt: new Date().toISOString() });

    const user = getUserById(tx.userId);
    if (user) {
      // Deposits credit the user's account balance (not withdrawable)
      updateUserData(tx.userId, {
        accountBalance: parseFloat(( (user.accountBalance || 0) + tx.amount ).toFixed(2)),
        totalDeposited: parseFloat((user.totalDeposited + tx.amount).toFixed(2)),
      });

      // Pay referral commission to referrer as investment earnings (withdrawable)
      if (user.referredBy) {
        const referrer = getUserById(user.referredBy);
        if (referrer) {
          const commissionRate = adminConfig.referralInvestmentRate || 5;
          const commission = parseFloat(((commissionRate / 100) * tx.amount).toFixed(2));
          updateUserData(user.referredBy, {
            investmentBalance: parseFloat((referrer.investmentBalance + commission).toFixed(2)),
            referralInvestmentEarnings: parseFloat((referrer.referralInvestmentEarnings + commission).toFixed(2)),
          });
        }
      }
    }
      // Notifications for status changes are handled centrally in the data store.
  };

  const handleReject = (txId: string) => {
    updateTransaction(txId, { status: 'rejected', processedAt: new Date().toISOString() });
    // Notifications for status changes are handled centrally in the data store.
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f} {f === 'pending' && `(${transactions.filter((t) => t.type === 'deposit' && t.status === 'pending').length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <h3 className="font-bold text-slate-900">Deposit Requests ({deposits.length})</h3>
        </div>

        <div className="divide-y divide-slate-50">
          {deposits.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No deposits found.</div>
          ) : (
            deposits.map((tx) => {
              const user = getUserById(tx.userId);
              return (
                <div key={tx.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user?.fullName ? user.fullName.charAt(0) : '?'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user?.fullName || 'Unknown'}</div>
                        <div className="text-slate-400 text-xs">{user?.email}</div>
                        <div className="text-slate-400 text-xs mt-1">{formatDate(tx.createdAt)}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="text-2xl font-black text-blue-600">{formatCurrency(tx.amount)}</div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {tx.reference && (
                          <span className="bg-slate-100 px-2 py-1 rounded-lg font-mono">{tx.reference}</span>
                        )}
                        {tx.note && (
                          <span className="bg-slate-100 px-2 py-1 rounded-lg">{tx.note}</span>
                        )}
                      </div>

                      {tx.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleApprove(tx.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors"
                          >
                            <CheckCircle size={15} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(tx.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
                          >
                            <XCircle size={15} /> Reject
                          </button>
                        </div>
                      )}

                      {tx.status !== 'pending' && (
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                          tx.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {tx.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                          {tx.processedAt && ` • ${formatDate(tx.processedAt)}`}
                        </span>
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
