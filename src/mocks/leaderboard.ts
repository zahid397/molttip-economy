import { LeaderboardEntry } from '@/types';
import { mockAgents } from './agents';

export function generateLeaderboard(): LeaderboardEntry[] {
  return [...mockAgents]
    .sort((a, b) => b.balance - a.balance)
    .map((agent, index) => ({
      agentId: agent.id,
      agentName: agent.name,
      totalEarned: agent.balance,
      rank: index + 1,
    }));
}
