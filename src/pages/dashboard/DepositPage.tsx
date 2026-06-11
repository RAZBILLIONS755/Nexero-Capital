import { useState } from 'react';
import { Copy, CheckCircle, AlertCircle, Phone, Clock, Upload, Info } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { generateId, formatCurrency } from '../../utils/helpers';

export default function DepositPage() {
  const { user } = useAuthStore();
  const { adminConfig, addTransaction, transactions } = useDataStore();

  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [senderName, setSenderName] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toDateString();
  const todayDeposits = transactions
    .filter((t) => t.userId === user?.id && t.type === 'deposit' && new Date(t.createdAt).toDateString() === today)
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(adminConfig.momoNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amt = parseFloat(amount);
    if (!amt || isNaN(amt)) { setError('Please enter a valid amount.'); return; }
    if (amt < adminConfig.minDeposit) {
      setError(`Minimum deposit is ${formatCurrency(adminConfig.minDeposit)}.`);
      return;
    }
    if (todayDeposits + amt > adminConfig.maxDailyDeposit) {
      setError(`Maximum daily deposit of ${formatCurrency(adminConfig.maxDailyDeposit)} exceeded.`);
      return;
    }
    if (!reference.trim()) { setError('Transaction reference is required.'); return; }
    if (!senderName.trim()) { setError('Sender name is required.'); return; }

    const txId = generateId();
    addTransaction({
      id: txId,
      userId: user!.id,
      type: 'deposit',
      amount: amt,
      status: 'pending',
      reference: reference.trim(),
      momoNumber: adminConfig.momoNumber,
      note: `Sender: ${senderName.trim()}`,
      createdAt: new Date().toISOString(),
    });


    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Deposit Submitted!</h2>
          <p className="text-slate-500 mb-6">
            Your deposit request of <span className="font-bold text-slate-900">{formatCurrency(parseFloat(amount))}</span> has been submitted successfully. Manual verification takes 3–59 mins.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-amber-600" />
              <span className="text-amber-700 font-semibold text-sm">What happens next?</span>
            </div>
            <ul className="text-amber-700 text-sm space-y-1 pl-2">
              <li>• Our team will verify your MoMo transaction reference</li>
              <li>• Your account balance will be updated upon approval</li>
              <li>• You'll see the status update in your transactions</li>
            </ul>
          </div>
          <button
            onClick={() => { setSubmitted(false); setAmount(''); setReference(''); setSenderName(''); }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
          >
            Make Another Deposit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Deposit Funds</h2>
        <p className="text-slate-500 mt-1">Send money via MTN Mobile Money and submit your transaction details below.</p>
      </div>

      {/* MoMo Details Card */}
      <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Phone size={20} />
          </div>
          <div>
            <div className="font-black text-lg">MTN Mobile Money</div>
            <div className="text-yellow-100 text-sm">Send payment to the number below</div>
          </div>
        </div>

        <div className="bg-white/20 rounded-xl p-4 mb-4">
          <div className="text-yellow-100 text-xs font-semibold uppercase tracking-widest mb-1">MoMo Number</div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black tracking-wider">{adminConfig.momoNumber}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-white/25 hover:bg-white/35 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-xl p-3">
            <div className="text-yellow-100 text-xs mb-1">Account Name</div>
            <div className="font-bold text-sm">{adminConfig.momoName}</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <div className="text-yellow-100 text-xs mb-1">Network</div>
            <div className="font-bold text-sm">MTN Ghana</div>
          </div>
        </div>
      </div>

      {/* Deposit Rules */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Minimum Deposit', value: formatCurrency(adminConfig.minDeposit), color: 'text-blue-600' },
          { label: 'Daily Maximum', value: formatCurrency(adminConfig.maxDailyDeposit), color: 'text-purple-600' },
          { label: 'Today Deposited', value: formatCurrency(todayDeposits), color: 'text-amber-600' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="text-slate-400 text-xs mb-1">{item.label}</div>
            <div className={`font-bold text-base ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info size={18} className="text-blue-600" />
          <span className="font-bold text-blue-900">How to Deposit</span>
        </div>
        <div className="space-y-2">
          {[
            'Copy the MTN MoMo number displayed above.',
            'Open your MTN Mobile Money app or dial *170#.',
            'Send the desired amount to the MoMo number.',
            'Copy the transaction reference/ID from the confirmation SMS.',
            'Fill in the form below and submit your deposit request.',
            'Wait for manual verification (3–59 mins).',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-blue-800 text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Upload size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-900">Submit Deposit Request</h3>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-red-600 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-700 text-sm font-semibold block mb-1.5">
              Amount (GHC) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter amount e.g. 100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={adminConfig.minDeposit}
              max={adminConfig.maxDailyDeposit}
              step="0.01"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
            <p className="text-slate-400 text-xs mt-1">Min: {formatCurrency(adminConfig.minDeposit)} | Max: {formatCurrency(adminConfig.maxDailyDeposit)}</p>
          </div>

          <div>
            <label className="text-slate-700 text-sm font-semibold block mb-1.5">
              Sender Name (as on MoMo) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Full name as registered on MoMo"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="text-slate-700 text-sm font-semibold block mb-1.5">
              Transaction Reference <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ATS250512001234"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono"
              required
            />
            <p className="text-slate-400 text-xs mt-1">Found in your MoMo confirmation SMS.</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-slate-600 text-xs leading-relaxed">
              <strong>Important:</strong> Your deposit will be manually reviewed and verified within 3–59 mins. Ensure the sender name matches your MoMo registration. Fraudulent submissions will result in account suspension.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-base shadow-sm"
          >
            Submit Deposit Request
          </button>
        </form>
      </div>
    </div>
  );
}
