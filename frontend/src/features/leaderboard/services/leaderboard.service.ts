
/**

Leaderboard Service
*/


import { api } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type { LeaderboardEntry, LeaderboardFilters } from '@/shared/types';

export const leaderboardService = {
// Get top tippers
getTopTippers: async (filters?: LeaderboardFilters): Promise<LeaderboardEntry[]> => {
const params = new URLSearchParams();
if (filters?.period) params.append('period', filters.period);
if (filters?.limit) params.append('limit', filters.limit.toString());

const queryString = params.toString();  
const url = `${API_ENDPOINTS.LEADERBOARD_TIPPERS}${queryString ? `?${queryString}` : ''}`;  
  
return api.get<LeaderboardEntry[]>(url);

},

// Get top receivers
getTopReceivers: async (filters?: LeaderboardFilters): Promise<LeaderboardEntry[]> => {
const params = new URLSearchParams();
if (filters?.period) params.append('period', filters.period);
if (filters?.limit) params.append('limit', filters.limit.toString());

const queryString = params.toString();  
const url = `${API_ENDPOINTS.LEADERBOARD_RECEIVERS}${queryString ? `?${queryString}` : ''}`;  
  
return api.get<LeaderboardEntry[]>(url);

},

// Get top posters
getTopPosters: async (filters?: LeaderboardFilters): Promise<LeaderboardEntry[]> => {
const params = new URLSearchParams();
if (filters?.period) params.append('period', filters.period);
if (filters?.limit) params.append('limit', filters.limit.toString());

const queryString = params.toString();  
const url = `${API_ENDPOINTS.LEADERBOARD_POSTERS}${queryString ? `?${queryString}` : ''}`;  
  
return api.get<LeaderboardEntry[]>(url);

},
};
