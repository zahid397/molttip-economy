import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, logout } = useAuth();

  const getProvider = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!window.ethereum) return null;

    return new ethers.BrowserProvider(window.ethereum);
  }, []);

  const refreshBalance = useCallback(
    async (walletAddress: string) => {
      try {
        const provider = getProvider();
        if (!provider) return;

        const balanceWei = await provider.getBalance(walletAddress);
        setBalance(ethers.formatEther(balanceWei));
      } catch (err) {
        console.error('Failed to refresh balance:', err);
      }
    },
    [getProvider]
  );

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not installed!');
      return;
    }

    setLoading(true);

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Provider not found');

      const accounts = await provider.send('eth_requestAccounts', []);
      const userAddress = accounts?.[0];

      if (!userAddress) {
        toast.error('No wallet account found');
        return;
      }

      setAddress(userAddress);
      setIsConnected(true);

      await refreshBalance(userAddress);

      // 🔥 login flow (nonce + signature + JWT)
      await login(userAddress);

      toast.success('Wallet connected successfully ⚡');
    } catch (error) {
      console.error('Wallet connect error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }, [getProvider, login, refreshBalance]);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setBalance('0');
    setIsConnected(false);

    logout();

    toast.success('Wallet disconnected');
  }, [logout]);

  // Auto check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!window.ethereum) return;

        const provider = getProvider();
        if (!provider) return;

        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          const userAddress = accounts[0].address;

          setAddress(userAddress);
          setIsConnected(true);

          await refreshBalance(userAddress);

          // 🔥 Auto login if JWT missing
          await login(userAddress);
        }
      } catch (error) {
        console.error('Auto connection failed:', error);
      }
    };

    checkConnection();
  }, [getProvider, refreshBalance, login]);

  // MetaMask listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
        return;
      }

      const newAddress = accounts[0];
      setAddress(newAddress);
      setIsConnected(true);

      await refreshBalance(newAddress);
      await login(newAddress);

      toast.success('Account switched 🔄');
    };

    const handleChainChanged = () => {
      toast('Network changed 🌐 Refreshing...', { icon: '⚡' });
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (!window.ethereum?.removeListener) return;

      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnectWallet, refreshBalance, login]);

  return {
    address,
    balance,
    isConnected,
    loading,
    connectWallet,
    disconnectWallet,
  };
};
