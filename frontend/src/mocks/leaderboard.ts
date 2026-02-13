import { LeaderboardUser } from '@/types/leaderboard.types';
import { mockUsers } from './users';

export const mockLeaderboard: LeaderboardUser[] = [
  {
    ...mockUsers[2],
    totalEarned: 15200,
  },
  {
    ...mockUsers[3],
    totalEarned: 13450,
  },
  {
    ...mockUsers[0],
    totalEarned: 9870,
  },
  {
    ...mockUsers[1],
    totalEarned: 7650,
  },
];
