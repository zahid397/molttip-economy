'use client';

import { Dialog } from '@headlessui/react';
import { Button } from '@/components/common/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useWallet } from '@/hooks/useWallet';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectWalletModal = ({ isOpen, onClose }: ConnectWalletModalProps) => {
  const { connectWallet, loading, hasMetaMask } = useWallet();

  const handleConnect = async () => {
    await connectWallet();
    onClose();
  };

  const handleInstall = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="glass-panel max-w-md w-full p-6 border border-neon-blue/30">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Connect Wallet
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-gray-300">
              Connect your wallet to start tipping and earning rewards.
            </p>
            {!hasMetaMask ? (
              <div className="text-center">
                <p className="text-red-400 mb-3">MetaMask is not installed.</p>
                <Button onClick={handleInstall} variant="primary" className="w-full">
                  Install MetaMask
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                variant="primary"
                className="w-full"
                loading={loading}
              >
                MetaMask
              </Button>
            )}
            <p className="text-xs text-center text-gray-500">
              We currently support only MetaMask.
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
