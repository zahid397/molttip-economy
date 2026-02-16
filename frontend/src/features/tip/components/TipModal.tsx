/**
 * Tip Modal Component
 */

'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { DollarSign, Heart } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Button } from '@/shared/components/ui/Button';
import { useWallet } from '@/shared/hooks/useWallet';
import { toast } from '@/shared/components/ui/Toast';
import { tipService } from '../services/tip.service';
import { MIN_TIP_AMOUNT, MAX_TIP_AMOUNT } from '@/shared/constants';
import { formatCurrency } from '@/shared/utils/format';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  postId?: string;
  onSuccess?: () => void;
}

export const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  postId,
  onSuccess,
}) => {
  const { balance } = useWallet();

  // Wallet balance is string | null in your hook — normalize to number safely
  const numericBalance = useMemo(() => {
    const n = typeof balance === 'string' ? Number(balance) : Number(balance ?? 0);
    return Number.isFinite(n) ? n : 0;
  }, [balance]);

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const tipAmount = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const maxAffordable = Math.min(MAX_TIP_AMOUNT, numericBalance);

  const validationError = useMemo(() => {
    if (!amount.trim()) return undefined; // don't show error before typing
    if (tipAmount <= 0) return 'Enter a valid amount';
    if (tipAmount < MIN_TIP_AMOUNT) return `Minimum tip is ${MIN_TIP_AMOUNT} MOLT`;
    if (tipAmount > MAX_TIP_AMOUNT) return `Maximum tip is ${MAX_TIP_AMOUNT} MOLT`;
    if (tipAmount > numericBalance) return 'Insufficient balance';
    return undefined;
  }, [amount, tipAmount, numericBalance]);

  const isValid =
    tipAmount >= MIN_TIP_AMOUNT &&
    tipAmount <= MAX_TIP_AMOUNT &&
    tipAmount <= numericBalance &&
    !validationError;

  const quickAmounts = [5, 10, 25, 50, 100];

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await tipService.sendTip({
        toUserId: recipientId,
        amount: tipAmount,
        postId,
        message: message.trim() || undefined,
      });

      toast.success(`Successfully tipped ${formatCurrency(tipAmount, 0)} MOLT!`);
      onSuccess?.();
      onClose();
      // form resets via effect when isOpen becomes false
    } catch (err) {
      toast.error('Failed to send tip. Please try again.');
      console.error('Tip error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, recipientId, tipAmount, postId, message, onSuccess, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tip ${recipientName}`} size="md">
      <div className="space-y-6">
        {/* Balance Display */}
        <div className="p-4 bg-moleskine-tan rounded-lg border-2 border-moleskine-black">
          <p className="text-sm text-gray-600 mb-1">Your Balance</p>
          <p className="text-2xl font-bold text-moleskine-black">
            {formatCurrency(numericBalance, 0)} MOLT
          </p>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <label className="text-sm font-medium text-moleskine-black mb-2 block">
            Quick Amount
          </label>
          <div className="grid grid-cols-5 gap-2">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                type="button"
                onClick={() => setAmount(String(qa))}
                disabled={qa > numericBalance}
                className={`px-3 py-2 border-2 border-moleskine-black rounded-lg font-medium transition-all ${
                  tipAmount === qa
                    ? 'bg-moleskine-black text-moleskine-cream'
                    : 'bg-white hover:bg-moleskine-tan'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {qa}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <Input
          label="Custom Amount (MOLT)"
          type="number"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`${MIN_TIP_AMOUNT} - ${MAX_TIP_AMOUNT}`}
          min={MIN_TIP_AMOUNT}
          max={maxAffordable}
          step={1}
          leftIcon={<DollarSign className="w-4 h-4" />}
          error={validationError}
        />

        {/* Message */}
        <Textarea
          label="Message (Optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a message with your tip..."
          rows={3}
          maxLength={200}
          showCount
        />

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid}
            isLoading={isSubmitting}
            fullWidth
          >
            <Heart className="w-4 h-4 mr-2" />
            Send {tipAmount > 0 ? `${formatCurrency(tipAmount, 0)} MOLT` : 'Tip'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
