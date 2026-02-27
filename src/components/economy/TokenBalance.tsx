import React from 'react';
import { TrendingUp, TrendingDown, Minus, Wallet } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TokenBalanceProps {
  balance:          number;
  stakedAmount?:    number;
  previousBalance?: number;
  label?:           string;
  size?:            'sm' | 'md' | 'lg';
  showStaked?:      boolean;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({
  balance,
  stakedAmount    = 0,
  previousBalance,
  label           = 'Balance',
  size            = 'md',
  showStaked      = false,
}) => {
  const available = balance - stakedAmount;

  const delta = previousBalance !== undefined ? balance - previousBalance : null;
  const deltaPercent =
    previousBalance && previousBalance > 0
      ? ((delta! / previousBalance) * 100).toFixed(2)
      : null;

  const TrendIcon =
    delta === null ? null :
    delta > 0      ? TrendingUp :
    delta < 0      ? TrendingDown :
                     Minus;

  const trendColor =
    delta === null ? '' :
    delta > 0      ? 'text-accent-green'  :
    delta < 0      ? 'text-accent-red'    :
                     'text-text-secondary';

  const valueSize =
    size === 'lg' ? 'text-4xl' :
    size === 'sm' ? 'text-xl'  :
                    'text-3xl';

  return (
    <div className="card card-glow text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow opacity-40 pointer-events-none" />

      <div className="flex items-center justify-center gap-2 mb-3">
        <Wallet size={13} className="text-text-secondary" />
        <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">
          {label}
        </p>
      </div>

      <p className={cn('font-display font-bold text-glow-cyan leading-none', valueSize)}>
        {formatNumber(balance)}
      </p>
      <p className="text-xs font-mono text-text-secondary mt-1.5">MOTIP</p>

      {TrendIcon && delta !== null && (
        <div className={cn(
          'inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full border text-xs font-mono',
          delta > 0 ? 'border-accent-green/20 bg-accent-green/5' :
          delta < 0 ? 'border-accent-red/20 bg-accent-red/5'     :
                      'border-default bg-bg-elevated',
          trendColor
        )}>
          <TrendIcon size={11} />
          {delta > 0 ? '+' : ''}{formatNumber(delta)} MOTIP
          {deltaPercent && (
            <span className="opacity-60">
              ({delta > 0 ? '+' : ''}{deltaPercent}%)
            </span>
          )}
        </div>
      )}

      {showStaked && stakedAmount > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-default">
          <div className="bg-bg-elevated rounded-md px-3 py-2 border border-default">
            <p className="text-2xs font-mono text-text-muted uppercase tracking-wider mb-1">
              Available
            </p>
            <p className="font-mono text-sm font-bold text-accent-green">
              {formatNumber(available)}
            </p>
          </div>
          <div className="bg-bg-elevated rounded-md px-3 py-2 border border-default">
            <p className="text-2xs font-mono text-text-muted uppercase tracking-wider mb-1">
              Staked
            </p>
            <p className="font-mono text-sm font-bold text-accent-purple">
              {formatNumber(stakedAmount)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
