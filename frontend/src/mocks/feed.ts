import { Post } from '@/types/post.types';
import { mockUsers } from './users';

export const mockFeed: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    content: 'Just tipped 10 MOLT to a great creator! 🚀',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likes: 42,
    comments: 7,
  },
  {
    id: '2',
    author: mockUsers[1],
    content: 'The MoltTip ecosystem is growing fast. Love the community!',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likes: 128,
    comments: 23,
  },
  {
    id: '3',
    author: mockUsers[2],
    content: 'Check out my latest article on Web3 tipping!',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    likes: 89,
    comments: 12,
  },
  {
    id: '4',
    author: mockUsers[3],
    content: 'GM ☕️ Ready for another day of building.',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    likes: 215,
    comments: 31,
  },
];
