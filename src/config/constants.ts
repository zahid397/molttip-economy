// ===============================
// App
// ===============================
export const APP_CONFIG = {
  NAME: 'MolTip Economy',
  TOKEN_NAME: 'MOTIP',
};

// ===============================
// Wallet / Economy
// ===============================
export const ECONOMY_CONFIG = {
  INITIAL_BALANCE: 1000,
  MIN_TIP: 1,
  MAX_TIP: 1000,
};

// ===============================
// Simulation
// ===============================
export const SIMULATION_CONFIG = {
  INTERVAL_MS: 5000, // 5 seconds
  PRICE_VOLATILITY: 0.02,
};

// ===============================
// API
// ===============================
export const API_CONFIG = {
  DELAY_MS: 300, // simulate network latency
  FAILURE_RATE: 0.03, // 3% fake failure
};
