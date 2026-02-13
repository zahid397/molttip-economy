import { User } from './user.types';

export interface LeaderboardUser extends User {
  totalEarned: number;
  rank?: number;
}
