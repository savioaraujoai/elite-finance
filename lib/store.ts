import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  saveTransaction, deleteTransactionFromDb,
  saveAsset, deleteAssetFromDb,
  saveFixedExpense, deleteFixedExpenseFromDb,
  updateProfileIncome,
  fetchTransactions, fetchAssets, fetchFixedExpenses, fetchProfile,
  clearAllDataInDb
} from './supabase';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  desc: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export type AssetType = 
  | 'Fiduciária' 
  | 'Criptoativo' 
  | 'Ação' 
  | 'FII' 
  | 'CDB' 
  | 'CDI' 
  | 'LCI/LCA' 
  | 'Tesouro Direto' 
  | 'Debêntures' 
  | 'Previdência' 
  | 'Rendimento Mensal' 
  | 'Rendimento Anual' 
  | 'Outros';

export interface Asset {
  symbol: string;
  flag: string;
  balance: number;
  rate: number;
  type: AssetType;
}

export interface FixedExpense {
  id: string;
  desc: string;
  amount: number;
  category: string;
}

interface FinanceState {
  userId: string | null;
  transactions: Transaction[];
  monthlyIncome: number;
  assets: Asset[];
  fixedExpenses: FixedExpense[];
  logoUrl: string | null;
  isLoading: boolean;
  setUserId: (id: string | null) => void;
  initializeFromSupabase: () => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setMonthlyIncome: (amount: number) => Promise<void>;
  addAsset: (asset: Asset) => Promise<void>;
  deleteAsset: (symbol: string) => Promise<void>;
  updateAsset: (symbol: string, updates: Partial<Asset>) => Promise<void>;
  updateAssetBalance: (symbol: string, amount: number) => Promise<void>;
  addFixedExpense: (fe: Omit<FixedExpense, 'id'>) => Promise<void>;
  deleteFixedExpense: (id: string) => Promise<void>;
  setLogoUrl: (url: string) => void;
  resetData: () => Promise<void>;
  clearLocalData: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      userId: null,
      transactions: [],
      monthlyIncome: 0,
      assets: [
        { symbol: 'USD', flag: '🇺🇸', balance: 0, rate: 5.10, type: 'Fiduciária' },
        { symbol: 'BTC', flag: '₿', balance: 0, rate: 350000.00, type: 'Criptoativo' }
      ],
      fixedExpenses: [],
      logoUrl: null,
      isLoading: false,

      setUserId: (id) => {
        const currentId = get().userId;
        if (id !== currentId) {
          // Se o usuário mudou, limpa os dados locais antes de carregar os novos
          set({ 
            userId: id,
            transactions: [],
            monthlyIncome: 0,
            fixedExpenses: [],
            assets: [
              { symbol: 'USD', flag: '🇺🇸', balance: 0, rate: 5.10, type: 'Fiduciária' },
              { symbol: 'BTC', flag: '₿', balance: 0, rate: 350000.00, type: 'Criptoativo' }
            ]
          });
        }
      },

      initializeFromSupabase: async () => {
        const { userId } = get();
        if (!userId) return;

        set({ isLoading: true });
        try {
          const [tRes, aRes, feRes, pRes] = await Promise.all([
            fetchTransactions(userId),
            fetchAssets(userId),
            fetchFixedExpenses(userId),
            fetchProfile(userId)
          ]);

          // Atualiza sempre, mesmo que venha vazio (para limpar dados de usuários anteriores)
          set({ 
            transactions: tRes.data || [],
            assets: (aRes.data && aRes.data.length > 0) ? aRes.data : [
              { symbol: 'USD', flag: '🇺🇸', balance: 0, rate: 5.10, type: 'Fiduciária' },
              { symbol: 'BTC', flag: '₿', balance: 0, rate: 350000.00, type: 'Criptoativo' }
            ],
            fixedExpenses: feRes.data || [],
            monthlyIncome: pRes.data?.monthly_income || 0
          });
        } catch (error) {
          console.error('Error fetching from Supabase:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addTransaction: async (t) => {
        const { userId } = get();
        if (!userId) return;

        const newTransaction = { 
          ...t, 
          id: Math.random().toString(36).substr(2, 9), 
          date: new Date().toISOString() 
        };
        set((state) => ({ transactions: [newTransaction, ...state.transactions] }));
        await saveTransaction(newTransaction, userId);
      },

      updateTransaction: async (id, updates) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          transactions: state.transactions.map((t) => t.id === id ? { ...t, ...updates } : t)
        }));
        const updated = get().transactions.find(t => t.id === id);
        if (updated) await saveTransaction(updated, userId);
      },

      deleteTransaction: async (id) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id)
        }));
        await deleteTransactionFromDb(id, userId);
      },

      setMonthlyIncome: async (amount) => {
        const { userId } = get();
        if (!userId) return;

        set({ monthlyIncome: amount });
        await updateProfileIncome(amount, userId);
      },

      addAsset: async (asset) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          assets: state.assets.some(a => a.symbol === asset.symbol) 
            ? state.assets.map(a => a.symbol === asset.symbol ? { ...a, ...asset } : a)
            : [...state.assets, asset]
        }));
        await saveAsset(asset, userId);
      },

      deleteAsset: async (symbol) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          assets: state.assets.filter((a) => a.symbol !== symbol)
        }));
        await deleteAssetFromDb(symbol, userId);
      },

      updateAsset: async (symbol, updates) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          assets: state.assets.map((a) => a.symbol === symbol ? { ...a, ...updates } : a)
        }));
        const updated = get().assets.find(a => a.symbol === symbol);
        if (updated) await saveAsset(updated, userId);
      },

      updateAssetBalance: async (symbol, amount) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          assets: state.assets.map((a) => a.symbol === symbol ? { ...a, balance: a.balance + amount } : a)
        }));
        const updated = get().assets.find(a => a.symbol === symbol);
        if (updated) await saveAsset(updated, userId);
      },

      addFixedExpense: async (fe) => {
        const { userId } = get();
        if (!userId) return;

        const newFE = { ...fe, id: Math.random().toString(36).substr(2, 9) };
        set((state) => ({ fixedExpenses: [...state.fixedExpenses, newFE] }));
        await saveFixedExpense(newFE, userId);
      },

      deleteFixedExpense: async (id) => {
        const { userId } = get();
        if (!userId) return;

        set((state) => ({
          fixedExpenses: state.fixedExpenses.filter((fe) => fe.id !== id)
        }));
        await deleteFixedExpenseFromDb(id, userId);
      },

      setLogoUrl: (url) => set({ logoUrl: url }),
      clearLocalData: () => {
        set({ 
          userId: null,
          transactions: [], 
          monthlyIncome: 0, 
          fixedExpenses: [],
          logoUrl: null,
          assets: [
            { symbol: 'USD', flag: '🇺🇸', balance: 0, rate: 5.10, type: 'Fiduciária' },
            { symbol: 'BTC', flag: '₿', balance: 0, rate: 350000.00, type: 'Criptoativo' }
          ] 
        });
      },
      resetData: async () => {
        const { userId } = get();
        if (!userId) return;

        set({ isLoading: true });
        try {
          await clearAllDataInDb(userId);
          set({ 
            transactions: [], 
            monthlyIncome: 0, 
            fixedExpenses: [],
            logoUrl: null,
            assets: [
              { symbol: 'USD', flag: '🇺🇸', balance: 0, rate: 5.10, type: 'Fiduciária' },
              { symbol: 'BTC', flag: '₿', balance: 0, rate: 350000.00, type: 'Criptoativo' }
            ] 
          });
        } catch (error) {
          console.error('Error resetting data:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'elite-finance-storage',
    }
  )
);
