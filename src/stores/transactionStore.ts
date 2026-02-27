import { create } from 'zustand';
import { api } from '@/services/api';
import { Transaction } from '@/types';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  sendPayment: (fromAgentId: string, toAgentId: string, amount: number) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await api.fetchTransactions();
      set({ transactions, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  sendPayment: async (fromAgentId, toAgentId, amount) => {
    try {
      // Optimistic update? For mock, we just create tx and update balances.
      const newTx = await api.createTransaction({
        fromAgentId,
        toAgentId,
        amount,
        type: 'payment',
      });

      // Update local transactions list
      set(state => ({
        transactions: [newTx, ...state.transactions]
      }));

      // Also update agent balances in wallet store (optional, but good)
      const { agents } = useWalletStore.getState();
      const fromAgent = agents.find(a => a.id === fromAgentId);
      const toAgent = agents.find(a => a.id === toAgentId);
      if (fromAgent && toAgent) {
        await useWalletStore.getState().updateAgentBalance(fromAgentId, fromAgent.balance - amount);
        await useWalletStore.getState().updateAgentBalance(toAgentId, toAgent.balance + amount);
      }
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
