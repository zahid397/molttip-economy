import api from './api';

export interface SendTipParams {
  recipientAddress: string;
  postId: string;
  amount: number;
}

export const tipService = {
  async sendTip({ recipientAddress, postId, amount }: SendTipParams) {
    try {
      const { data } = await api.post('/tips', { recipientAddress, postId, amount });
      return data;
    } catch (error) {
      console.warn('Tip API failed, using mock success', error);
      await new Promise((res) => setTimeout(res, 800));
      return {
        id: 'mock-tip-' + Date.now(),
        fromAddress: '0xYourWallet', // would be actual wallet in real scenario
        toAddress: recipientAddress,
        postId,
        amount,
        timestamp: new Date().toISOString(),
      };
    }
  },
};
