import { useState, useCallback, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { ethers } from 'ethers';
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

  // 🔥 Auto restore session from JWT
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const storedAddress = localStorage.getItem('walletAddress');

    if (token && storedAddress) {
      setUser({ address: storedAddress });
    }
  }, []);

  const login = useCallback(async (address: string) => {
    setLoading(true);

    try {
      if (!window.ethereum) throw new Error('MetaMask not found');

      // 1️⃣ Get nonce
      const nonceResponse = await authService.getNonce(address);

      const message =
        nonceResponse.message ||
        nonceResponse.nonce ||
        `Sign this message to authenticate. Nonce: ${nonceResponse}`;

      // 2️⃣ Sign message
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // 3️⃣ Verify
      const verifyResponse = await authService.verifySignature(
        address,
        signature
      );

      const token = verifyResponse.token;

      if (!token) throw new Error('Token not received');

      // 4️⃣ Store JWT
      localStorage.setItem('jwt', token);
      localStorage.setItem('walletAddress', address);

      setUser({ address });

      toast.success('Authentication successful 🔐');

      return verifyResponse;
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('walletAddress');
    setUser(null);
  }, []);

  return { user, loading, login, logout };
};
