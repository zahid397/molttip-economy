import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bot, ArrowLeftRight,
  CreditCard, Trophy, Activity, Zap, TrendingUp, CircleDot,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { useSimulationStore } from '@/stores/simulationStore';
import { useEconomyStore }    from '@/stores/economyStore';

const NAV_ITEMS = [
  { path: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/agents',      label: 'Agents',      icon: Bot             },
  { path: '/trade',       label: 'Trade',       icon: ArrowLeftRight  },
  { path: '/payments',    label: 'Payments',    icon: CreditCard      },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy          },
] as const;

const Sidebar: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isRunning, tickCount } = useSimulationStore();
  const stats                    = useEconomyStore(s => s.stats);

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 bottom-0 w-56
        bg-bg-surface border-r border-default z-30 overflow-y-auto scrollbar-hide"
      style={{ top: '120px' }} /* DemoBanner(32) + Navbar(56) + Ticker(32) */
    >
      <nav className="flex flex-col gap-1 p-3 flex-1">
        <p className="text-2xs font-mono text-text-muted uppercase tracking-widest
          px-3 mb-2 mt-1">
          Navigation
        </p>

        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn('nav-link w-full justify-between', active && 'active')}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={14} />
                <span>{label}</span>
              </span>
              {active && <CircleDot size={8} className="text-accent-cyan opacity-70" />}
            </button>
          );
        })}

        <hr className="separator my-2" />

        <p className="text-2xs font-mono text-text-muted uppercase tracking-widest
          px-3 mb-2">
          Economy
        </p>

        <div className="card px-3 py-2.5 mx-1 mb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-text-secondary font-mono uppercase tracking-wider">
              24h Volume
            </span>
            <TrendingUp size={11} className="text-accent-green" />
          </div>
          <p className="font-mono text-sm font-bold text-accent-cyan">
            {stats ? formatNumber(stats.volumeLast24h) : '—'}
            <span className="text-2xs text-text-secondary font-normal ml-1">MOTIP</span>
          </p>
        </div>

        <div className="card px-3 py-2.5 mx-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-text-secondary font-mono uppercase tracking-wider">
              Active Agents
            </span>
            <Zap size={11} className="text-accent-yellow" />
          </div>
          <p className="font-mono text-sm font-bold text-primary">
            {stats ? stats.activeAgents : '—'}
            <span className="text-2xs text-text-secondary font-normal ml-1">
              / {stats ? stats.totalAgents : '—'}
            </span>
          </p>
        </div>
      </nav>

      <div className="p-3 border-t border-default">
        <div className={cn(
          'flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-mono',
          isRunning
            ? 'bg-accent-green/5 border-accent-green/20 text-accent-green'
            : 'bg-bg-elevated border-default text-text-secondary'
        )}>
          <span className="flex items-center gap-2">
            <Activity size={11} className={isRunning ? 'animate-pulse' : ''} />
            {isRunning ? 'SIM RUNNING' : 'SIM PAUSED'}
          </span>
          {isRunning && (
            <span className="text-2xs opacity-60">#{tickCount}</span>
          )}
        </div>
        <p className="text-2xs text-text-muted text-center mt-2 font-mono">
          MotiP Economy v1.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
