import { Notification } from '@/types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export const NotificationItem = ({
  notification,
  onMarkRead,
}: NotificationItemProps) => {
  return (
    <div
      className={`px-4 py-3 transition-all duration-200 hover:bg-glass-light/60 ${
        !notification.read
          ? 'bg-neon-blue/5 border-l-4 border-neon-blue'
          : ''
      }`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white leading-relaxed">
            {notification.message}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>

        {!notification.read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="text-neon-blue hover:text-neon-purple transition-colors"
            title="Mark as read"
          >
            <CheckCircleIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
