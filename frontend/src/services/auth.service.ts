import api from './api';

interface NonceResponse {
  message: string;
}

interface VerifyResponse {
  token: string;
  user?: {
    address: string;
  };
}

export const authService = {
  async getNonce(address: string): Promise<NonceResponse> {
    const response = await api.post<NonceResponse>('/auth/nonce', {
      address,
    });

    return response.data;
  },

  async verifySignature(
    address: string,
    signature: string
  ): Promise<VerifyResponse> {
    const response = await api.post<VerifyResponse>('/auth/verify', {
      address,
      signature,
    });

    return response.data;
  },
};
