import { create } from 'zustand';
import { api } from '@/services/api';
import { Agent } from '@/types';

interface WalletState {
  agents: Agent[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  updateAgentBalance: (agentId: string, newBalance: number) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  agents: [],
  isLoading: false,
  isUpdating: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const agents = await api.fetchAgents();
      set({ agents, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err; // ✅ re-throw so callers can react
    }
  },

  updateAgentBalance: async (agentId, newBalance) => {
    // ✅ Snapshot for rollback
    const snapshot = get().agents;

    // ✅ Optimistic update
    set(state => ({
      isUpdating: true,
      error: null, // ✅ clear stale error before attempt
      agents: state.agents.map(a =>
        a.id === agentId ? { ...a, balance: newBalance } : a
      ),
    }));

    try {
      const updated = await api.updateAgentBalance(agentId, newBalance);

      // ✅ Sync with server's confirmed value
      set(state => ({
        isUpdating: false,
        agents: state.agents.map(a => a.id === agentId ? updated : a),
      }));
    } catch (err) {
      // ✅ Rollback + surface error + re-throw
      set({ agents: snapshot, isUpdating: false, error: (err as Error).message });
      throw err;
    }
  },
}));
