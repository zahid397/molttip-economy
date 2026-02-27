import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon:        LucideIcon;
  title:       string;
  description?: string;
  action?:     { label: string; onClick: () => void };
  className?:  string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => (
  <div className={cn(
    'flex flex-col items-center justify-center py-16 px-6 text-center',
    className
  )}>
    <div className="relative mb-4">
      <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-default
        flex items-center justify-center animate-pulse">
        <Icon size={24} className="text-text-muted" />
      </div>
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-2xl border border-accent-cyan/10
        scale-110 animate-ping" style={{ animationDuration: '3s' }} />
    </div>

    <p className="font-display font-bold text-md text-text-secondary mb-1">
      {title}
    </p>
    {description && (
      <p className="text-xs font-mono text-text-muted max-w-xs">
        {description}
      </p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="btn btn-secondary btn-sm mt-4 font-mono text-xs gap-2"
      >
        {action.label}
      </button>
    )}
  </div>
);
