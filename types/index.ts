export type TokenType = 'MOTIP' | 'USD'

export interface Agent {
  id: string
  name: string
  description: string
  avatar?: string
  status: 'active' | 'inactive'
}

export interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  token: TokenType
  timestamp: number
  status: 'pending' | 'completed' | 'failed'
}

export interface LeaderboardEntry {
  agentId: string
  agentName: string
  profit: number
  rank: number
}

export interface WalletState {
  address: string | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

export interface EconomyState {
  balances: Record<string, { MOTIP: number; USD: number }>
  getBalance: (address: string) => { MOTIP: number; USD: number }
  setBalance: (
    address: string,
    balance: { MOTIP: number; USD: number }
  ) => void
  transfer: (
    from: string,
    to: string,
    amount: number,
    token: TokenType
  ) => boolean
}

export interface TransactionState {
  transactions: Transaction[]
  addTransaction: (tx: Transaction) => void
}

export interface SimulationState {
  isRunning: boolean
  speed: number
  intervalId: ReturnType<typeof setInterval> | null
  toggle: () => void
  setSpeed: (speed: number) => void
}
