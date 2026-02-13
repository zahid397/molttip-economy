import api from './api';
import { LeaderboardUser } from '@/types/leaderboard.types';

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardUser[];
}

export const leaderboardService = {
  async getTopEarners(): Promise<LeaderboardUser[]> {
    const response = await api.get<LeaderboardResponse>('/leaderboard/top-earners');

    // backend যদি { success, data } দেয়
    if (response.data?.data) {
      return response.data.data;
    }

    // backend যদি সরাসরি array দেয়
    return response.data as unknown as LeaderboardUser[];
  },
};
