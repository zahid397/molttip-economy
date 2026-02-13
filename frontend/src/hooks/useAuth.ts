'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { authService } from '@/services/auth.service';
import { storage } from '@/utils/storage';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface AuthUser {
  address: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (address: string) => {
    setLoading(true);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      // 1️⃣ Get nonce message from backend
      const nonceResponse = await authService.getNonce(address);

      if (!nonceResponse?.message) {
        throw new Error('Invalid nonce response from server');
      }

      const message: string = nonceResponse.message;

      // 2️⃣ Create provider & signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 3️⃣ Sign message
      const signature = await signer.signMessage(message);

      // 4️⃣ Verify signature with backend
      const verifyResponse = await authService.verifySignature(
        address,
        signature
      );

      if (!verifyResponse?.token) {
        throw new Error('Invalid verification response');
      }

      // 5️⃣ Store JWT securely
      storage.setToken(verifyResponse.token);

      setUser({ address });

      toast.success('Authentication successful 🚀');

      return verifyResponse;
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error?.message || 'Authentication failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    storage.clearToken();
    setUser(null);
    toast.success('Logged out');
  }, []);

  return {
    user,
    loading,
    login,
    logout,
  };
};
