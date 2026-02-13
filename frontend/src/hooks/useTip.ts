import { useState, useCallback } from 'react';
import { tipService } from '@/services/tip.service';
import toast from 'react-hot-toast';

interface SendTipParams {
  recipientAddress: string;
  postId: string;
  amount: number;
}

export const useTip = () => {
  const [loading, setLoading] = useState(false);

  const sendTip = useCallback(async (params: SendTipParams) => {
    setLoading(true);

    try {
      if (!params.amount || params.amount <= 0) {
        throw new Error('Invalid tip amount');
      }

      const response = await tipService.sendTip(params);

      toast.success('Tip sent successfully 🎉');
      return response;

    } catch (error) {
      console.error('Tip error:', error);

      const message =
        error instanceof Error ? error.message : 'Failed to send tip';

      toast.error(message);
      throw error; // important: caller can catch
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendTip, loading };
};
