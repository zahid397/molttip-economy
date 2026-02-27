import { Agent, Transaction, LeaderboardEntry } from '@/types';
import { mockAgents } from '@/mocks/agents';
import { mockTransactions } from '@/mocks/transactions';
import { mockLeaderboard } from '@/mocks/leaderboard';
import { API_DELAY_MS } from '@/config/constants';

// Simulate network delay
const delay = <T>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), API_DELAY_MS));

// Optional: simulate random API failure (realistic feeling)
const maybeFail = () => {
  if (Math.random() < 0.03) {
    throw new Error('Network error. Please try again.');
  }
};

export const api = {
  // ----------------------
  // Agents
  // ----------------------

  async fetchAgents(): Promise<Agent[]> {
    maybeFail();
    return delay(structuredClone(mockAgents));
  },

  async updateAgentBalance(
    agentId: string,
    newBalance: number
  ): Promise<Agent> {
    maybeFail();

    const agent = mockAgents.find((a) => a.id === agentId);
    if (!agent) throw new Error('Agent not found');

    const updatedAgent: Agent = {
      ...agent,
      balance: newBalance,
    };

    return delay(updatedAgent);
  },

  // ----------------------
  // Transactions
  // ----------------------

  async fetchTransactions(): Promise<Transaction[]> {
    maybeFail();
    return delay(structuredClone(mockTransactions));
  },

  async createTransaction(
    tx: Omit<Transaction, 'id' | 'timestamp'>
  ): Promise<Transaction> {
    maybeFail();

    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    };

    return delay(newTx);
  },

  // ----------------------
  // Leaderboard
  // ----------------------

  async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    maybeFail();
    return delay(structuredClone(mockLeaderboard));
  },
};
