// ================================
// Wallet & Blockchain
// ================================

export const MOCK_WALLET_ADDRESS =
  '0x1111111111111111111111111111111111111111'

export const CHAIN_ID =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 1

export const SURGE_CONTRACT_ADDRESS =
  '0x0000000000000000000000000000000000000000'

// ================================
// Token Economics
// ================================

export const MIN_TIP_AMOUNT = 1
export const MAX_TIP_AMOUNT = 1000

export const DEFAULT_TIP_AMOUNTS = [10, 25, 50, 100] as const

// ================================
// Simulation
// ================================

export const SIMULATION_SPEEDS = [0.5, 1, 2, 5] as const

export const AUTO_POST_INTERVAL_MS = 5000
export const AUTO_TIP_INTERVAL_MS = 10000

export const AUTO_TIP_MIN = 5
export const AUTO_TIP_MAX = 50

// ================================
// UI
// ================================

export const ITEMS_PER_PAGE = 20
export const TOAST_DURATION = 3000
export const STAGGER_ANIMATION_DELAY_MS = 50

// ================================
// API
// ================================

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const API_BASE_URL =
  typeof API_URL === 'string'
    ? API_URL
    : 'https://molttip-economy.onrender.com/api'

export const API_TIMEOUT_MS = 10000

// ================================
// Feature Flags
// ================================

const simFlag = process.env.NEXT_PUBLIC_ENABLE_SIMULATION
const marketFlag = process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE

export const ENABLE_SIMULATION =
  simFlag?.toLowerCase() === 'true'

export const ENABLE_MARKETPLACE =
  marketFlag?.toLowerCase() === 'true'
