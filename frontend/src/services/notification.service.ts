import api from './api';
import { Notification } from '@/types/notification.types';
import { mockNotifications } from '@/mocks/notifications';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const { data } = await api.get('/notifications');
      return data;
    } catch (error) {
      console.warn('Notifications API failed, using mock', error);
      await new Promise((res) => setTimeout(res, 500));
      return mockNotifications;
    }
  },

  async markAsRead(id: string): Promise<{ success: boolean }> {
    try {
      const { data } = await api.patch(`/notifications/${id}/read`);
      return data;
    } catch (error) {
      console.warn('Mark as read failed, mock success', error);
      return { success: true };
    }
  },
};
