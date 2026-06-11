import { useState } from 'react';
import { Save, TrendingUp } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency } from '../../utils/helpers';

export default function AdminPlans() {
  const { investmentPlans, updateInvestmentPlan } = useDataStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ dailyEarning: '', isActive: true });
  const [saved, setSaved] = useState<string | null>(null);

  const handleEdit = (planId: string) => {
    const plan = investmentPlans.find((p) => p.id === planId);
    if (!plan) return;
    setEditId(planId);
    setEditForm({ dailyEarning: plan.dailyEarning.toString(), isActive: plan.isActive });
  };

  const handleSave = (planId: string) => {
    updateInvestmentPlan(planId, {
      dailyEarning: parseFloat(editForm.dailyEarning),
      isActive: editForm.isActive,
    });
    setEditId(null);
    setSaved(planId);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> Adjusting daily earnings for investment plans will affect all future earnings credits for active investments using that plan. Plan amounts and validity periods remain fixed at 365 days.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {investmentPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{plan.name}</div>
                <div className="text-slate-400 text-xs">
                  {plan.isCustom ? 'Custom amount' : formatCurrency(plan.amount)} • 365 days
                </div>
              </div>
            </div>

            {editId === plan.id ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Daily Earning (GHC)</label>
                  <input
                    type="number"
                    value={editForm.dailyEarning}
                    onChange={(e) => setEditForm({ ...editForm, dailyEarning: e.target.value })}
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    disabled={plan.isCustom}
                  />
                  {plan.isCustom && <p className="text-slate-400 text-xs mt-1">Custom plan earnings are auto-calculated.</p>}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`active-${plan.id}`}
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor={`active-${plan.id}`} className="text-sm text-slate-700">Active</label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(plan.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    <Save size={14} /> Save
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Daily Earning</span>
                    <span className="font-black text-emerald-600">
                      {plan.isCustom ? 'Auto-calc' : formatCurrency(plan.dailyEarning)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Annual Return</span>
                    <span className="font-semibold text-slate-700">
                      {plan.isCustom ? 'Variable' : formatCurrency(plan.dailyEarning * 365)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Status</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan.id)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    Edit Plan
                  </button>
                  <button
                    onClick={() => updateInvestmentPlan(plan.id, { isActive: !plan.isActive })}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
                      plan.isActive
                        ? 'bg-red-50 hover:bg-red-100 text-red-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {plan.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>

                {saved === plan.id && (
                  <div className="mt-2 text-center text-emerald-600 text-xs font-semibold">✓ Saved successfully!</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
