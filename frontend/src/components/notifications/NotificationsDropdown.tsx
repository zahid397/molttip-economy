'use client';

import { useState, useEffect, useRef } from 'react';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { BellIcon } from '@heroicons/react/24/outline';

export const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    loading,
  } = useNotifications();

  // Fetch notifications only when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on ESC key (premium UX)
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-gray-400 hover:text-neon-blue transition-all hover:scale-105"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-neon-purple rounded-full shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 glass-panel border border-glass-light shadow-xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-3 border-b border-glass-light flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            <span className="text-xs text-gray-400">
              {unreadCount} unread
            </span>
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No notifications yet 🚀
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkAsRead}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-glass-light text-center text-xs text-gray-500">
            MoltTip Alerts System • Live
          </div>
        </div>
      )}
    </div>
  );
};
