import { useState, useCallback } from 'react';
import { leaderboardService } from '@/services/leaderboard.service';
import { LeaderboardUser } from '@/types/leaderboard.types';
import toast from 'react-hot-toast';

export const useLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await leaderboardService.getTopEarners();
      setLeaders(data);
      return data;
    } catch (err) {
      console.error('Leaderboard error:', err);

      const message =
        err instanceof Error ? err.message : 'Failed to fetch leaderboard';

      setError(message);
      toast.error(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { leaders, loading, error, fetchLeaderboard };
};
