import { useState, useCallback, useMemo } from 'react';
import { notificationService } from '@/services/notification.service';
import { Notification } from '@/types/notification.types';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      return data;
    } catch (err) {
      console.error('Notification fetch error:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch notifications';

      setError(message);
      toast.error(message);

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);

      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
  };
};
