import { Avatar } from '@/components/common/Avatar';
import { formatAddress, formatBalance } from '@/utils/formatters';
import { LeaderboardUser } from '@/types/leaderboard.types';
import { TrophyIcon } from '@heroicons/react/24/outline';

interface LeaderboardCardProps {
  user: LeaderboardUser;
  rank: number;
}

export const LeaderboardCard = ({ user, rank }: LeaderboardCardProps) => {
  const rankColors = [
    'text-yellow-400',   // 🥇 Gold
    'text-gray-300',     // 🥈 Silver
    'text-amber-600',    // 🥉 Bronze
  ];

  const rankColor =
    rank <= 3 ? rankColors[rank - 1] : 'text-gray-500';

  return (
    <div className="glass-panel p-4 flex items-center gap-4 hover-lift transition-all border border-glass-light/40 hover:border-neon-blue/40">
      
      {/* Rank */}
      <div className="flex items-center justify-center w-10 h-10">
        {rank <= 3 ? (
          <TrophyIcon className={`w-6 h-6 ${rankColor}`} />
        ) : (
          <span className="text-sm font-bold text-gray-400">
            #{rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <Avatar address={user.address} size="md" />

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">
          {user.displayName || formatAddress(user.address)}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {formatAddress(user.address)}
        </p>
      </div>

      {/* Earnings */}
      <div className="text-right">
        <p className="text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          {formatBalance(user.totalEarned)} MOLT
        </p>
        <p className="text-xs text-gray-500">
          earned
        </p>
      </div>
    </div>
  );
};
