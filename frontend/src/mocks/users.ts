import { User } from '@/types/user.types';

export const mockUsers: User[] = [
  {
    address: '0x1234567890123456789012345678901234567890',
    displayName: 'CryptoKing',
    bio: 'Web3 enthusiast and content creator',
    avatar: '',
    joinedAt: '2024-01-01T00:00:00Z',
  },
  {
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    displayName: 'NFTWhale',
    bio: 'Digital art collector',
    avatar: '',
    joinedAt: '2024-02-15T00:00:00Z',
  },
  {
    address: '0x1111111111111111111111111111111111111111',
    displayName: 'Alice',
    bio: 'Building the future',
    avatar: '',
    joinedAt: '2024-01-10T00:00:00Z',
  },
  {
    address: '0x2222222222222222222222222222222222222222',
    displayName: 'Bob',
    bio: 'DeFi farmer',
    avatar: '',
    joinedAt: '2024-02-05T00:00:00Z',
  },
];
