import api from './api';

export interface NonceResponse {
  message: string;
}

export interface VerifyResponse {
  token: string;
}

export const authService = {
  async getNonce(address: string): Promise<NonceResponse> {
    try {
      const { data } = await api.post('/auth/nonce', { address });
      return data;
    } catch (error) {
      console.warn('Nonce API failed, using mock', error);
      await new Promise((res) => setTimeout(res, 300));
      return { message: `Sign this message to login to MoltTip: ${Date.now()}` };
    }
  },

  async verifySignature(address: string, signature: string): Promise<VerifyResponse> {
    try {
      const { data } = await api.post('/auth/verify', { address, signature });
      return data;
    } catch (error) {
      console.warn('Verify API failed, using mock JWT', error);
      await new Promise((res) => setTimeout(res, 500));
      return { token: 'mock-jwt-token-' + Math.random().toString(36).substring(2) };
    }
  },
};
