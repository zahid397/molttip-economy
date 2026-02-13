import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-blue/40 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-[0_0_20px_rgba(0,243,255,0.45)]',
    secondary:
      'bg-glass-dark border border-glass-light text-white hover:bg-glass-light/60',
    outline:
      'border border-neon-blue text-neon-blue hover:bg-neon-blue/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="mr-2 flex items-center">
          <Spinner size="sm" />
        </span>
      )}
      {children}
    </button>
  );
};
