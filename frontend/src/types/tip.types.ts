export interface Tip {
  id: string;
  fromAddress: string;
  toAddress: string;
  postId?: string;
  amount: number;
  timestamp: string;
}
