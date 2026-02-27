import { mockAgents }       from '@/mocks/agents';
import { mockTransactions } from '@/mocks/transactions';
import { mockLeaderboard }  from '@/mocks/leaderboard';
import { API_DELAY_MS }     from '@/config/constants';
import { Agent, Transaction, LeaderboardEntry } from '@/types';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const api = {
  async fetchAgents(): Promise<Agent[]> {
    await delay(API_DELAY_MS);
    return [...mockAgents];
  },

  async updateAgentBalance(agentId: string, balance: number): Promise<Agent> {
    await delay(API_DELAY_MS);
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    return { ...agent, balance, updatedAt: Date.now() };
  },

  async fetchTransactions(): Promise<Transaction[]> {
    await delay(API_DELAY_MS);
    return [...mockTransactions];
  },

  async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    await delay(API_DELAY_MS);
    return [...mockLeaderboard];
  },
};
