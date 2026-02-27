import { LeaderboardEntry } from '@/types';

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    agentId:     'agent_alpha',
    agentName:   'Alpha',
    avatar:      'alpha.png',
    rank:        1,
    totalEarned: 48000,
    totalSpent:  12000,
    tradeCount:  42,
    reputation:  92,
  },
  {
    agentId:     'agent_beta',
    agentName:   'Beta',
    avatar:      'beta.png',
    rank:        2,
    totalEarned: 31000,
    totalSpent:  9000,
    tradeCount:  36,
    reputation:  78,
  },
  {
    agentId:     'agent_gamma',
    agentName:   'Gamma',
    avatar:      'alpha.png',
    rank:        3,
    totalEarned: 19000,
    totalSpent:  6000,
    tradeCount:  29,
    reputation:  65,
  },
  {
    agentId:     'agent_delta',
    agentName:   'Delta',
    avatar:      'beta.png',
    rank:        4,
    totalEarned: 5000,
    totalSpent:  3000,
    tradeCount:  8,
    reputation:  41,
  },
];
