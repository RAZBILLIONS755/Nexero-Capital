import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Wallet, ArrowDownToLine,
  CheckSquare, Users, LogOut, Menu, X, Bell, ChevronRight,
  Settings, Shield, Gift
} from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import Logo from './Logo';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { formatCurrency, showBrowserNotification, generateId } from '../utils/helpers';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Deposit', icon: ArrowDownToLine, path: '/dashboard/deposit' },
  { label: 'Invest', icon: TrendingUp, path: '/dashboard/invest' },
  { label: 'Claim Rewards', icon: Gift, path: '/dashboard/claims' },
  { label: 'Withdraw', icon: Wallet, path: '/dashboard/withdraw' },
  { label: 'Tasks', icon: CheckSquare, path: '/dashboard/tasks' },
  { label: 'Referrals', icon: Users, path: '/dashboard/referrals' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const getUserById = useDataStore((s) => s.getUserById);
  const markNotificationRead = useDataStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useDataStore((s) => s.markAllNotificationsRead);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const supportRef = useRef<HTMLDivElement | null>(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportError, setSupportError] = useState('');
  const [supportSending, setSupportSending] = useState(false);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // close support popover when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) {
        setSupportOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // notifications for current user (memoize filtered list to keep selector stable)
  const notifications = useDataStore((s) => s.notifications);
  const myNotifications = useMemo(() => (user ? (notifications || []).filter((n) => n.userId === user.id) : []), [notifications, user?.id]);
  const unreadCount = myNotifications.filter((n) => !n.read).length;
  const shownRef = useRef<Set<string>>(new Set());

  // Show browser notifications for new notifications and play tone
  useEffect(() => {
    try {
      myNotifications.forEach((n) => {
        if (!shownRef.current.has(n.id)) {
          shownRef.current.add(n.id);
          if (!n.read) showBrowserNotification(n.title, n.body);
        }
      });
    } catch (err) {}
  }, [myNotifications]);

  // Periodically check investments for claim availability and notify user
  useEffect(() => {
    if (!user) return;
    const checkClaims = () => {
      try {
        const state = useDataStore.getState();
        const invs = state.investments.filter((i) => i.userId === user.id && i.status === 'active');
        invs.forEach((inv) => {
          const last = inv.lastEarningDate ? new Date(inv.lastEarningDate) : new Date(inv.startDate);
          const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
          const now = new Date();
          if (next <= now) {
            const exists = state.notifications.find((nn) => nn.type === 'claim_available' && nn.data?.invId === inv.id && nn.userId === user.id);
            if (!exists) {
              // schedule notification addition after mount to avoid nested store updates during commit
              setTimeout(() => {
                try {
                  useDataStore.getState().addNotification({ id: generateId(), userId: user.id, type: 'claim_available', title: `Claim available: ${inv.planName}`, body: `You have ${formatCurrency(inv.dailyEarning)} available to claim for ${inv.planName}.`, data: { invId: inv.id }, createdAt: new Date().toISOString(), read: false });
                } catch (e) {
                  // ignore
                }
              }, 0);
            }
          }
        });
      } catch (err) {}
    };

    checkClaims();
    const iv = setInterval(checkClaims, 60 * 1000);
    return () => clearInterval(iv);
  }, [user]);

  // Push notifications removed; only in-site bell notifications are used.

  // Read authoritative user record from dataStore to keep sidebar balances in sync
  const displayUser = useDataStore((s) => (user ? s.users.find((uu) => uu.id === user.id) : undefined)) || user;

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const submitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportError('');
    if (!supportMessage.trim()) {
      setSupportError('Please enter a message.');
      return;
    }
    setSupportSending(true);
    try {
      const now = new Date().toISOString();

      const ticket = {
        id: generateId(),
        userId: user?.id || '',
        subject: supportSubject,
        message: supportMessage,
        status: 'open' as const,
        createdAt: now,
      };

      try { useDataStore.getState().addSupportTicket(ticket as any); } catch (e) {}

      const adminNotif = {
        id: generateId(),
        userId: 'admin',
        type: 'support_ticket',
        title: `Support request from ${user?.fullName || 'User'}`,
        body: `${supportSubject ? supportSubject + ' — ' : ''}${supportMessage}`,
        data: { ticketId: ticket.id, subject: supportSubject, message: supportMessage, userId: user?.id },
        createdAt: now,
        read: false,
      };

      const userNotif = {
        id: generateId(),
        userId: user?.id || '',
        type: 'support_submitted',
        title: 'Support request submitted',
        body: 'Your message has been sent to support. We will reply shortly.',
        data: { ticketId: ticket.id, subject: supportSubject },
        createdAt: now,
        read: false,
      };

      // add notifications for admin and user
      try { useDataStore.getState().addNotification(adminNotif as any); } catch (e) {}
      try { useDataStore.getState().addNotification(userNotif as any); } catch (e) {}

      setSupportModalOpen(false);
      setSupportOpen(false);
      setSupportSubject('');
      setSupportMessage('');
    } finally {
      setSupportSending(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-slate-100">
        <Logo size="sm" />
      </div>

      <div className="px-4 py-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
              {(displayUser?.fullName ? displayUser.fullName.charAt(0) : '?').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{displayUser?.fullName}</div>
              <div className="text-blue-200 text-xs truncate">{displayUser?.email}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/15 rounded-lg p-2">
              <div className="text-blue-200 text-[10px] font-medium uppercase tracking-wide">Task Earnings</div>
              <div className="text-white font-bold text-sm mt-0.5">
                {formatCurrency(displayUser?.taskBalance || 0)}
              </div>
            </div>
            <div className="bg-white/15 rounded-lg p-2">
              <div className="text-blue-200 text-[10px] font-medium uppercase tracking-wide">Investment Earnings</div>
              <div className="text-white font-bold text-sm mt-0.5">
                {formatCurrency(displayUser?.investmentBalance || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-[Inter,sans-serif]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 shadow-sm shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white shadow-2xl flex flex-col">
            <button
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:block">
              <h1 className="text-slate-900 font-bold text-lg">
                {navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-lg z-50">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-semibold text-slate-900 mb-0">Notifications</h3>
                      <button onClick={() => markAllNotificationsRead(user?.id || '')} className="ml-auto text-xs text-slate-500 hover:underline">Mark all read</button>
                    </div>
                    {myNotifications.length === 0 ? (
                      <div className="text-sm text-slate-500">No notifications yet.</div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {myNotifications.map((n) => (
                          <div key={n.id} onClick={() => { if (!n.read) markNotificationRead(n.id); }} className={`cursor-pointer p-3 rounded-lg border ${n.read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-200'}`}>
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <div className="font-semibold text-sm">{n.title}</div>
                                {n.body && <div className="text-xs text-slate-500 mt-1">{n.body}</div>}
                                <div className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                              </div>
                              <div className="ml-2">
                                {!n.read && <button onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }} className="text-xs text-blue-600 font-semibold">Mark read</button>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
                ) : (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full opacity-30" />
                )}
            </div>
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {(displayUser?.fullName ? displayUser.fullName.charAt(0) : '?').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
        {/* Support Widget: Telegram or Contact Form */}
        <div ref={supportRef} className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
          {supportOpen && (
            <div className="w-64 bg-white border border-slate-100 rounded-xl shadow-lg p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Support</div>
                <button onClick={() => setSupportOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setSupportModalOpen(true); setSupportOpen(false); }} className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md text-sm">
                  Fill contact form
                </button>
              </div>
            </div>
          )}

          {/* Floating support toggle button */}
          <button onClick={() => setSupportOpen((s) => !s)} className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center">
            <MessageSquare size={20} />
          </button>

          {/* Support modal */}
          {supportModalOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center">
              <div className="fixed inset-0 bg-black/40" onClick={() => setSupportModalOpen(false)} />
              <div className="bg-white rounded-xl shadow-2xl p-6 z-70 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-3">Contact Support</h3>
                <form onSubmit={submitSupport} className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-600">Subject (optional)</label>
                    <input value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="Brief subject" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Message</label>
                    <textarea value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} rows={4} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="Describe your issue or question" />
                  </div>
                  {supportError && <div className="text-sm text-red-600">{supportError}</div>}
                  <div className="flex items-center gap-2">
                    <button type="submit" disabled={supportSending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                      {supportSending ? 'Sending...' : 'Send Message'}
                    </button>
                    <button type="button" onClick={() => setSupportModalOpen(false)} className="px-3 py-2 text-sm text-slate-600">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
