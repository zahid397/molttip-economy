'use client';

import { useWallet } from '@/hooks/useWallet';
import { formatAddress, formatBalance } from '@/utils/formatters';
import { WalletIcon } from '@heroicons/react/24/outline';

export const WalletBalance = () => {
  const { address, balance, isConnected } = useWallet();

  if (!isConnected || !address) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full 
                    bg-glass-dark border border-glass-light 
                    backdrop-blur-md hover:border-neon-blue/40 
                    transition-all duration-200">

      <WalletIcon className="w-4 h-4 text-neon-blue" />

      <div className="flex items-center gap-2 text-sm">
        <span className="font-mono text-gray-300">
          {formatAddress(address)}
        </span>

        <span className="text-gray-500">|</span>

        <span className="text-neon-blue font-semibold">
          {balance ? formatBalance(balance) : '0.00'} ETH
        </span>
      </div>
    </div>
  );
};
