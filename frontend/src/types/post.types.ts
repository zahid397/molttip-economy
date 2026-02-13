import { User } from './user.types';

export interface Post {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  tips?: number;
}
