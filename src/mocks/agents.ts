import { Agent } from '@/types';
import { INITIAL_BALANCE } from '@/config/constants';

export const mockAgents: Agent[] = [
  {
    id: 'agent_alpha',
    name: 'Alpha',
    avatar: 'alpha.png',
    balance: INITIAL_BALANCE,
    reputation: 98,
    isActive: true,
  },
  {
    id: 'agent_beta',
    name: 'Beta',
    avatar: 'beta.png',
    balance: INITIAL_BALANCE,
    reputation: 75,
    isActive: true,
  },
  {
    id: 'agent_gamma',
    name: 'Gamma',
    avatar: 'alpha.png', // fallback, you can add more avatars
    balance: 850,
    reputation: 82,
    isActive: true,
  },
  {
    id: 'agent_delta',
    name: 'Delta',
    avatar: 'beta.png',
    balance: 1200,
    reputation: 91,
    isActive: false,
  },
];
