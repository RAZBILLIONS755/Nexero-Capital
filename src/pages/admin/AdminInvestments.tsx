import { useState } from 'react';
import { TrendingUp, Search } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate, getDaysRemaining, getStatusColor } from '../../utils/helpers';

export default function AdminInvestments() {
  const { investments, updateInvestment, updateUserData, getUserById } = useDataStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('active');

  const filtered = investments.filter((inv) => {
    const user = getUserById(inv.userId);
    const nameMatch = user?.fullName.toLowerCase().includes(search.toLowerCase()) || false;
    const statusMatch = filter === 'all' || inv.status === filter;
    return nameMatch && statusMatch;
  });

  const handleCreditEarning = (invId: string) => {
    const inv = investments.find((i) => i.id === invId);
    if (!inv || inv.status !== 'active') return;

    const user = getUserById(inv.userId);
    if (!user) return;

    updateInvestment(invId, {
      totalEarned: parseFloat((inv.totalEarned + inv.dailyEarning).toFixed(2)),
      lastEarningDate: new Date().toISOString(),
    });

    updateUserData(inv.userId, {
      investmentBalance: parseFloat((user.investmentBalance + inv.dailyEarning).toFixed(2)),
    });

    if (user.referredBy) {
      const referrer = getUserById(user.referredBy);
      if (referrer) {
        const commission = parseFloat((0.05 * inv.dailyEarning).toFixed(2));
        updateUserData(user.referredBy, {
          investmentBalance: parseFloat((referrer.investmentBalance + commission).toFixed(2)),
          referralInvestmentEarnings: parseFloat((referrer.referralInvestmentEarnings + commission).toFixed(2)),
        });
      }
    }
  };

  const handleExpire = (invId: string) => {
    updateInvestment(invId, { status: 'expired' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-60 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'expired'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Investments', value: investments.length },
          { label: 'Active', value: investments.filter((i) => i.status === 'active').length },
          { label: 'Total Capital', value: formatCurrency(investments.reduce((s, i) => s + i.amount, 0)) },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
            <div className="font-black text-xl text-slate-900">{stat.value}</div>
            <div className="text-slate-400 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" /> Investments ({filtered.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No investments found.</div>
          ) : (
            filtered.map((inv) => {
              const user = getUserById(inv.userId);
              return (
                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{user?.fullName || 'Unknown'}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-slate-500 text-xs">{inv.planName}</div>
                    <div className="text-slate-400 text-xs">
                      Started: {formatDate(inv.startDate)} • Expires: {formatDate(inv.expiryDate)}
                    </div>
                    {inv.lastEarningDate && (
                      <div className="text-slate-400 text-xs">Last credited: {formatDate(inv.lastEarningDate)}</div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 items-center shrink-0">
                    <div className="text-center">
                      <div className="font-black text-slate-900">{formatCurrency(inv.amount)}</div>
                      <div className="text-slate-400 text-xs">Invested</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-emerald-600">{formatCurrency(inv.dailyEarning)}</div>
                      <div className="text-slate-400 text-xs">Daily</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-blue-600">{formatCurrency(inv.totalEarned)}</div>
                      <div className="text-slate-400 text-xs">Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-amber-600">{getDaysRemaining(inv.expiryDate)}d</div>
                      <div className="text-slate-400 text-xs">Remaining</div>
                    </div>

                    {inv.status === 'active' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreditEarning(inv.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Credit Daily
                        </button>
                        <button
                          onClick={() => handleExpire(inv.id)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-red-100 text-slate-700 hover:text-red-700 text-xs font-bold rounded-lg transition-colors"
                        >
                          Expire
                        </button>
                      </div>
                    )}
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
