import { useState } from 'react';
import { Wallet, AlertCircle, CheckCircle, Info, ArrowRight, Calculator } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { generateId, formatCurrency, calculateWithdrawalCharges } from '../../utils/helpers';

type WithdrawType = 'investment' | 'task';

export default function WithdrawPage() {
  const { user, updateUser } = useAuthStore();
  const { addTransaction, updateUserData, getUserById, adminConfig, transactions } = useDataStore();

  const freshUser = user ? getUserById(user.id) : null;
  const u = freshUser || user;

  const [type, setType] = useState<WithdrawType>('investment');
  const [amount, setAmount] = useState('');
  const [momoNumber, setMomoNumber] = useState(u?.momoNumber || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // Withdrawal PIN states
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  const today = new Date().toDateString();
  const todayWithdrawals = transactions
    .filter((t) => t.userId === user?.id && t.type === 'withdrawal' && new Date(t.createdAt).toDateString() === today)
    .reduce((sum, t) => sum + t.amount, 0);

  const amt = parseFloat(amount) || 0;
  const breakdown = amt > 0 ? calculateWithdrawalCharges(amt, adminConfig) : null;

  const getBalance = () => (type === 'investment' ? u?.investmentBalance || 0 : u?.taskBalance || 0);
  const getMinWithdraw = () => (type === 'task' ? adminConfig.taskMinWithdrawal : adminConfig.minWithdrawal);

  const hashPin = async (pin: string) => {
    const enc = new TextEncoder();
    const data = enc.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const performWithdrawal = () => {
    const charges = calculateWithdrawalCharges(amt, adminConfig);

    addTransaction({
      id: generateId(),
      userId: user!.id,
      type: 'withdrawal',
      amount: amt,
      status: 'pending',
      momoNumber,
      note: `Type: ${type} | Net: ${formatCurrency(charges.netReceivable)}`,
      createdAt: new Date().toISOString(),
      chargeBreakdown: charges,
    });

    const updates =
      type === 'investment'
        ? { investmentBalance: parseFloat(((u?.investmentBalance || 0) - amt).toFixed(2)) }
        : { taskBalance: parseFloat(((u?.taskBalance || 0) - amt).toFixed(2)) };

    updateUserData(user!.id, updates);
    updateUser(updates);

    setSuccess(true);
    setAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amt || isNaN(amt)) { setError('Please enter a valid amount.'); return; }
    if (amt < getMinWithdraw()) {
      setError(`Minimum withdrawal is ${formatCurrency(getMinWithdraw())}.`);
      return;
    }
    if (amt > adminConfig.maxDailyWithdrawal) {
      setError(`Maximum daily withdrawal is ${formatCurrency(adminConfig.maxDailyWithdrawal)}.`);
      return;
    }
    if (todayWithdrawals + amt > adminConfig.maxDailyWithdrawal) {
      setError(`Daily withdrawal limit of ${formatCurrency(adminConfig.maxDailyWithdrawal)} exceeded.`);
      return;
    }
    if (amt > getBalance()) {
      setError(`Insufficient ${type} balance. Available: ${formatCurrency(getBalance())}.`);
      return;
    }
    if (type === 'task' && getBalance() < adminConfig.taskMinWithdrawal) {
      setError(`You need at least ${formatCurrency(adminConfig.taskMinWithdrawal)} in task earnings to withdraw.`);
      return;
    }
    // If user has not set a withdrawal PIN, prompt setup first
    if (!u?.withdrawalPinHash) {
      setShowPinSetup(true);
      return;
    }

    // If a PIN exists, prompt for it before proceeding
    setShowPinPrompt(true);
  };

  const handlePinSetup = async () => {
    setPinError('');
    if (!/^[0-9]{4}$/.test(newPin)) { setPinError('PIN must be exactly 4 digits.'); return; }
    if (newPin !== confirmPin) { setPinError('PINs do not match.'); return; }
    const hashed = await hashPin(newPin);
    // Save hashed PIN (non-editable thereafter)
    updateUser({ withdrawalPinHash: hashed });
    // Also persist to the authoritative data store so cross-tab reads pick it up
    updateUserData(user!.id, { withdrawalPinHash: hashed });
    setShowPinSetup(false);
    setNewPin(''); setConfirmPin('');
    // If momo number is invalid, prompt user to fill it first
    if (!momoNumber || momoNumber.length < 10) {
      setError('Please enter a valid MoMo number.');
      return;
    }
    // proceed with withdrawal now that PIN is set
    performWithdrawal();
  };

  const handlePinPrompt = async () => {
    setPinError('');
    if (!/^[0-9]{4}$/.test(enteredPin)) { setPinError('Enter your 4-digit PIN.'); return; }
    const hashed = await hashPin(enteredPin);
    if (hashed !== (u?.withdrawalPinHash || '')) { setPinError('Incorrect PIN.'); return; }
    setShowPinPrompt(false);
    setEnteredPin('');
    if (!momoNumber || momoNumber.length < 10) {
      setError('Please enter a valid MoMo number.');
      return;
    }
    performWithdrawal();
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Withdrawal Submitted!</h2>
          <p className="text-slate-500 mb-6">
            Your withdrawal request has been submitted and is pending manual verification. Funds will be sent to your MoMo number within 23 hours 59 minutes.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
          >
            Make Another Withdrawal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Withdraw Funds</h2>
        <p className="text-slate-500 mt-1">Withdraw to your MTN Mobile Money account.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { setType('investment'); setError(''); setAmount(''); }}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            type === 'investment'
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-100 bg-white hover:border-slate-200'
          }`}
        >
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">Investment Balance</div>
          <div className="text-xl font-black text-slate-900">{formatCurrency(u?.investmentBalance || 0)}</div>
          <div className="text-xs text-slate-400 mt-1">Min: {formatCurrency(adminConfig.minWithdrawal)}</div>
        </button>
        <button
          onClick={() => { setType('task'); setError(''); setAmount(''); }}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            type === 'task'
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-slate-100 bg-white hover:border-slate-200'
          }`}
        >
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">Task Earnings</div>
          <div className="text-xl font-black text-slate-900">{formatCurrency(u?.taskBalance || 0)}</div>
          <div className="text-xs text-slate-400 mt-1">Min: {formatCurrency(adminConfig.taskMinWithdrawal)}</div>
        </button>
      </div>

      {type === 'task' && (u?.taskBalance || 0) < adminConfig.taskMinWithdrawal && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-amber-800 text-sm">
            <strong>Task withdrawal threshold not met.</strong> You need at least {formatCurrency(adminConfig.taskMinWithdrawal)} in task earnings to make a withdrawal. Keep completing tasks to reach the threshold.
            <br />Current balance: <strong>{formatCurrency(u?.taskBalance || 0)}</strong> | Remaining: <strong>{formatCurrency(Math.max(0, adminConfig.taskMinWithdrawal - (u?.taskBalance || 0)))}</strong>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Wallet size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-900">Withdrawal Request</h3>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-red-600 text-sm">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-700 text-sm font-semibold block mb-1.5">
              Amount (GHC) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder={`Min: GHC ${getMinWithdraw()}`}
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              min={getMinWithdraw()}
              step="0.01"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="text-slate-700 text-sm font-semibold block mb-1.5">
              MoMo Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="0551234567"
              value={momoNumber}
              onChange={(e) => setMomoNumber(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Charge Breakdown */}
          {breakdown && amt >= getMinWithdraw() && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calculator size={16} className="text-blue-600" />
                <span className="font-bold text-slate-900 text-sm">Withdrawal Charge Breakdown (10%)</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Gross Amount</span>
                  <span className="font-bold text-slate-900">{formatCurrency(breakdown.gross)}</span>
                </div>

                <div className="border-t border-slate-200 pt-2.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" /> Service Charges (2.5%)
                    </span>
                    <span className="text-orange-600 text-sm font-semibold">- {formatCurrency(breakdown.serviceCharge)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Government Tax (2.5%)
                    </span>
                    <span className="text-red-600 text-sm font-semibold">- {formatCurrency(breakdown.tax)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" /> Maintenance Fee (2.5%)
                    </span>
                    <span className="text-purple-600 text-sm font-semibold">- {formatCurrency(breakdown.maintenanceFee)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Operational Fees (2.5%)
                    </span>
                    <span className="text-blue-600 text-sm font-semibold">- {formatCurrency(breakdown.operationalFee)}</span>
                  </div>
                </div>

                <div className="border-t-2 border-slate-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Total Charges (10%)</span>
                    <span className="text-red-600 font-bold">- {formatCurrency(breakdown.totalCharge)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <span className="text-emerald-800 font-bold flex items-center gap-2">
                      <ArrowRight size={16} /> Net Receivable
                    </span>
                    <span className="text-emerald-700 font-black text-xl">{formatCurrency(breakdown.netReceivable)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-amber-800 text-xs leading-relaxed">
              <strong>Processing Time:</strong> All withdrawals are manually verified within 23 hours 59 minutes. Funds will be sent directly to your MoMo number. A 10% charge applies to all withdrawals.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-base shadow-sm"
          >
            Submit Withdrawal Request
          </button>
        </form>
      </div>

      {/* Limits */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Min Withdrawal', value: formatCurrency(adminConfig.minWithdrawal) },
          { label: 'Max Daily', value: formatCurrency(adminConfig.maxDailyWithdrawal) },
          { label: 'Today Withdrawn', value: formatCurrency(todayWithdrawals) },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-3 border border-slate-100 text-center shadow-sm">
            <div className="text-slate-400 text-xs mb-1">{item.label}</div>
            <div className="font-bold text-slate-900 text-sm">{item.value}</div>
          </div>
        ))}
      </div>
      {/* PIN Setup Modal */}
      {showPinSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowPinSetup(false)} />
          <div className="bg-white rounded-2xl p-6 z-50 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Set 4-digit Withdrawal PIN</h3>
            <p className="text-sm text-slate-500 mb-4">This PIN will be required for all future withdrawals and cannot be changed.</p>
            {pinError && <div className="mb-3 text-sm text-red-600">{pinError}</div>}
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Enter 4-digit PIN"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm mb-3"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Confirm PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handlePinSetup} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">Save PIN & Continue</button>
              <button onClick={() => setShowPinSetup(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Prompt Modal */}
      {showPinPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowPinPrompt(false)} />
          <div className="bg-white rounded-2xl p-6 z-50 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Enter Withdrawal PIN</h3>
            <p className="text-sm text-slate-500 mb-4">Enter your 4-digit withdrawal PIN to authorize this transaction.</p>
            {pinError && <div className="mb-3 text-sm text-red-600">{pinError}</div>}
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="4-digit PIN"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handlePinPrompt} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">Confirm & Withdraw</button>
              <button onClick={() => setShowPinPrompt(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
