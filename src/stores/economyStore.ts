import { create } from 'zustand';
import { mockAgents } from '@/mocks/agents';
import { Agent } from '@/types';

interface EconomyState {
  agents: Agent[];

  getTotalSupply: () => number;
  getActiveAgents: () => number;
  getAverageReputation: () => number;

  updateAgentBalance: (id: string, newBalance: number) => void;
}

export const useEconomyStore = create<EconomyState>((set, get) => ({
  agents: mockAgents,

  getTotalSupply: () =>
    get().agents.reduce((sum, a) => sum + a.balance, 0),

  getActiveAgents: () =>
    get().agents.filter((a) => a.isActive).length,

  getAverageReputation: () => {
    const agents = get().agents;
    if (!agents.length) return 0;

    return Math.round(
      agents.reduce((sum, a) => sum + a.reputation, 0) /
        agents.length
    );
  },

  updateAgentBalance: (id, newBalance) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, balance: newBalance } : a
      ),
    })),
}));
