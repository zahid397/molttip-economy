/**
 * Wallet Hook
 *
 * Provides wallet connection state and methods.
 * Currently uses a mock implementation for development.
 * Replace connector logic with actual Web3 provider (MetaMask, WalletConnect, etc.)
 * when moving to production.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { STORAGE_KEYS } from '@/shared/constants';
import { storage, isBrowser } from '@/shared/utils/helpers';

// ============================================================================
// Types
// ============================================================================

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  error: string | null;
  ensName: string | null;
  ensAvatar: string | null;
}

export interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

export type UseWalletReturn = WalletState & WalletActions;

// Supported networks
export enum SupportedChainId {
  ETHEREUM = 1,
  GOERLI = 5,
  POLYGON = 137,
  MUMBAI = 80001,
}

// ============================================================================
// Mock Configuration
// ============================================================================

const MOCK_CONFIG = {
  balance: '1000.00',
  connectDelay: 1000,
  defaultChainId: SupportedChainId.ETHEREUM,
  ensName: 'mockuser.eth',
  ensAvatar: '',
};

// ============================================================================
// Helpers
// ============================================================================

const generateMockAddress = (): string => {
  // Generate a valid 40-hex address (not perfect but close enough for mock)
  const randomHex = Math.random().toString(16).substring(2).padEnd(40, '0').slice(0, 40);
  return `0x${randomHex}`;
};

// ============================================================================
// Hook Implementation
// ============================================================================

export const useWallet = (): UseWalletReturn => {
  const isMounted = useRef(true);

  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    balance: null,
    error: null,
    ensName: null,
    ensAvatar: null,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load persisted address on mount
  useEffect(() => {
    if (!isBrowser) return;

    const savedAddress = storage.get<string>(STORAGE_KEYS.WALLET_ADDRESS);

    if (savedAddress) {
      setState((prev) => ({
        ...prev,
        address: savedAddress,
        chainId: MOCK_CONFIG.defaultChainId,
        isConnected: true,
        balance: MOCK_CONFIG.balance,
        ensName: MOCK_CONFIG.ensName,
        ensAvatar: MOCK_CONFIG.ensAvatar,
      }));
    }
  }, []);

  // --------------------------------------------------------------------------
  // Wallet Actions
  // --------------------------------------------------------------------------

  const setupEventListeners = useCallback(() => {
    // Placeholder for real provider events
    // Example:
    // window.ethereum?.on('accountsChanged', ...);
    // window.ethereum?.on('chainChanged', ...);
    // window.ethereum?.on('disconnect', disconnect);
  }, []);

  const connect = useCallback(async (): Promise<void> => {
    if (!isBrowser) return;

    setState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      await new Promise((resolve) => setTimeout(resolve, MOCK_CONFIG.connectDelay));

      const mockAddress = generateMockAddress();

      if (!isMounted.current) return;

      setState({
        address: mockAddress,
        chainId: MOCK_CONFIG.defaultChainId,
        isConnected: true,
        isConnecting: false,
        balance: MOCK_CONFIG.balance,
        error: null,
        ensName: MOCK_CONFIG.ensName,
        ensAvatar: MOCK_CONFIG.ensAvatar,
      });

      storage.set(STORAGE_KEYS.WALLET_ADDRESS, mockAddress);

      setupEventListeners();
    } catch (err) {
      if (!isMounted.current) return;

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err instanceof Error ? err.message : 'Failed to connect wallet',
      }));
    }
  }, [setupEventListeners]);

  const disconnect = useCallback((): void => {
    if (!isBrowser) return;

    setState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      balance: null,
      error: null,
      ensName: null,
      ensAvatar: null,
    });

    storage.remove(STORAGE_KEYS.WALLET_ADDRESS);
    storage.remove(STORAGE_KEYS.USER_DATA);
    storage.remove(STORAGE_KEYS.USER_TOKEN);
  }, []);

  const switchNetwork = useCallback(async (chainId: number): Promise<void> => {
    if (!isBrowser) return;

    setState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!isMounted.current) return;

      setState((prev) => ({
        ...prev,
        chainId,
        isConnecting: false,
        balance: MOCK_CONFIG.balance,
      }));
    } catch (err) {
      if (!isMounted.current) return;

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err instanceof Error ? err.message : 'Failed to switch network',
      }));
    }
  }, []);

  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!state.isConnected || !state.address) return;

    setState((prev) => ({
      ...prev,
      isConnecting: true,
    }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!isMounted.current) return;

      const newBalance = (
        parseFloat(state.balance || MOCK_CONFIG.balance) +
        (Math.random() * 10 - 5)
      ).toFixed(2);

      setState((prev) => ({
        ...prev,
        balance: newBalance,
        isConnecting: false,
      }));
    } catch (err) {
      if (!isMounted.current) return;

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err instanceof Error ? err.message : 'Failed to refresh balance',
      }));
    }
  }, [state.isConnected, state.address, state.balance]);

  // --------------------------------------------------------------------------
  // Memoized Return
  // --------------------------------------------------------------------------

  const value = useMemo(
    () => ({
      ...state,
      connect,
      disconnect,
      switchNetwork,
      refreshBalance,
    }),
    [state, connect, disconnect, switchNetwork, refreshBalance]
  );

  return value;
};

// ============================================================================
// Utility Functions
// ============================================================================

export const isChainSupported = (chainId: number): boolean => {
  return Object.values(SupportedChainId).includes(chainId);
};

export const getNetworkName = (chainId: number): string => {
  const names: Record<number, string> = {
    [SupportedChainId.ETHEREUM]: 'Ethereum Mainnet',
    [SupportedChainId.GOERLI]: 'Goerli Testnet',
    [SupportedChainId.POLYGON]: 'Polygon Mainnet',
    [SupportedChainId.MUMBAI]: 'Mumbai Testnet',
  };

  return names[chainId] || `Unknown Chain (${chainId})`;
};
