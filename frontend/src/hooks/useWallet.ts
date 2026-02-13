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
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const { login } = useAuth();

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window !== 'undefined' && window.ethereum) {
      setHasMetaMask(true);
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);
    } else {
      setHasMetaMask(false);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!hasMetaMask) {
      toast.error('MetaMask not installed. Please install it.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    setLoading(true);
    try {
      const accounts = await provider!.send('eth_requestAccounts', []);
      const userAddress = accounts[0];
      setAddress(userAddress);
      setIsConnected(true);
      
      const balanceWei = await provider!.getBalance(userAddress);
      setBalance(ethers.formatEther(balanceWei));
      
      await login(userAddress);
      toast.success('Wallet connected');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }, [hasMetaMask, provider, login]);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setBalance('0');
    setIsConnected(false);
    localStorage.removeItem('jwt');
    toast.success('Wallet disconnected');
  }, []);

  useEffect(() => {
    if (hasMetaMask && provider) {
      const checkConnection = async () => {
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const userAddress = accounts[0].address;
          setAddress(userAddress);
          setIsConnected(true);
          const balanceWei = await provider.getBalance(userAddress);
          setBalance(ethers.formatEther(balanceWei));
        }
      };
      checkConnection();

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(accounts[0]);
        }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [hasMetaMask, provider, disconnectWallet]);

  return { address, balance, isConnected, loading, hasMetaMask, connectWallet, disconnectWallet };
};
