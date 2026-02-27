export interface Agent {
  id: string;
  name: string;
  avatar: string;         // filename in assets/avatars
  balance: number;         // MOTIP tokens
  reputation: number;      // 0-100
  isActive: boolean;
}

export interface Transaction {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  amount: number;
  timestamp: number;       // Unix ms
  type: 'payment' | 'trade';
}

export interface LeaderboardEntry {
  agentId: string;
  agentName: string;
  totalEarned: number;
  rank: number;
}
