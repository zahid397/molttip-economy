import { Post } from '@/types/post.types';

export const mockFeed: Post[] = [
  {
    id: '1',
    author: {
      address: '0x1234567890123456789012345678901234567890',
      displayName: 'CryptoKing',
      joinedAt: '2025-01-01T00:00:00Z',
    },
    content: 'Just tipped 10 MOLT to a creator 🚀🔥',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    likes: 42,
    comments: 7,
  },
  {
    id: '2',
    author: {
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      displayName: 'NFTWhale',
      joinedAt: '2025-02-15T00:00:00Z',
    },
    content: 'MoltTip Economy is going viral 🔥 Web3 tipping future!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    likes: 88,
    comments: 21,
  },
];
