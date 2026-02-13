export interface Notification {
  id: string;
  type: 'tip' | 'follow' | 'like' | 'comment';
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}
