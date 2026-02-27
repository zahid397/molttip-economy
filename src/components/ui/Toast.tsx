import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Info } from 'lucide-react';

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
    const enter = setTimeout(() => setVisible(true), 20);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 250);
    }, duration);

    return () => {
      clearTimeout(enter);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const variants = {
    success:
      'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400',
    error:
      'bg-red-500/15 border border-red-500/30 text-red-400',
    info:
      'bg-primary-500/15 border border-primary-500/30 text-primary-400',
  };

  const icons = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl shadow-xl transition-all duration-300 transform',
        variants[type],
        visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95'
      )}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
