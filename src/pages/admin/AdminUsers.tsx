import { useState } from 'react';
import { Search, UserX, UserCheck, X, Save, DollarSign } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate, hashPin } from '../../utils/helpers';

export default function AdminUsers() {
  const { users, updateUserData } = useDataStore();
  const [search, setSearch] = useState('');
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [balanceForm, setBalanceForm] = useState({ accountBalance: '', investmentBalance: '', taskBalance: '' });
  const [adjustType, setAdjustType] = useState<'add' | 'set'>('add');
  const [editDetailsId, setEditDetailsId] = useState<string | null>(null);
  const [detailsForm, setDetailsForm] = useState<any>({});
  const [savingDetails, setSavingDetails] = useState(false);

  const q = search.toLowerCase();
  const filtered = (users || []).filter((u) => {
    const name = (u.fullName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = u.phone || '';
    return name.includes(q) || email.includes(q) || phone.includes(search);
  });

  const handleToggleSuspend = (userId: string, suspended: boolean) => {
    updateUserData(userId, { isSuspended: !suspended });
  };

  const handleSaveBalance = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const updates: Record<string, number> = {};

    if (balanceForm.accountBalance !== '') {
      const amt = parseFloat(balanceForm.accountBalance);
      if (!isNaN(amt)) {
        updates.accountBalance = adjustType === 'add'
          ? parseFloat((user.accountBalance + amt).toFixed(2))
          : parseFloat(amt.toFixed(2));
      }
    }

    if (balanceForm.investmentBalance !== '') {
      const amt = parseFloat(balanceForm.investmentBalance);
      if (!isNaN(amt)) {
        updates.investmentBalance = adjustType === 'add'
          ? parseFloat((user.investmentBalance + amt).toFixed(2))
          : parseFloat(amt.toFixed(2));
      }
    }

    if (balanceForm.taskBalance !== '') {
      const amt = parseFloat(balanceForm.taskBalance);
      if (!isNaN(amt)) {
        updates.taskBalance = adjustType === 'add'
          ? parseFloat((user.taskBalance + amt).toFixed(2))
          : parseFloat(amt.toFixed(2));
      }
    }

    if (Object.keys(updates).length > 0) {
      updateUserData(userId, updates as any);
    }

    setEditUserId(null);
    setBalanceForm({ investmentBalance: '', taskBalance: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700">
          {users.length} total users
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No users found.</div>
          ) : (
            filtered.map((u) => (
              <div key={u.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(u.fullName ? u.fullName.charAt(0) : '?').toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{u.fullName}</span>
                        {u.isSuspended && (
                          <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">Suspended</span>
                        )}
                      </div>
                      <div className="text-slate-400 text-xs">{u.email} • {u.phone}</div>
                      <div className="text-slate-400 text-xs">MoMo: {u.momoNumber || '-'} • Ref: {u.referralCode || '-'}</div>
                      <div className="text-slate-400 text-xs">Joined: {formatDate(u.joinedAt)}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-sky-50 rounded-lg p-2 text-center">
                        <div className="text-sky-400 font-medium">Account</div>
                        <div className="text-sky-700 font-black">{formatCurrency(u.accountBalance || 0)}</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <div className="text-blue-400 font-medium">Investment Earnings</div>
                        <div className="text-blue-700 font-black">{formatCurrency(u.investmentBalance || 0)}</div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-2 text-center">
                        <div className="text-emerald-400 font-medium">Task</div>
                        <div className="text-emerald-700 font-black">{formatCurrency(u.taskBalance || 0)}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditUserId(editUserId === u.id ? null : u.id);
                          setBalanceForm({ accountBalance: '', investmentBalance: '', taskBalance: '' });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        <DollarSign size={13} /> Balance
                      </button>
                      <button
                        onClick={() => {
                          setEditDetailsId(editDetailsId === u.id ? null : u.id);
                          setDetailsForm({
                            fullName: u.fullName || '',
                            email: u.email || '',
                            phone: u.phone || '',
                            momoNumber: u.momoNumber || '',
                            password: '',
                            withdrawalPin: '',
                            isActive: u.isActive,
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                          u.isSuspended
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            : 'bg-red-50 hover:bg-red-100 text-red-700'
                        }`}
                      >
                        {u.isSuspended ? <><UserCheck size={13} /> Activate</> : <><UserX size={13} /> Suspend</>}
                      </button>
                    </div>
                  </div>
                </div>
                
                {editDetailsId === u.id && (
                  <div className="px-5 pb-4 bg-white border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Full Name</label>
                        <input className="w-full px-3 py-1.5 border border-slate-200 rounded-lg" value={detailsForm.fullName} onChange={(e) => setDetailsForm({ ...detailsForm, fullName: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Email</label>
                        <input className="w-full px-3 py-1.5 border border-slate-200 rounded-lg" value={detailsForm.email} onChange={(e) => setDetailsForm({ ...detailsForm, email: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Phone</label>
                        <input className="w-full px-3 py-1.5 border border-slate-200 rounded-lg" value={detailsForm.phone} onChange={(e) => setDetailsForm({ ...detailsForm, phone: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">MoMo Number</label>
                        <input className="w-full px-3 py-1.5 border border-slate-200 rounded-lg" value={detailsForm.momoNumber} onChange={(e) => setDetailsForm({ ...detailsForm, momoNumber: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Set Password</label>
                        <input type="password" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg" value={detailsForm.password} onChange={(e) => setDetailsForm({ ...detailsForm, password: e.target.value })} placeholder="Leave blank to keep" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Set 4-digit PIN</label>
                        <input type="text" maxLength={4} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg" value={detailsForm.withdrawalPin} onChange={(e) => setDetailsForm({ ...detailsForm, withdrawalPin: e.target.value.replace(/[^0-9]/g, '') })} placeholder="e.g. 1234 (leave blank to keep)" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Active</label>
                        <div className="mt-1">
                          <label className="inline-flex items-center gap-2">
                            <input type="checkbox" checked={detailsForm.isActive} onChange={(e) => setDetailsForm({ ...detailsForm, isActive: e.target.checked })} />
                            <span className="text-sm text-slate-600">User active</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={async () => {
                          setSavingDetails(true);
                          const updates: any = {};
                          if (detailsForm.fullName) updates.fullName = detailsForm.fullName;
                          if (detailsForm.email) updates.email = detailsForm.email.toLowerCase();
                          if (detailsForm.phone) updates.phone = detailsForm.phone;
                          if (detailsForm.momoNumber !== undefined) updates.momoNumber = detailsForm.momoNumber;
                          if (detailsForm.password) updates.password = detailsForm.password;
                          if (typeof detailsForm.isActive === 'boolean') updates.isActive = detailsForm.isActive;
                          if (detailsForm.withdrawalPin && detailsForm.withdrawalPin.length === 4) {
                            try {
                              const hashed = await hashPin(detailsForm.withdrawalPin);
                              updates.withdrawalPinHash = hashed;
                            } catch (err) {
                              // ignore hashing failures
                            }
                          }

                          updateUserData(u.id, updates as any);
                          setSavingDetails(false);
                          setEditDetailsId(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                      >
                        <Save size={14} /> {savingDetails ? 'Saving...' : 'Save Details'}
                      </button>

                      <button onClick={() => setEditDetailsId(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold">Cancel</button>
                    </div>
                  </div>
                )}

                {editUserId === u.id && (
                  <div className="px-5 pb-4 bg-blue-50 border-t border-blue-100">
                    <div className="flex flex-wrap gap-3 items-end pt-4">
                      <div>
                        <div className="text-xs font-semibold text-slate-600 mb-1">Adjustment Type</div>
                        <div className="flex gap-2">
                          {(['add', 'set'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setAdjustType(t)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                                adjustType === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                              }`}
                            >
                              {t === 'add' ? '+ Add to' : '= Set to'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-600 mb-1">Account Balance (GHC)</div>
                        <input
                          type="number"
                          value={balanceForm.accountBalance}
                          onChange={(e) => setBalanceForm({ ...balanceForm, accountBalance: e.target.value })}
                          placeholder={adjustType === 'add' ? 'Amount to add' : 'New balance'}
                          step="0.01"
                          className="w-40 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-600 mb-1">Investment Balance (GHC)</div>
                        <input
                          type="number"
                          value={balanceForm.investmentBalance}
                          onChange={(e) => setBalanceForm({ ...balanceForm, investmentBalance: e.target.value })}
                          placeholder={adjustType === 'add' ? 'Amount to add' : 'New balance'}
                          step="0.01"
                          className="w-40 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-600 mb-1">Task Balance (GHC)</div>
                        <input
                          type="number"
                          value={balanceForm.taskBalance}
                          onChange={(e) => setBalanceForm({ ...balanceForm, taskBalance: e.target.value })}
                          placeholder={adjustType === 'add' ? 'Amount to add' : 'New balance'}
                          step="0.01"
                          className="w-40 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveBalance(u.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors"
                      >
                        <Save size={14} /> Save
                      </button>
                      <button
                        onClick={() => setEditUserId(null)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
