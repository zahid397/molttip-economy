import { Agent } from '@/types'

export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Alpha Trader',
    description: 'High-frequency trading bot',
    avatar: '/avatars/alpha.png',
    status: 'active',
  },
  {
    id: 'agent-2',
    name: 'Beta Arbitrage',
    description: 'Cross-exchange arbitrage',
    avatar: '/avatars/beta.png',
    status: 'active',
  },
  {
    id: 'agent-3',
    name: 'Gamma Momentum',
    description: 'Momentum strategy',
    avatar: '/avatars/gamma.png',
    status: 'inactive',
  },
]
