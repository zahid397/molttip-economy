import { create } from 'zustand';
import { api } from '@/services/api';
import { Agent } from '@/types';

interface WalletState {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  updateAgentBalance: (agentId: string, newBalance: number) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  agents: [],
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const agents = await api.fetchAgents();
      set({ agents, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  updateAgentBalance: async (agentId, newBalance) => {
    try {
      const updated = await api.updateAgentBalance(agentId, newBalance);
      set(state => ({
        agents: state.agents.map(a => a.id === agentId ? updated : a)
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
