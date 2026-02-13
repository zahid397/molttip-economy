import api from './api';
import { Notification } from '@/types/notification.types';

interface NotificationsResponse {
  success?: boolean;
  data?: Notification[];
}

interface MarkReadResponse {
  success?: boolean;
  message?: string;
  data?: Notification;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<NotificationsResponse | Notification[]>('/notifications');

    // যদি backend { data: [...] } দেয়
    if (typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data || [];
    }

    // যদি backend সরাসরি array দেয়
    return response.data as Notification[];
  },

  async markAsRead(id: string): Promise<Notification | null> {
    const response = await api.patch<MarkReadResponse>(`/notifications/${id}/read`);

    return response.data?.data || null;
  },
};
