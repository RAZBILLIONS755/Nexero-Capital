import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { generateId, formatCurrency } from '../utils/helpers';

// Domain types used across the data store
interface Investment {
  id: string;
  userId: string;
  planId: string;
  planName?: string;
  amount: number;
  dailyEarning: number;
  totalEarned: number;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'closed';
  lastEarningDate?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  platform: string;
  earning: number;
  link?: string;
  isActive: boolean;
  completionsCount?: number;
  createdAt: string;
}

interface TaskCompletion {
  id: string;
  taskId: string;
  userId: string;
  proof?: string;
  proofLink?: string;
  taskTitle?: string;
  earning: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface InvestmentPlan {
  id: string;
  name: string;
  amount: number;
  dailyEarning: number;
  validityDays: number;
  isActive: boolean;
  category?: string;
  isCustom?: boolean;
}

interface AdminConfig {
  momoNumber: string;
  momoName: string;
  minDeposit: number;
  maxDailyDeposit: number;
  minWithdrawal: number;
  maxDailyWithdrawal: number;
  taskMinWithdrawal: number;
  referralInvestmentRate: number;
  referralTaskRate: number;
  serviceChargeRate: number;
  taxRate: number;
  maintenanceFeeRate: number;
  operationalFeeRate: number;
}

interface ReferralRecord {
  id: string;
  referrerId: string;
  referredId?: string;
  referredUserId?: string;
  referredUserName?: string;
  commission?: number;
  amount?: number;
  type?: string;
  createdAt?: string;
}

interface SupportTicket {
  id: string;
  userId?: string;
  subject?: string;
  message: string;
  status: 'open' | 'replied' | 'closed' | 'pending';
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'task_earning' | 'referral_investment' | 'referral_task';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  // optional fields used in various views
  createdAt: string;
  planName?: string;
  reference?: string;
  note?: string;
  processedAt?: string;
  momoNumber?: string;
  chargeBreakdown?: any;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: any;
  createdAt: string;
  read?: boolean;
}

export interface RegisteredUser extends Omit<import('./authStore').User, 'investmentBalance' | 'taskBalance' | 'totalDeposited' | 'totalWithdrawn' | 'totalInvested' | 'referralInvestmentEarnings' | 'referralTaskEarnings'> {
  password: string;
  investmentBalance: number;
  taskBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalInvested: number;
  referralInvestmentEarnings: number;
  referralTaskEarnings: number;
}

interface DataState {
  users: RegisteredUser[];
  transactions: Transaction[];
  investments: Investment[];
  tasks: Task[];
  taskCompletions: TaskCompletion[];
  notifications: NotificationRecord[];
  investmentPlans: InvestmentPlan[];
  adminConfig: AdminConfig;
  referralRecords: ReferralRecord[];
  supportTickets: SupportTicket[];

  registerUser: (user: RegisteredUser) => void;
  updateUserData: (userId: string, updates: Partial<RegisteredUser>) => void;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  addInvestment: (inv: Investment) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTaskCompletion: (tc: TaskCompletion) => void;
  updateTaskCompletion: (id: string, updates: Partial<TaskCompletion>) => void;
  addNotification: (n: NotificationRecord) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  updateAdminConfig: (config: Partial<AdminConfig>) => void;
  updateInvestmentPlan: (id: string, updates: Partial<InvestmentPlan>) => void;
  addReferralRecord: (record: ReferralRecord) => void;
  addSupportTicket: (ticket: SupportTicket) => void;
  updateSupportTicket: (id: string, updates: Partial<SupportTicket>) => void;
  getUserById: (id: string) => RegisteredUser | undefined;
  getUserByEmail: (email: string) => RegisteredUser | undefined;
  getUserByReferralCode: (code: string) => RegisteredUser | undefined;
}

const defaultPlans: InvestmentPlan[] = [
  { id: 'plan-1', name: 'Starter Growth Plan', amount: 50, dailyEarning: 3.45, validityDays: 365, isActive: true, category: 'starter' },
  { id: 'plan-2', name: 'Bronze Wealth Plan', amount: 120, dailyEarning: 8.28, validityDays: 365, isActive: true, category: 'bronze' },
  { id: 'plan-3', name: 'Silver Income Plan', amount: 200, dailyEarning: 13.80, validityDays: 365, isActive: true, category: 'silver' },
  { id: 'plan-4', name: 'Smart Investor Plan', amount: 350, dailyEarning: 24.15, validityDays: 365, isActive: true, category: 'smart' },
  { id: 'plan-5', name: 'Gold Profit Plan', amount: 500, dailyEarning: 34.50, validityDays: 365, isActive: true, category: 'gold' },
  { id: 'plan-6', name: 'Premium Capital Plan', amount: 1000, dailyEarning: 69.00, validityDays: 365, isActive: true, category: 'premium' },
  { id: 'plan-7', name: 'Elite Growth Plan', amount: 3000, dailyEarning: 207.00, validityDays: 365, isActive: true, category: 'elite' },
  { id: 'plan-8', name: 'Executive Wealth Plan', amount: 4500, dailyEarning: 310.50, validityDays: 365, isActive: true, category: 'executive' },
  { id: 'plan-9', name: 'Platinum Investor Plan', amount: 7500, dailyEarning: 517.50, validityDays: 365, isActive: true, category: 'platinum' },
  { id: 'plan-10', name: 'Diamond Capital Plan', amount: 10000, dailyEarning: 690.00, validityDays: 365, isActive: true, category: 'diamond' },
  { id: 'plan-custom', name: 'Custom Investment Plan', amount: 0, dailyEarning: 0, validityDays: 365, isActive: true, isCustom: true, category: 'custom' },
];

const defaultConfig: AdminConfig = {
  momoNumber: '0551234567',
  momoName: 'Nexero Capital Ltd',
  minDeposit: 50,
  maxDailyDeposit: 11920,
  minWithdrawal: 30,
  maxDailyWithdrawal: 11920,
  taskMinWithdrawal: 50,
  referralInvestmentRate: 5,
  referralTaskRate: 10,
  serviceChargeRate: 2.5,
  taxRate: 2.5,
  maintenanceFeeRate: 2.5,
  operationalFeeRate: 2.5,
};

const defaultTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Subscribe to Nexero Capital YouTube Channel',
    description: 'Subscribe to our official YouTube channel and leave a thumbs up on our latest video.',
    platform: 'youtube',
    earning: 5.00,
    link: 'https://youtube.com',
    isActive: true,
    completionsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Like & Share our Facebook Page',
    description: 'Like our Facebook business page and share our latest post with your friends.',
    platform: 'facebook',
    earning: 3.50,
    link: 'https://facebook.com',
    isActive: true,
    completionsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Watch & Comment on YouTube Video',
    description: 'Watch our featured YouTube video completely and leave a meaningful comment.',
    platform: 'youtube',
    earning: 7.00,
    link: 'https://youtube.com',
    isActive: true,
    completionsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Follow Nexero on Instagram',
    description: 'Follow our official Instagram account and like our 3 most recent posts.',
    platform: 'instagram',
    earning: 4.00,
    link: 'https://instagram.com',
    isActive: true,
    completionsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Retweet & Follow on Twitter/X',
    description: 'Follow our Twitter/X account and retweet our pinned post.',
    platform: 'twitter',
    earning: 3.00,
    link: 'https://twitter.com',
    isActive: true,
    completionsCount: 0,
    createdAt: new Date().toISOString(),
  },
];

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      users: [],
      transactions: [],
      investments: [],
      tasks: defaultTasks,
      taskCompletions: [],
      notifications: [],
      investmentPlans: defaultPlans,
      adminConfig: defaultConfig,
      referralRecords: [],
          supportTickets: [],

      // notification helpers
      addNotification: (n) =>
        set((state) => ({ notifications: [n, ...(state.notifications || [])] })),

      markNotificationRead: (id) =>
        set((state) => ({ notifications: (state.notifications || []).map((nn) => (nn.id === id ? { ...nn, read: true } : nn)) })),

      markAllNotificationsRead: (userId) =>
        set((state) => ({ notifications: (state.notifications || []).map((nn) => (nn.userId === userId ? { ...nn, read: true } : nn)) })),

      registerUser: (user) =>
        set((state) => ({ users: [...state.users, user] })),

      updateUserData: (userId, updates) =>
        set((state) => {
          const users = state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
          // If the currently authenticated user matches the updated user, update auth store too
          try {
            const auth = useAuthStore.getState();
            if (auth.user && auth.user.id === userId) {
              // merge only user profile fields into auth store's user
              useAuthStore.setState({ user: { ...auth.user, ...updates } as any });
            }
          } catch (err) {
            // ignore cross-store update errors
          }
          return { users };
        }),

      addTransaction: (tx) =>
        set((state) => {
          const now = new Date().toISOString();
          const transactions = [tx, ...state.transactions];
          let notifications = state.notifications || [];

          // Notify both admin and user on new pending transactions
          if (tx.status === 'pending') {
            const user = state.users.find((u) => u.id === tx.userId);
            const adminNotif: NotificationRecord = {
              id: generateId(),
              userId: 'admin',
              type: `${tx.type}_submitted`,
              title: `New ${tx.type} submitted: ${formatCurrency(tx.amount)}`,
              body: `${user?.fullName || tx.userId} submitted a ${tx.type}. Ref: ${tx.reference || ''}`.trim(),
              data: { txId: tx.id },
              createdAt: now,
              read: false,
            };

            const userNotif: NotificationRecord = {
              id: generateId(),
              userId: tx.userId,
              type: `${tx.type}_submitted`,
              title: `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} submitted`,
              body: `Your ${tx.type} of ${formatCurrency(tx.amount)} has been submitted and is pending review.`,
              data: { txId: tx.id },
              createdAt: now,
              read: false,
            };

            notifications = [userNotif, adminNotif, ...notifications];
          }

          // If transaction is created already approved (e.g. investment), notify user
          if (tx.status === 'approved') {
            const userNotif: NotificationRecord = {
              id: generateId(),
              userId: tx.userId,
              type: `${tx.type}_approved`,
              title: `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} processed`,
              body: `Your ${tx.type} of ${formatCurrency(tx.amount)} has been processed.`,
              data: { txId: tx.id },
              createdAt: now,
              read: false,
            };
            notifications = [userNotif, ...notifications];
          }

          return { transactions, notifications };
        }),

      updateTransaction: (id, updates) =>
        set((state) => {
          const prev = state.transactions.find((t) => t.id === id);
          const updated = prev ? { ...prev, ...updates } : null;
          const transactions = state.transactions.map((t) => (t.id === id ? (updated || t) : t));
          let notifications = state.notifications || [];

          if (prev && updates.status && updated && updates.status !== prev.status) {
            const now = new Date().toISOString();
            // Notify the transaction owner about status changes
            const userNotif: NotificationRecord = {
              id: generateId(),
              userId: updated.userId,
              type: `${updated.type}_${updates.status}`,
              title: `${updated.type.charAt(0).toUpperCase() + updated.type.slice(1)} ${updates.status}`,
              body: `Your ${updated.type} of ${formatCurrency(updated.amount)} has been ${updates.status}.`,
              data: { txId: updated.id },
              createdAt: now,
              read: false,
            };

            notifications = [userNotif, ...notifications];
          }

          return { transactions, notifications };
        }),

      addInvestment: (inv) =>
        set((state) => ({ investments: [...state.investments, inv] })),

      updateInvestment: (id, updates) =>
        set((state) => {
          const prev = state.investments.find((i) => i.id === id);
          const updated = prev ? { ...prev, ...updates } : null;
          const investments = state.investments.map((i) => (i.id === id ? (updated || i) : i));
          let notifications = state.notifications || [];

          // notify user when a claim (lastEarningDate) is recorded
          if (prev && updates.lastEarningDate && updated && updates.lastEarningDate !== prev.lastEarningDate) {
            const now = new Date().toISOString();
            const userNotif: NotificationRecord = {
              id: generateId(),
              userId: updated.userId,
              type: 'claim_earned',
              title: `Claimed ${formatCurrency(updated.dailyEarning)}`,
              body: `You claimed ${formatCurrency(updated.dailyEarning)} for ${updated.planName}.`,
              data: { invId: updated.id },
              createdAt: now,
              read: false,
            };
            notifications = [userNotif, ...notifications];
          }

          return { investments, notifications };
        }),

      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, task] })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      addTaskCompletion: (tc) =>
        set((state) => {
          const taskCompletions = [tc, ...state.taskCompletions];
          const now = new Date().toISOString();
          const user = state.users.find((u) => u.id === tc.userId);
          const adminNotif: NotificationRecord = {
            id: generateId(),
            userId: 'admin',
            type: `task_submission`,
            title: `Task submission: ${tc.taskTitle}`,
            body: `${user?.fullName || tc.userId} submitted ${tc.taskTitle}.`,
            data: { tcId: tc.id },
            createdAt: now,
            read: false,
          };

          const userNotif: NotificationRecord = {
            id: generateId(),
            userId: tc.userId,
            type: `task_submitted`,
            title: `Task submitted`,
            body: `Your submission for ${tc.taskTitle} is pending review.`,
            data: { tcId: tc.id },
            createdAt: now,
            read: false,
          };

          const notifications = [userNotif, adminNotif, ...(state.notifications || [])];
          return { taskCompletions, notifications };
        }),

      updateTaskCompletion: (id, updates) =>
        set((state) => {
          const prev = state.taskCompletions.find((tc) => tc.id === id);
          const updated = prev ? { ...prev, ...updates } : null;
          const taskCompletions = state.taskCompletions.map((tc) => (tc.id === id ? (updated || tc) : tc));
          let notifications = state.notifications || [];

          if (prev && updates.status && updated && updates.status !== prev.status) {
            const now = new Date().toISOString();
            const userNotif: NotificationRecord = {
              id: generateId(),
              userId: updated.userId,
              type: `task_${updates.status}`,
              title: updates.status === 'approved' ? 'Task approved' : 'Task rejected',
              body: updates.status === 'approved'
                ? `Your submission for ${updated.taskTitle} was approved. You earned ${formatCurrency(updated.earning)}.`
                : `Your submission for ${updated.taskTitle} was rejected.`,
              data: { tcId: updated.id },
              createdAt: now,
              read: false,
            };

            notifications = [userNotif, ...notifications];
          }

          return { taskCompletions, notifications };
        }),

      updateAdminConfig: (config) =>
        set((state) => ({ adminConfig: { ...state.adminConfig, ...config } })),

      addSupportTicket: (ticket) =>
        set((state) => ({ supportTickets: [ticket, ...(state.supportTickets || [])] })),

      updateSupportTicket: (id, updates) =>
        set((state) => {
          const supportTickets = (state.supportTickets || []).map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
          let notifications = state.notifications || [];
          const updated = supportTickets.find((s) => s.id === id);
          if (updated && updates.adminReply) {
            const userNotif: NotificationRecord = {
              id: generateId(),
              userId: updated.userId || '',
              type: 'support_reply',
              title: 'Support reply',
              body: `Support replied: ${updates.adminReply}`,
              data: { ticketId: id },
              createdAt: new Date().toISOString(),
              read: false,
            };
            notifications = [userNotif, ...notifications];
          }
          if (updated && updates.status && updates.status === 'closed') {
            const userNotif: NotificationRecord = {
              id: generateId(),
              userId: updated.userId || '',
              type: 'support_closed',
              title: 'Support request closed',
              body: `Your support request${updated.subject ? ` (${updated.subject})` : ''} was closed by admin.`,
              data: { ticketId: id },
              createdAt: new Date().toISOString(),
              read: false,
            };
            notifications = [userNotif, ...notifications];
          }

          return { supportTickets, notifications };
        }),

      updateInvestmentPlan: (id, updates) =>
        set((state) => ({
          investmentPlans: state.investmentPlans.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      addReferralRecord: (record) =>
        set((state) => ({ referralRecords: [...state.referralRecords, record] })),

      getUserById: (id) => get().users.find((u) => u.id === id),
      getUserByEmail: (email) => get().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
      getUserByReferralCode: (code) => get().users.find((u) => u.referralCode === code),
    }),
    { name: 'nexero-data' }
  )
);

// Cross-tab synchronization: listen for `storage` events and rehydrate store
// when the persisted `nexero-data` value changes in another tab.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== 'nexero-data') return;
    try {
      if (!e.newValue) return;
      const parsed = JSON.parse(e.newValue);
      const incomingState = parsed && parsed.state ? parsed.state : parsed;
      if (incomingState && typeof incomingState === 'object') {
        // Merge incoming serialized state into the zustand store.
        // Only apply when the incoming data actually differs from current state
        const current = useDataStore.getState();
        const keys: (keyof DataState)[] = [
          'users',
          'transactions',
          'investments',
          'tasks',
          'taskCompletions',
          'notifications',
          'investmentPlans',
          'adminConfig',
          'referralRecords',
        ];

        const pick = (obj: any) => {
          const out: any = {};
          for (const k of keys) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
          }
          return out;
        };

        const incomingPick = pick(incomingState);
        const currentPick = pick(current);
        try {
          if (JSON.stringify(incomingPick) !== JSON.stringify(currentPick)) {
            useDataStore.setState(incomingPick as Partial<DataState>);
          }
        } catch (err) {
          // Fallback: apply incoming state if comparison fails
          useDataStore.setState(incomingState as Partial<DataState>);
        }
      }
    } catch (err) {
      // ignore malformed storage entries
    }
  });
}
