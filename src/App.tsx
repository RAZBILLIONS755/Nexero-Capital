import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useAdminStore } from './store/adminStore';
import AdminLogin from './pages/admin/AdminLogin';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import DepositPage from './pages/dashboard/DepositPage';
import InvestPage from './pages/dashboard/InvestPage';
import ClaimsPage from './pages/dashboard/ClaimsPage';
import WithdrawPage from './pages/dashboard/WithdrawPage';
import TasksPage from './pages/dashboard/TasksPage';
import ReferralsPage from './pages/dashboard/ReferralsPage';
import TransactionsPage from './pages/dashboard/TransactionsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTasks from './pages/admin/AdminTasks';
import AdminInvestments from './pages/admin/AdminInvestments';
import AdminPlans from './pages/admin/AdminPlans';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSupport from './pages/admin/AdminSupport';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated } = useAuthStore();
  const { isAdmin } = useAdminStore();
  if (adminOnly) {
    if (!isAdmin) return <Navigate to="/admin/login" replace />;
    return <>{children}</>;
  }
  // non-admin protected route
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { isAdmin } = useAdminStore();
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    try {
      // Remove legacy admin persistence stored in localStorage (pre-sessionStorage change)
      localStorage.removeItem('nexero-admin');

      // Strip any legacy `isAdmin` flag from the auth persistence to avoid cross-tab admin redirects
      const raw = localStorage.getItem('nexero-auth');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            if (parsed.state && parsed.state.isAdmin !== undefined) {
              delete parsed.state.isAdmin;
              localStorage.setItem('nexero-auth', JSON.stringify(parsed));
            } else if (parsed.isAdmin !== undefined) {
              delete parsed.isAdmin;
              localStorage.setItem('nexero-auth', JSON.stringify(parsed));
            }
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardHome />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/deposit"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DepositPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/claims"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ClaimsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/invest"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <InvestPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/withdraw"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <WithdrawPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/tasks"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TasksPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/referrals"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ReferralsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/transactions"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TransactionsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminOverview />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/deposits"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminDeposits />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/withdrawals"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminWithdrawals />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminTasks />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/investments"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminInvestments />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminPlans />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminSupport />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
