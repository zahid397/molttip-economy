import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => setVisible(true), 50);

    // Exit timer
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // wait for animation
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 px-4 py-2 rounded-xl shadow-lg text-white transition-all duration-300',
        bgColor,
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      {message}
    </div>
  );
};
