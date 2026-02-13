import { LeaderboardWidget } from '@/components/leaderboard/LeaderboardWidget';

export default function LeaderboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Top Earners
        </h1>
        <p className="text-gray-400 mt-2">
          Discover the highest earning creators in the MoltTip ecosystem.
        </p>
      </div>

      <div className="glass-panel p-6">
        <LeaderboardWidget />
      </div>
    </div>
  );
}
