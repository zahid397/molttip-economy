import api from './api';

export interface SendTipPayload {
  recipientAddress: string;
  postId: string;
  amount: number;
}

export interface SendTipResponse {
  success: boolean;
  transactionHash?: string;
  message?: string;
}

export const tipService = {
  async sendTip(payload: SendTipPayload): Promise<SendTipResponse> {
    const { recipientAddress, postId, amount } = payload;

    if (!recipientAddress || !postId || !amount || amount <= 0) {
      throw new Error('Invalid tip parameters');
    }

    const response = await api.post<SendTipResponse>('/tips', {
      recipientAddress,
      postId,
      amount,
    });

    return response.data;
  },
};
