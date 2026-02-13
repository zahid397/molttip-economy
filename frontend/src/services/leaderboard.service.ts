import api from './api';
import { LeaderboardUser } from '@/types/leaderboard.types';
import { mockLeaderboard } from '@/mocks/leaderboard';

export const leaderboardService = {
  async getTopEarners(): Promise<{ data: LeaderboardUser[]; fromMock: boolean }> {
    try {
      const { data } = await api.get('/leaderboard/top-earners');
      return { data, fromMock: false };
    } catch (error) {
      console.warn('Leaderboard API failed, using mock', error);
      await new Promise((res) => setTimeout(res, 500));
      return { data: mockLeaderboard, fromMock: true };
    }
  },
};
