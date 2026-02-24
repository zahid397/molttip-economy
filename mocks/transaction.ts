import { Transaction } from '@/types'

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    from: '0x123abc456def',
    to: 'agent-1',
    amount: 500,
    token: 'MOTIP',
    timestamp: Date.now() - 60 * 60 * 1000, // 1 hour ago
    status: 'completed',
  },
  {
    id: 'tx-002',
    from: 'agent-2',
    to: '0x456def789abc',
    amount: 200,
    token: 'USD',
    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    status: 'completed',
  },
]
