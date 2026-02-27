import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Bot, ArrowLeftRight,
  CreditCard, Trophy, Menu, X, Activity,
} from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/agents',      label: 'Agents',      icon: Bot             },
  { path: '/trade',       label: 'Trade',       icon: ArrowLeftRight  },
  { path: '/payments',    label: 'Payments',    icon: CreditCard      },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy          },
] as const;

export const Navbar: React.FC = () => {
  const navigate               = useNavigate();
  const location               = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isRunning, startSimulation, stopSimulation } = useSimulationStore();

  return (
    /* sits below DemoBanner (32px) */
    <header className="fixed top-8 left-0 right-0 z-40 h-14 glass border-b border-default
      flex items-center justify-between px-4 md:px-6">

      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2.5 shrink-0"
      >
        <div className="w-7 h-7 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30
          flex items-center justify-center">
          <Activity size={14} className="text-accent-cyan" />
        </div>
        <span className="font-display font-bold text-base text-primary hidden sm:block">
          MotiP <span className="text-accent-cyan">Economy</span>
        </span>
      </button>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                active
                  ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Sim status pill */}
        <div className={cn(
          'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-2xs font-mono',
          isRunning
            ? 'border-accent-green/30 bg-accent-green/5 text-accent-green'
            : 'border-default bg-bg-elevated text-text-muted'
        )}>
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            isRunning ? 'bg-accent-green animate-pulse' : 'bg-text-muted'
          )} />
          {isRunning ? 'LIVE' : 'PAUSED'}
        </div>

        {/* Sim toggle */}
        <button
          onClick={() => isRunning ? stopSimulation() : startSimulation()}
          className={cn(
            'btn btn-sm gap-1.5 font-mono text-xs',
            isRunning ? 'btn-danger' : 'btn-primary'
          )}
        >
          {isRunning ? (
            <><span className="w-2 h-2 bg-accent-red rounded-sm" /> Stop</>
          ) : (
            <><span className="w-0 h-0 border-l-[6px] border-l-current border-y-[4px] border-y-transparent" />
              Launch</>
          )}
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden btn btn-ghost btn-sm p-1.5"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-bg-surface
          border-b border-default shadow-lg animate-slideDown">
          <nav className="flex flex-col p-3 gap-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => { navigate(path); setMobileOpen(false); }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left',
                    active
                      ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                      : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  )}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
