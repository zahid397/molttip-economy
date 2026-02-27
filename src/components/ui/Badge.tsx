import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  const variants = {
    default:
      'bg-slate-700/40 text-slate-200 border border-slate-600/40',
    success:
      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning:
      'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    error:
      'bg-red-500/15 text-red-400 border border-red-500/30',
    info:
      'bg-primary-500/15 text-primary-400 border border-primary-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm transition-all duration-200 hover:scale-105',
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
