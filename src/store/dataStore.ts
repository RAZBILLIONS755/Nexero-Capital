// src/store/dataStore.ts
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'

// ===========================================
// TYPE DEFINITIONS (BASED ON YOUR ORIGINAL STORE)
// ===========================================
export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  momoNumber?: string
  withdrawalPinHash?: string
  referralCode: string
  referredBy?: string
  joinedAt: string
  accountBalance: number
  investmentBalance: number
  taskBalance: number
  totalDeposited: number
  totalWithdrawn: number
  totalInvested: number
  referralInvestmentEarnings: number
  referralTaskEarnings: number
  isActive: boolean
  isSuspended: boolean
}

export interface Transaction {
  id: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'investment' | 'task_earning' | 'referral_investment' | 'referral_task'
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  planName?: string
  reference?: string
  note?: string
  processedAt?: string
  momoNumber?: string
  chargeBreakdown?: any
}

export interface Investment {
  id: string
  userId: string
  planId: string
  planName?: string
  amount: number
  dailyEarning: number
  totalEarned: number
  startDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'closed'
  lastEarningDate?: string
}

export interface Task {
  id: string
  title: string
  description: string
  platform: string
  earning: number
  link?: string
  isActive: boolean
  completionsCount?: number
  createdAt: string
}

export interface TaskCompletion {
  id: string
  taskId: string
  userId: string
  proof?: string
  proofLink?: string
  taskTitle?: string
  earning: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface NotificationRecord {
  id: string
  userId: string
  type: string
  title: string
  body?: string
  data?: any
  createdAt: string
  read?: boolean
}

export interface InvestmentPlan {
  id: string
  name: string
  amount: number
  dailyEarning: number
  validityDays: number
  isActive: boolean
  category?: string
  isCustom?: boolean
}

export interface AdminConfig {
  momoNumber: string
  momoName: string
  minDeposit: number
  maxDailyDeposit: number
  minWithdrawal: number
  maxDailyWithdrawal: number
  taskMinWithdrawal: number
  referralInvestmentRate: number
  referralTaskRate: number
  serviceChargeRate: number
  taxRate: number
  maintenanceFeeRate: number
  operationalFeeRate: number
}

export interface ReferralRecord {
  id: string
  referrerId: string
  referredId?: string
  referredUserId?: string
  referredUserName?: string
  commission?: number
  amount?: number
  type?: string
  createdAt?: string
}

export interface SupportTicket {
  id: string
  userId?: string
  subject?: string
  message: string
  status: 'open' | 'replied' | 'closed' | 'pending'
  adminReply?: string
  createdAt: string
  updatedAt?: string
}

// ===========================================
// ZUSTAND STORE
// ===========================================
interface DataState {
  users: User[]
  transactions: Transaction[]
  investments: Investment[]
  tasks: Task[]
  taskCompletions: TaskCompletion[]
  notifications: NotificationRecord[]
  investmentPlans: InvestmentPlan[]
  adminConfig: AdminConfig
  referralRecords: ReferralRecord[]
  supportTickets: SupportTicket[]

  // Actions
  registerUser: (user: User) => void
  updateUserData: (userId: string, updates: Partial<User>) => void
  addTransaction: (tx: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  addInvestment: (inv: Investment) => void
  updateInvestment: (id: string, updates: Partial<Investment>) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  addTaskCompletion: (tc: TaskCompletion) => void
  updateTaskCompletion: (id: string, updates: Partial<TaskCompletion>) => void
  addNotification: (n: NotificationRecord) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: (userId: string) => void
  updateAdminConfig: (config: Partial<AdminConfig>) => void
  updateInvestmentPlan: (id: string, updates: Partial<InvestmentPlan>) => void
  addReferralRecord: (record: ReferralRecord) => void
  addSupportTicket: (ticket: SupportTicket) => void
  updateSupportTicket: (id: string, updates: Partial<SupportTicket>) => void
  getUserById: (id: string) => User | undefined
  getUserByEmail: (email: string) => User | undefined
  getUserByReferralCode: (code: string) => User | undefined
  // New action to fetch investment plans from Supabase
  fetchInvestmentPlans: () => Promise<void>
}

export const useDataStore = create<DataState>((set, get) => ({
  // Initial state - we'll load real data from Supabase later
  users: [],
  transactions: [],
  investments: [],
  tasks: [],
  taskCompletions: [],
  notifications: [],
  investmentPlans: [
    { id: 'plan-1', name: 'Starter Growth Plan', amount: 50, dailyEarning: 3.45, validityDays: 365, isActive: true, category: 'starter', isCustom: false },
    { id: 'plan-2', name: 'Bronze Wealth Plan', amount: 120, dailyEarning: 8.28, validityDays: 365, isActive: true, category: 'bronze', isCustom: false },
    { id: 'plan-3', name: 'Silver Income Plan', amount: 200, dailyEarning: 13.80, validityDays: 365, isActive: true, category: 'silver', isCustom: false },
    { id: 'plan-4', name: 'Smart Investor Plan', amount: 350, dailyEarning: 24.15, validityDays: 365, isActive: true, category: 'smart', isCustom: false },
    { id: 'plan-5', name: 'Gold Profit Plan', amount: 500, dailyEarning: 34.50, validityDays: 365, isActive: true, category: 'gold', isCustom: false },
    { id: 'plan-6', name: 'Premium Capital Plan', amount: 1000, dailyEarning: 69.00, validityDays: 365, isActive: true, category: 'premium', isCustom: false },
    { id: 'plan-7', name: 'Elite Growth Plan', amount: 3000, dailyEarning: 207.00, validityDays: 365, isActive: true, category: 'elite', isCustom: false },
    { id: 'plan-8', name: 'Executive Wealth Plan', amount: 4500, dailyEarning: 310.50, validityDays: 365, isActive: true, category: 'executive', isCustom: false },
    { id: 'plan-9', name: 'Platinum Investor Plan', amount: 7500, dailyEarning: 517.50, validityDays: 365, isActive: true, category: 'platinum', isCustom: false },
    { id: 'plan-10', name: 'Diamond Capital Plan', amount: 10000, dailyEarning: 690.00, validityDays: 365, isActive: true, category: 'diamond', isCustom: false },
    { id: 'plan-custom', name: 'Custom Investment Plan', amount: 0, dailyEarning: 0, validityDays: 365, isActive: true, category: 'custom', isCustom: true },
  ],
  adminConfig: {
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
  },
  referralRecords: [],
  supportTickets: [],

  // Actions - update local state
  registerUser: (user) => set({ users: [...get().users, user] }),
  updateUserData: (userId, updates) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
    })),
  addTransaction: (tx) => set({ transactions: [...get().transactions, tx] }),
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  addInvestment: (inv) => set({ investments: [...get().investments, inv] }),
  updateInvestment: (id, updates) =>
    set((state) => ({
      investments: state.investments.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),
  addTask: (task) => set({ tasks: [...get().tasks, task] }),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTask: (id) =>
    set({ tasks: get().tasks.filter((t) => t.id !== id) }),
  addTaskCompletion: (tc) => set({ taskCompletions: [...get().taskCompletions, tc] }),
  updateTaskCompletion: (id, updates) =>
    set((state) => ({
      taskCompletions: state.taskCompletions.map((tc) =>
        tc.id === id ? { ...tc, ...updates } : tc
      ),
    })),
  addNotification: (n) => set({ notifications: [...get().notifications, n] }),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: (userId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      ),
    })),
  updateAdminConfig: (config) =>
    set({ adminConfig: { ...get().adminConfig, ...config } }),
  updateInvestmentPlan: (id, updates) =>
    set((state) => ({
      investmentPlans: state.investmentPlans.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  addReferralRecord: (record) =>
    set({ referralRecords: [...get().referralRecords, record] }),
  addSupportTicket: (ticket) => set({ supportTickets: [...get().supportTickets, ticket] }),
  updateSupportTicket: (id, updates) =>
    set((state) => ({
      supportTickets: state.supportTickets.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  // New action: fetch investment plans from Supabase
  fetchInvestmentPlans: async () => {
    try {
      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      // Update the state with the fetched plans
      set({ investmentPlans: data })
    } catch (err) {
      console.error('Failed to fetch investment plans from Supabase:', err)
      // Fallback to hardcoded plans (already in state) - no action needed
    }
  },

  getUserById: (id) => get().users.find((u) => u.id === id),
  getUserByEmail: (email) =>
    get().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  getUserByReferralCode: (code) =>
    get().users.find((u) => u.referralCode === code),
}))

// ===========================================
// OPTIONAL: SET UP REAL-TIME SYNC WITH SUPABASE
// ===========================================
// We'll leave this as a comment for now - you can implement it later
// when you're ready to replace the local state actions with Supabase calls.
// For now, the store works with local state only, which is enough to
// get the app running without errors.

// Example of how you might replace an action later:
// addTransaction: async (tx) => {
//   const { data, error } = await supabase
//     .from('transactions')
//     .insert({ ...tx, user_id: useAuthStore.getState().user?.id })
//     .select()
//     .single()
//   if (error) throw error
//   // Then update local state with the returned data
//   set({ transactions: [...get().transactions, data] })
// },