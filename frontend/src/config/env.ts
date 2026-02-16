/**
 * Environment Configuration
 * Centralized & type-safe environment access
 */

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];

  if (!value && fallback === undefined) {
    console.warn(`⚠️ Missing environment variable: ${key}`);
  }

  return value ?? fallback ?? '';
};

export const env = {
  // ─── API ─────────────────────────────────────
  apiUrl: getEnv(
    'NEXT_PUBLIC_API_URL',
    'https://molttip-economy.onrender.com'
  ),

  // ─── AI Services ─────────────────────────────
  groqApiKey: getEnv('NEXT_PUBLIC_GROQ_API_KEY', ''),
  geminiApiKey: getEnv('NEXT_PUBLIC_GEMINI_API_KEY', ''),

  // ─── Feature Flags ───────────────────────────
  enableSimulation:
    getEnv('NEXT_PUBLIC_ENABLE_SIMULATION', 'true') === 'true',

  enableAI:
    getEnv('NEXT_PUBLIC_ENABLE_AI', 'false') === 'true',

  // ─── Environment Mode ────────────────────────
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

/**
 * Development Debug Log
 * Only runs in browser + dev mode
 */
if (typeof window !== 'undefined' && env.isDevelopment) {
  console.log('🌍 Environment Loaded');
  console.log('API:', env.apiUrl);
  console.log('Simulation:', env.enableSimulation);
  console.log('AI Enabled:', env.enableAI);
}

export default env;
