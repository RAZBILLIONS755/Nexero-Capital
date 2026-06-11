import { useState } from 'react';
import { User, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { updateUserData, getUserById } = useDataStore();

  const freshUser = user ? getUserById(user.id) : null;
  const u = freshUser || user;

  const [profileForm, setProfileForm] = useState({
    fullName: u?.fullName || '',
    phone: u?.phone || '',
    momoNumber: u?.momoNumber || '',
  });

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileForm.fullName.trim()) {
      setProfileError('Full name is required.');
      return;
    }
    if (!profileForm.phone || profileForm.phone.length < 10) {
      setProfileError('Please enter a valid phone number.');
      return;
    }
    if (!profileForm.momoNumber || profileForm.momoNumber.length < 10) {
      setProfileError('Please enter a valid MoMo number.');
      return;
    }

    updateUserData(user!.id, {
      fullName: profileForm.fullName.trim(),
      phone: profileForm.phone,
      momoNumber: profileForm.momoNumber,
    });

    updateUser({
      fullName: profileForm.fullName.trim(),
      phone: profileForm.phone,
      momoNumber: profileForm.momoNumber,
    });

    setProfileSuccess('Profile updated successfully.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    const dbUser = getUserById(user!.id);
    if (!dbUser) return;

    if (dbUser.password !== passForm.currentPassword) {
      setPassError('Current password is incorrect.');
      return;
    }
    if (passForm.newPassword.length < 8) {
      setPassError('New password must be at least 8 characters.');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError('Passwords do not match.');
      return;
    }

    updateUserData(user!.id, { password: passForm.newPassword } as any);
    setPassSuccess('Password changed successfully.');
    setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Account Settings</h2>
        <p className="text-slate-500 mt-1">Manage your profile and security settings.</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-900">Profile Information</h3>
        </div>

        {profileError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
            <AlertCircle size={14} /> {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-emerald-700 text-sm">
            <CheckCircle size={14} /> {profileSuccess}
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="text-slate-700 text-sm font-semibold block mb-1.5">Full Name</label>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-slate-700 text-sm font-semibold block mb-1.5">Email</label>
            <input
              type="email"
              value={u?.email || ''}
              disabled
              className="w-full px-4 py-2.5 border border-slate-100 rounded-xl text-slate-400 text-sm bg-slate-50 cursor-not-allowed"
            />
            <p className="text-slate-400 text-xs mt-1">Email cannot be changed.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 text-sm font-semibold block mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-slate-700 text-sm font-semibold block mb-1.5">MoMo Number</label>
              <input
                type="tel"
                value={profileForm.momoNumber}
                onChange={(e) => setProfileForm({ ...profileForm, momoNumber: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-slate-400 text-xs mb-1">Referral Code</div>
                <div className="font-mono font-bold text-slate-900">{u?.referralCode}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">Member Since</div>
                <div className="font-semibold text-slate-900 text-sm">
                  {new Date(u?.joinedAt || '').toLocaleDateString('en-GH', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-900">Change Password</h3>
        </div>

        {passError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
            <AlertCircle size={14} /> {passError}
          </div>
        )}
        {passSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-emerald-700 text-sm">
            <CheckCircle size={14} /> {passSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
            <div key={field}>
              <label className="text-slate-700 text-sm font-semibold block mb-1.5">
                {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={passForm[field as keyof typeof passForm]}
                  onChange={(e) => setPassForm({ ...passForm, [field]: e.target.value })}
                  placeholder={i === 0 ? 'Your current password' : i === 1 ? 'Min. 8 characters' : 'Repeat new password'}
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
                {i === 0 && (
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
          >
            Change Password
          </button>
        </form>
      </div>

      {/* Account Stats */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-4">Account Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Investment Balance', value: `GHC ${(u?.investmentBalance || 0).toFixed(2)}` },
            { label: 'Task Balance', value: `GHC ${(u?.taskBalance || 0).toFixed(2)}` },
            { label: 'Total Deposited', value: `GHC ${(u?.totalDeposited || 0).toFixed(2)}` },
            { label: 'Total Withdrawn', value: `GHC ${(u?.totalWithdrawn || 0).toFixed(2)}` },
            { label: 'Total Invested', value: `GHC ${(u?.totalInvested || 0).toFixed(2)}` },
            { label: 'Referral Earnings', value: `GHC ${((u?.referralInvestmentEarnings || 0) + (u?.referralTaskEarnings || 0)).toFixed(2)}` },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-3">
              <div className="text-slate-400 text-xs mb-1">{item.label}</div>
              <div className="font-bold text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
