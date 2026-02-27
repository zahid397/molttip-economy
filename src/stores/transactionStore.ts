import { create } from 'zustand';
import { Transaction, TransactionStatus } from '@/types';

interface TransactionStore {
  transactions:      Transaction[];
  recordTransaction: (tx: Omit<Transaction, 'id' | 'status' | 'timestamp'>) => Promise<Transaction>;
  getByAgent:        (agentId: string) => Transaction[];
  clearHistory:      () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],

  recordTransaction: async (tx) => {
    const newTx: Transaction = {
      ...tx,
      id:        `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      status:    'pending' as TransactionStatus,
      timestamp: Date.now(),
    };

    set(state => ({ transactions: [newTx, ...state.transactions] }));

    try {
      await new Promise(res => setTimeout(res, 300));

      const confirmed: Transaction = {
        ...newTx,
        status:      'confirmed' as TransactionStatus,
        confirmedAt: Date.now(),
      };

      set(state => ({
        transactions: state.transactions.map(t =>
          t.id === newTx.id ? confirmed : t
        ),
      }));

      return confirmed;
    } catch (err) {
      set(state => ({
        transactions: state.transactions.map(t =>
          t.id === newTx.id ? { ...t, status: 'failed' as TransactionStatus } : t
        ),
      }));
      throw err;
    }
  },

  getByAgent: (agentId) =>
    get().transactions.filter(
      t => t.fromAgentId === agentId || t.toAgentId === agentId
    ),

  clearHistory: () => set({ transactions: [] }),
}));
