import { useState, useCallback } from 'react';
import { leaderboardService } from '@/services/leaderboard.service';
import { LeaderboardUser } from '@/types/leaderboard.types';

export const useLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, fromMock } = await leaderboardService.getTopEarners();
      setLeaders(data);
      setUsingMock(fromMock);
    } catch (err) {
      // This should never happen because service always returns
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  return { leaders, loading, error, usingMock, fetchLeaderboard };
};
