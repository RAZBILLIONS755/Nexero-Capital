import { useState } from 'react';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AdminWithdrawals() {
  const { transactions, updateTransaction, updateUserData, getUserById } = useDataStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const withdrawals = transactions
    .filter((t) => t.type === 'withdrawal')
    .filter((t) => filter === 'all' || t.status === filter);

  const handleApprove = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    updateTransaction(txId, { status: 'approved', processedAt: new Date().toISOString() });

    const user = getUserById(tx.userId);
    if (user) {
      updateUserData(tx.userId, {
        totalWithdrawn: parseFloat((user.totalWithdrawn + tx.amount).toFixed(2)),
      });
    }
  };

  const handleReject = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    updateTransaction(txId, { status: 'rejected', processedAt: new Date().toISOString() });

    const user = getUserById(tx.userId);
    if (user && tx.note?.includes('Type: investment')) {
      updateUserData(tx.userId, {
        investmentBalance: parseFloat((user.investmentBalance + tx.amount).toFixed(2)),
      });
    } else if (user && tx.note?.includes('Type: task')) {
      updateUserData(tx.userId, {
        taskBalance: parseFloat((user.taskBalance + tx.amount).toFixed(2)),
      });
    }
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
            {f} {f === 'pending' && `(${transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending').length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <h3 className="font-bold text-slate-900">Withdrawal Requests ({withdrawals.length})</h3>
        </div>

        <div className="divide-y divide-slate-50">
          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No withdrawals found.</div>
          ) : (
            withdrawals.map((tx) => {
              const user = getUserById(tx.userId);
              const charges = tx.chargeBreakdown;

              return (
                <div key={tx.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user?.fullName ? user.fullName.charAt(0) : '?'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user?.fullName || 'Unknown'}</div>
                        <div className="text-slate-400 text-xs">{user?.email}</div>
                        <div className="text-slate-400 text-xs">MoMo: {tx.momoNumber}</div>
                        <div className="text-slate-400 text-xs mt-1">{formatDate(tx.createdAt)}</div>
                        {tx.note && <div className="text-slate-400 text-xs capitalize">{tx.note}</div>}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="text-2xl font-black text-red-600">{formatCurrency(tx.amount)}</div>

                      {charges && (
                        <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 text-left">
                          <div className="flex justify-between gap-6">
                            <span className="text-slate-500">Service Charges</span>
                            <span className="font-semibold">- {formatCurrency(charges.serviceCharge)}</span>
                          </div>
                          <div className="flex justify-between gap-6">
                            <span className="text-slate-500">Tax</span>
                            <span className="font-semibold">- {formatCurrency(charges.tax)}</span>
                          </div>
                          <div className="flex justify-between gap-6">
                            <span className="text-slate-500">Maintenance Fee</span>
                            <span className="font-semibold">- {formatCurrency(charges.maintenanceFee)}</span>
                          </div>
                          <div className="flex justify-between gap-6">
                            <span className="text-slate-500">Operational Fees</span>
                            <span className="font-semibold">- {formatCurrency(charges.operationalFee)}</span>
                          </div>
                          <div className="flex justify-between gap-6 border-t border-slate-200 pt-1.5">
                            <span className="font-bold text-slate-700">Net Receivable</span>
                            <span className="font-black text-emerald-600">{formatCurrency(charges.netReceivable)}</span>
                          </div>
                        </div>
                      )}

                      {tx.status === 'pending' && (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleApprove(tx.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors"
                          >
                            <CheckCircle size={15} /> Approve & Send
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
                          {tx.status === 'approved' ? '✓ Approved & Sent' : '✗ Rejected (Refunded)'}
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
