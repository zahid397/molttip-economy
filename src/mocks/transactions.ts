import { Transaction } from '@/types';

export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    fromAgentId: 'agent_alpha',
    toAgentId: 'agent_beta',
    amount: 50,
    timestamp: Date.now() - 3600000,
    type: 'payment',
  },
  {
    id: 'tx2',
    fromAgentId: 'agent_beta',
    toAgentId: 'agent_gamma',
    amount: 30,
    timestamp: Date.now() - 7200000,
    type: 'trade',
  },
  {
    id: 'tx3',
    fromAgentId: 'agent_gamma',
    toAgentId: 'agent_delta',
    amount: 20,
    timestamp: Date.now() - 86400000,
    type: 'payment',
  },
];
