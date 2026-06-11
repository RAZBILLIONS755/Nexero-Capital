import { useState } from 'react';
import { Save, CheckCircle, Phone, DollarSign, Percent, Users } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

export default function AdminSettings() {
  const { adminConfig, updateAdminConfig } = useDataStore();
  const [form, setForm] = useState({ ...adminConfig });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const InputField = ({
    label, name, type = 'text', step, prefix, suffix, description,
  }: {
    label: string; name: keyof typeof form; type?: string;
    step?: string; prefix?: string; suffix?: string; description?: string;
  }) => (
    <div>
      <label className="text-slate-700 text-sm font-semibold block mb-1.5">{label}</label>
      {description && <p className="text-slate-400 text-xs mb-2">{description}</p>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-slate-400 text-sm font-semibold">{prefix}</span>
        )}
        <input
          type={type}
          value={form[name] as string | number}
          onChange={(e) => {
            const value = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            setForm({ ...form, [name]: value });
          }}
          step={step}
          className={`w-full ${prefix ? 'pl-10' : 'pl-4'} ${suffix ? 'pr-16' : 'pr-4'} py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500`}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-400 text-sm font-semibold">{suffix}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm">
          <CheckCircle size={16} /> Configuration saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* MoMo Settings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Phone size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-900">MTN MoMo Deposit Settings</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="MoMo Number"
              name="momoNumber"
              description="The number users will send money to"
            />
            <InputField
              label="Account Name"
              name="momoName"
              description="Name on the MoMo account"
            />
          </div>
        </div>

        {/* Deposit & Withdrawal Limits */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-900">Transaction Limits (GHC)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Minimum Deposit"
              name="minDeposit"
              type="number"
              step="1"
              prefix="GHC"
            />
            <InputField
              label="Maximum Daily Deposit"
              name="maxDailyDeposit"
              type="number"
              step="1"
              prefix="GHC"
            />
            <InputField
              label="Minimum Withdrawal"
              name="minWithdrawal"
              type="number"
              step="1"
              prefix="GHC"
            />
            <InputField
              label="Maximum Daily Withdrawal"
              name="maxDailyWithdrawal"
              type="number"
              step="1"
              prefix="GHC"
            />
            <InputField
              label="Task Min. Withdrawal Threshold"
              name="taskMinWithdrawal"
              type="number"
              step="1"
              prefix="GHC"
              description="Minimum task earnings required before withdrawal"
            />
          </div>
        </div>

        {/* Withdrawal Charges */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Percent size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-900">Withdrawal Charges (Total must equal 10%)</h3>
          </div>
          <p className="text-slate-500 text-sm mb-5">
            These 4 charges are applied to every withdrawal and must collectively equal 10%.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Service Charges"
              name="serviceChargeRate"
              type="number"
              step="0.1"
              suffix="%"
            />
            <InputField
              label="Government Tax"
              name="taxRate"
              type="number"
              step="0.1"
              suffix="%"
            />
            <InputField
              label="Maintenance Fee"
              name="maintenanceFeeRate"
              type="number"
              step="0.1"
              suffix="%"
            />
            <InputField
              label="Operational Fees"
              name="operationalFeeRate"
              type="number"
              step="0.1"
              suffix="%"
            />
          </div>
          <div className={`mt-4 flex items-center justify-between p-3 rounded-xl ${
            (form.serviceChargeRate + form.taxRate + form.maintenanceFeeRate + form.operationalFeeRate) === 10
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <span className="text-sm font-semibold text-slate-700">Total Charge Rate</span>
            <span className={`text-lg font-black ${
              (form.serviceChargeRate + form.taxRate + form.maintenanceFeeRate + form.operationalFeeRate) === 10
                ? 'text-emerald-600'
                : 'text-red-600'
            }`}>
              {(form.serviceChargeRate + form.taxRate + form.maintenanceFeeRate + form.operationalFeeRate).toFixed(1)}%
              {(form.serviceChargeRate + form.taxRate + form.maintenanceFeeRate + form.operationalFeeRate) === 10
                ? ' ✓' : ' ✗ (must be 10%)'}
            </span>
          </div>
        </div>

        {/* Referral Settings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-900">Referral Commission Rates</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Investment Referral Rate"
              name="referralInvestmentRate"
              type="number"
              step="0.1"
              suffix="%"
              description="% of deposit/investment credited to referrer"
            />
            <InputField
              label="Task Referral Rate"
              name="referralTaskRate"
              type="number"
              step="0.1"
              suffix="%"
              description="% of task earning credited to referrer"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-base shadow-sm"
        >
          <Save size={18} /> Save All Settings
        </button>
      </form>
    </div>
  );
}
