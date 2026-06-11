import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, ArrowDownToLine, Wallet, CheckSquare,
  Settings, TrendingUp, LogOut, Menu, X, ChevronRight, Shield, Bell, MessageSquare
} from 'lucide-react';
import Logo from '../../components/Logo';
import { useAdminStore } from '../../store/adminStore';
import { useDataStore } from '../../store/dataStore';
import { showBrowserNotification } from '../../utils/helpers';

const adminNavItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Support', icon: MessageSquare, path: '/admin/support' },
  { label: 'Deposits', icon: ArrowDownToLine, path: '/admin/deposits' },
  { label: 'Withdrawals', icon: Wallet, path: '/admin/withdrawals' },
  { label: 'Tasks', icon: CheckSquare, path: '/admin/tasks' },
  { label: 'Investments', icon: TrendingUp, path: '/admin/investments' },
  { label: 'Plans', icon: Shield, path: '/admin/plans' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = useAdminStore((s) => s.admin);
  const { logoutAdmin } = useAdminStore();
  const notifications = useDataStore((s) => s.notifications);
  const markNotificationRead = useDataStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useDataStore((s) => s.markAllNotificationsRead);
  const unreadCount = notifications.filter((n) => n.userId === 'admin' && !n.read).length;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const shownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // show browser notifications for admin targets
  useEffect(() => {
    try {
      const state = useDataStore.getState();
      state.notifications.filter((n) => n.userId === 'admin').forEach((n) => {
        if (!shownRef.current.has(n.id)) {
          shownRef.current.add(n.id);
          if (!n.read) showBrowserNotification(n.title, n.body);
        }
      });
    } catch (err) {}
  }, [notifications]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-800">
        <Logo size="sm" variant="light" />
        <div className="mt-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          <span className="text-emerald-400 text-xs font-semibold">Admin Control Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {adminNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 font-[Inter,sans-serif]">
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-slate-900 shadow-2xl flex flex-col">
            <button
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:bg-slate-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-slate-900 font-bold text-lg">
                {adminNavItems.find((n) => n.path === location.pathname)?.label || 'Admin'}
              </h1>
              <p className="text-slate-400 text-xs">Nexero Capital Administration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div ref={notifRef} className="relative">
              <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  <Bell size={18} />
                  {unreadCount > 0 ? (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 text-white rounded-full flex items-center justify-center text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  ) : (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full" />
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 text-white border border-slate-800 rounded-xl shadow-lg z-50">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-semibold mb-0">Admin Notifications</h3>
                        <button onClick={() => markAllNotificationsRead('admin')} className="ml-auto text-xs text-slate-300 hover:underline">Mark all read</button>
                      </div>
                      {notifications.filter((n) => n.userId === 'admin').length === 0 ? (
                        <div className="text-sm text-slate-300">No notifications yet.</div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {notifications.filter((n) => n.userId === 'admin').map((n) => (
                            <div key={n.id} onClick={() => { if (!n.read) markNotificationRead(n.id); }} className={`cursor-pointer p-3 rounded-lg border ${n.read ? 'bg-slate-800 border-slate-700' : 'bg-amber-600 border-amber-500'}`}>
                              <div className="flex items-start gap-2">
                                <div className="flex-1">
                                  <div className="font-semibold text-sm">{n.title}</div>
                                  {n.body && <div className="text-xs text-slate-200 mt-1">{n.body}</div>}
                                  <div className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                                </div>
                                <div className="ml-2">
                                  {!n.read && <button onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }} className="text-xs text-white font-semibold">Mark read</button>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
