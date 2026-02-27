import { Transaction } from '@/types';
import { randomBetween } from '@/lib/utils';

const TX_TYPES: Transaction['type'][] = ['payment', 'trade'];

function generateTxHash() {
  return `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

function createTransaction(
  fromAgentId: string,
  toAgentId: string,
  amount: number,
  overrides?: Partial<Transaction>
): Transaction {
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    txHash: generateTxHash(),
    fromAgentId,
    toAgentId,
    amount,
    timestamp: Date.now() - randomBetween(1, 24) * 60 * 60 * 1000,
    type: TX_TYPES[Math.floor(Math.random() * TX_TYPES.length)],
    status: 'confirmed',
    ...overrides,
  };
}

export const mockTransactions: Transaction[] = [
  createTransaction('agent_alpha', 'agent_beta', 50, { type: 'payment' }),
  createTransaction('agent_beta', 'agent_gamma', 30, { type: 'trade' }),
  createTransaction('agent_gamma', 'agent_delta', 20, { type: 'payment' }),
];
