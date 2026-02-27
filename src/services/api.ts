import { Agent, Transaction, LeaderboardEntry } from '@/types';
import { mockAgents } from '@/mocks/agents';
import { mockTransactions } from '@/mocks/transactions';
import { mockLeaderboard } from '@/mocks/leaderboard';
import { API_DELAY_MS } from '@/config/constants';

// Simulate network delay
const delay = <T>(data: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), API_DELAY_MS));

export const api = {
  // Agents
  fetchAgents: (): Promise<Agent[]> => delay([...mockAgents]),

  updateAgentBalance: (agentId: string, newBalance: number): Promise<Agent> => {
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) throw new Error('Agent not found');
    agent.balance = newBalance;
    return delay({ ...agent });
  },

  // Transactions
  fetchTransactions: (): Promise<Transaction[]> => delay([...mockTransactions]),

  createTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    mockTransactions.unshift(newTx); // add to beginning
    return delay(newTx);
  },

  // Leaderboard
  fetchLeaderboard: (): Promise<LeaderboardEntry[]> => delay([...mockLeaderboard]),
};
