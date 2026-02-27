import { create } from 'zustand';

export interface Transaction {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  amount: number;
  type: 'payment' | 'reward' | 'stake' | 'unstake';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
}

const CONFIRMATION_DELAY = 300;
const MAX_HISTORY = 500;

interface TransactionStore {
  transactions: Transaction[];
  recordTransaction: (
    tx: Omit<Transaction, 'id' | 'status' | 'timestamp'>
  ) => Promise<Transaction>;
  getByAgent: (agentId: string) => Transaction[];
  clearHistory: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],

  recordTransaction: async (tx) => {
    const newTx: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      status: 'pending',
      timestamp: Date.now(),
    };

    // Optimistic insert (bounded history)
    set(state => ({
      transactions: [newTx, ...state.transactions].slice(0, MAX_HISTORY),
    }));

    try {
      await new Promise(res => setTimeout(res, CONFIRMATION_DELAY));

      set(state => ({
        transactions: state.transactions.map(t =>
          t.id === newTx.id
            ? { ...t, status: 'confirmed' }
            : t
        ),
      }));

      return { ...newTx, status: 'confirmed' };
    } catch (err) {
      set(state => ({
        transactions: state.transactions.map(t =>
          t.id === newTx.id
            ? { ...t, status: 'failed' }
            : t
        ),
      }));
      throw err;
    }
  },

  getByAgent: (agentId) =>
    get().transactions.filter(
      t =>
        t.fromAgentId === agentId ||
        t.toAgentId === agentId
    ),

  clearHistory: () => set({ transactions: [] }),
}));
