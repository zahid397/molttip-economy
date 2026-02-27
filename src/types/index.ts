export type ID         = string;
export type UnixMs     = number;
export type Percentage = number;

export type AgentStatus = 'active' | 'idle' | 'offline';

export interface Agent {
  id:           ID;
  name:         string;
  avatar:       string;
  balance:      number;
  stakedAmount: number;
  reputation:   Percentage;
  isActive:     boolean;
  status:       AgentStatus;
  createdAt:    UnixMs;
  updatedAt:    UnixMs;
}

export type TransactionType =
  | 'payment'
  | 'trade'
  | 'reward'
  | 'stake'
  | 'unstake';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  id:           ID;
  fromAgentId:  ID;
  toAgentId:    ID;
  amount:       number;
  type:         TransactionType;
  status:       TransactionStatus;
  timestamp:    UnixMs;
  confirmedAt?: UnixMs;
  note?:        string;
}

export interface LeaderboardEntry {
  agentId:      ID;
  agentName:    string;
  avatar:       string;
  rank:         number;
  previousRank?: number;
  totalEarned:  number;
  totalSpent:   number;
  tradeCount:   number;
  reputation:   Percentage;
}

export interface EconomyStats {
  totalSupply:       number;
  circulatingSupply: number;
  totalStaked:       number;
  totalTransactions: number;
  activeAgents:      number;
  totalAgents:       number;
  volumeLast24h:     number;
  avgReputation:     Percentage;
}

export interface TradeOffer {
  id:            ID;
  sellerId:      ID;
  buyerId?:      ID;
  tokenAmount:   number;
  pricePerToken: number;
  status:        'open' | 'accepted' | 'cancelled' | 'expired';
  createdAt:     UnixMs;
  expiresAt:     UnixMs;
}

export interface WalletSummary {
  agentId:          ID;
  balance:          number;
  stakedAmount:     number;
  availableBalance: number;
  totalEarned:      number;
  totalSpent:       number;
}

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id:       ID;
  message:  string;
  variant:  ToastVariant;
  duration?: number;
}

export type ModalType =
  | 'transfer'
  | 'stake'
  | 'unstake'
  | 'trade'
  | 'agentDetail'
  | null;

export interface ModalState {
  type:     ModalType;
  payload?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data:      T;
  success:   boolean;
  message?:  string;
  timestamp: UnixMs;
}

export interface SimulationConfig {
  tickIntervalMs:      number;
  maxTransferPercent:  Percentage;
  reputationDecayRate: number;
  enabled:             boolean;
}
