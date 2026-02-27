import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        className={cn(
          'relative w-full max-w-lg rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl p-6 transition-all duration-300 scale-100',
          className
        )}
      >
        {title && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-100 tracking-tight">
              {title}
            </h3>
          </div>
        )}

        <div className="text-slate-300">{children}</div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
