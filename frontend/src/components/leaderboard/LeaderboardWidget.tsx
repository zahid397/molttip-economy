'use client';

import { useEffect } from 'react';
import { LeaderboardCard } from './LeaderboardCard';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';

export const LeaderboardWidget = () => {
  const { leaders, loading, error, fetchLeaderboard } = useLeaderboard();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (loading) {
    return (
      <div className="glass-panel p-8 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 text-center border border-red-500/20">
        <p className="text-red-400 font-medium">
          Failed to load leaderboard
        </p>
        <p className="text-gray-500 text-sm mt-1">{error}</p>
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchLeaderboard}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!leaders || leaders.length === 0) {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-gray-400">No leaderboard data available.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 space-y-3">
      {leaders.map((user, index) => (
        <LeaderboardCard
          key={user.address}
          user={user}
          rank={index + 1}
        />
      ))}
    </div>
  );
};
