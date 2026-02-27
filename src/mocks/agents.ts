import { Agent } from '@/types';
import { ECONOMY_CONFIG } from '@/config/constants';

const AVATARS = ['alpha.png', 'beta.png'];

function createAgent(
  id: string,
  name: string,
  overrides?: Partial<Agent>
): Agent {
  return {
    id,
    name,
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    balance: ECONOMY_CONFIG.INITIAL_BALANCE,
    reputation: Math.floor(Math.random() * 30) + 70, // 70–100
    isActive: true,
    createdAt: Date.now(),
    ...overrides,
  };
}

export const mockAgents: Agent[] = [
  createAgent('agent_alpha', 'Alpha'),
  createAgent('agent_beta', 'Beta'),
  createAgent('agent_gamma', 'Gamma', {
    balance: 850,
  }),
  createAgent('agent_delta', 'Delta', {
    balance: 1200,
    isActive: false,
  }),
];
