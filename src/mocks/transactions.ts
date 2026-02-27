import { Transaction, TransactionType } from '@/types';
import { randomBetween } from '@/lib/utils';

const AGENT_IDS: string[]         = ['agent_alpha', 'agent_beta', 'agent_gamma', 'agent_delta'];
const TX_TYPES:  TransactionType[] = ['payment', 'trade', 'reward'];

function makeTx(i: number): Transaction {
  const fromIdx = i % AGENT_IDS.length;
  const toIdx   = (i + 1) % AGENT_IDS.length;
  const type    = TX_TYPES[i % TX_TYPES.length] as TransactionType;
  const from    = AGENT_IDS[fromIdx] as string;
  const to      = AGENT_IDS[toIdx]   as string;

  return {
    id:          `tx_mock_${i}`,
    fromAgentId: from,
    toAgentId:   to,
    amount:      randomBetween(100, 3000),
    type,
    status:      'confirmed',
    timestamp:   Date.now() - i * 60_000,
    confirmedAt: Date.now() - i * 60_000 + 300,
  };
}

export const mockTransactions: Transaction[] =
  Array.from({ length: 12 }, (_, i) => makeTx(i));
