'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { WalletBalance } from './WalletBalance';
import { ConnectWalletModal } from '@/components/modals/ConnectWalletModal';
import { Button } from '@/components/common/Button';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export const WalletConnect = () => {
  const { isConnected, address, disconnectWallet } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDisconnect = () => {
    const ok = confirm('Are you sure you want to disconnect your wallet?');
    if (ok) disconnectWallet();
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <WalletBalance />

        <button
          onClick={handleDisconnect}
          className="p-2 rounded-lg text-gray-400 hover:text-neon-blue hover:bg-white/5 transition-all"
          title="Disconnect Wallet"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
        Connect Wallet
      </Button>

      <ConnectWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
