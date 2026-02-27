import React from 'react';
import { Agent } from '@/types';
import { cn, formatNumber } from '@/lib/utils';
import { Zap, TrendingUp, Lock } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onSelect?: (agent: Agent) => void;
  selected?: boolean;
}

const STATUS_CONFIG = {
  active:  { label: 'Active',  dot: 'active',  badge: 'badge-green'  },
  idle:    { label: 'Idle',    dot: 'idle',    badge: 'badge-yellow' },
  offline: { label: 'Offline', dot: 'offline', badge: 'badge-muted'  },
} as const;

const AVATAR_COLORS = [
  'from-accent-cyan/20 to-accent-purple/20',
  'from-accent-green/20 to-accent-cyan/20',
  'from-accent-purple/20 to-accent-orange/20',
  'from-accent-orange/20 to-accent-red/20',
  'from-accent-yellow/20 to-accent-green/20',
];

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, selected }) => {
  const status  = STATUS_CONFIG[agent.status ?? (agent.isActive ? 'active' : 'offline')];
  const colorIdx = agent.id.charCodeAt(agent.id.length - 1) % AVATAR_COLORS.length;
  const repColor =
    agent.reputation >= 80 ? 'text-accent-green' :
    agent.reputation >= 50 ? 'text-accent-yellow' :
                              'text-accent-red';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(agent)}
      onKeyDown={e => e.key === 'Enter' && onSelect?.(agent)}
      className={cn(
        'card card-glow cursor-pointer select-none transition-all duration-200',
        'hover:translate-y-[-2px]',
        selected && 'border-accent-cyan/50 shadow-glow-cyan',
        !agent.isActive && 'opacity-50 pointer-events-none'
      )}
    >
      {/* ── Top row ── */}
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className={cn(
          'relative w-11 h-11 rounded-lg shrink-0 overflow-hidden',
          `bg-gradient-to-br ${AVATAR_COLORS[colorIdx]}`,
          'border border-default flex items-center justify-center'
        )}>
          <img
            src={`/assets/avatars/${agent.avatar}`}
            alt={agent.name}
            className="w-full h-full object-cover"
            onError={e => {
              const el = e.currentTarget;
              el.style.display = 'none';
              el.parentElement!.innerHTML =
                `<span class="font-display font-bold text-lg text-text-primary">
                  ${agent.name[0]}
                </span>`;
            }}
          />

          {/* Status dot */}
          <span className={cn(
            'status-dot absolute bottom-0.5 right-0.5',
            status.dot
          )} />
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display font-bold text-md text-primary truncate">
              {agent.name}
            </p>
            <span className={cn('badge text-2xs shrink-0', status.badge)}>
              {status.label}
            </span>
          </div>
          <p className="text-2xs font-mono text-text-muted mt-0.5 truncate">
            ID: {agent.id}
          </p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-2 mt-4">

        {/* Balance */}
        <div className="bg-bg-elevated rounded-md px-2.5 py-2 border border-default">
          <p className="text-2xs text-text-muted font-mono uppercase tracking-wider mb-1">
            Balance
          </p>
          <p className="font-mono text-xs font-bold text-accent-cyan leading-none">
            {formatNumber(agent.balance)}
          </p>
          <p className="text-2xs text-text-muted mt-0.5">MOTIP</p>
        </div>

        {/* Staked */}
        <div className="bg-bg-elevated rounded-md px-2.5 py-2 border border-default">
          <p className="text-2xs text-text-muted font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
            <Lock size={8} /> Staked
          </p>
          <p className="font-mono text-xs font-bold text-accent-purple leading-none">
            {formatNumber(agent.stakedAmount)}
          </p>
          <p className="text-2xs text-text-muted mt-0.5">MOTIP</p>
        </div>

        {/* Reputation */}
        <div className="bg-bg-elevated rounded-md px-2.5 py-2 border border-default">
          <p className="text-2xs text-text-muted font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingUp size={8} /> Rep
          </p>
          <p className={cn('font-mono text-xs font-bold leading-none', repColor)}>
            {agent.reputation}
          </p>
          <p className="text-2xs text-text-muted mt-0.5">/ 100</p>
        </div>
      </div>

      {/* ── Reputation bar ── */}
      <div className="mt-3">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${agent.reputation}%` }}
          />
        </div>
      </div>

      {/* ── Bottom: staked ratio ── */}
      {agent.stakedAmount > 0 && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-default">
          <Zap size={10} className="text-accent-yellow" />
          <span className="text-2xs font-mono text-text-secondary">
            {((agent.stakedAmount / (agent.balance + agent.stakedAmount)) * 100).toFixed(1)}%
            staked of total holdings
          </span>
        </div>
      )}
    </div>
  );
};
