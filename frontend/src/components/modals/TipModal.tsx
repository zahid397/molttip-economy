'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useTip } from '@/hooks/useTip';
import { useWallet } from '@/hooks/useWallet';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientAddress: string;
  recipientName: string;
  postId: string;
}

export const TipModal = ({
  isOpen,
  onClose,
  recipientAddress,
  recipientName,
  postId,
}: TipModalProps) => {
  const [amount, setAmount] = useState('');
  const { sendTip, loading } = useTip();
  const { isConnected } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    try {
      await sendTip({ recipientAddress, postId, amount: parseFloat(amount) });
      toast.success(`Tip of ${amount} MOLT sent to ${recipientName}!`);
      onClose();
      setAmount('');
    } catch (error) {
      toast.error('Failed to send tip');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="glass-panel max-w-md w-full p-6 border border-neon-blue/30">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Send Tip
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-300 mb-2">
            Tipping <span className="font-semibold text-white">{recipientName}</span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="number"
              label="Amount (MOLT)"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.001"
              step="0.001"
              required
            />
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                Send Tip
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
