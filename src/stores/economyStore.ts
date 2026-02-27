import { create } from 'zustand';
import { mockAgents } from '@/mocks/agents';

interface EconomyState {
  totalSupply: number;
  activeAgents: number;
  averageReputation: number;
  updateStats: () => void;
}

export const useEconomyStore = create<EconomyState>((set) => ({
  totalSupply: mockAgents.reduce((sum, a) => sum + a.balance, 0),
  activeAgents: mockAgents.filter(a => a.isActive).length,
  averageReputation: Math.round(
    mockAgents.reduce((sum, a) => sum + a.reputation, 0) / mockAgents.length
  ),

  updateStats: () => {
    // This would normally fetch from API, but we'll recompute from current agents
    const agents = useWalletStore.getState().agents;
    if (agents.length === 0) return;
    set({
      totalSupply: agents.reduce((sum, a) => sum + a.balance, 0),
      activeAgents: agents.filter(a => a.isActive).length,
      averageReputation: Math.round(
        agents.reduce((sum, a) => sum + a.reputation, 0) / agents.length
      ),
    });
  },
}));
