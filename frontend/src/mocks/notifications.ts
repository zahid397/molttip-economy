import { Notification } from '@/types/notification.types';

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'tip',
    message: 'You received a tip of 5 MOLT from 0xabc...',
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'n2',
    type: 'like',
    message: 'Your post was liked by 0xdef...',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'n3',
    type: 'follow',
    message: 'NFTWhale started following you',
    read: false,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'n4',
    type: 'comment',
    message: 'Alice commented on your post: "Awesome!"',
    read: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];
