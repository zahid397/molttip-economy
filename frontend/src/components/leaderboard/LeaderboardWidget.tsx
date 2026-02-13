'use client';

import { useEffect } from 'react';
import { LeaderboardCard } from './LeaderboardCard';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Spinner } from '@/components/common/Spinner';

export const LeaderboardWidget = () => {
  const { leaders, loading, error, fetchLeaderboard } = useLeaderboard();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 text-center">
        <p className="text-red-400">Failed to load leaderboard: {error}</p>
        <button
          onClick={() => fetchLeaderboard()}
          className="mt-3 px-4 py-2 bg-neon-blue/20 rounded-lg hover:bg-neon-blue/30"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leaders.map((user, index) => (
        <LeaderboardCard key={user.address} user={user} rank={index + 1} />
      ))}
    </div>
  );
};
