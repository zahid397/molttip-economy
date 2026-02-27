import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bot, ArrowLeftRight,
  CreditCard, Trophy, Play, Square, Menu, X, Activity,
} from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/',            label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/agents',      label: 'Agents',     icon: Bot             },
  { path: '/trade',       label: 'Trade',      icon: ArrowLeftRight  },
  { path: '/payments',    label: 'Payments',   icon: CreditCard      },
  { path: '/leaderboard', label: 'Leaderboard',icon: Trophy          },
] as const;

export const Navbar: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isRunning, startSimulation, stopSimulation } = useSimulationStore();

  const handleSimToggle = () => isRunning ? stopSimulation() : startSimulation();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-default">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">

          {/* ── Logo ── */}
          <button
            className="flex items-center gap-2.5 group"
            onClick={() => navigate('/')}
          >
            <img src="/logo.svg" alt="MotiP" className="w-7 h-7" />
            <span className="font-display font-bold text-lg text-primary leading-none
              group-hover:text-glow-cyan transition-all duration-200">
              MotiP
              <span className="text-accent-cyan ml-1">Economy</span>
            </span>
          </button>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={cn(
                    'nav-link text-sm',
                    active && 'active'
                  )}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-3">

            {/* Sim status pill */}
            <div className={cn(
              'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono',
              isRunning
                ? 'border-accent-green/30 bg-accent-green/5 text-accent-green'
                : 'border-default bg-bg-elevated text-text-secondary'
            )}>
              <Activity size={11} className={isRunning ? 'animate-pulse' : ''} />
              {isRunning ? 'LIVE' : 'PAUSED'}
            </div>

            {/* Sim toggle button */}
            <button
              onClick={handleSimToggle}
              className={cn(
                'btn btn-sm gap-2 font-mono text-xs',
                isRunning ? 'btn-danger' : 'btn-primary'
              )}
            >
              {isRunning
                ? <><Square size={11} fill="currentColor" /> Stop</>
                : <><Play  size={11} fill="currentColor" /> Simulate</>
              }
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden btn btn-ghost btn-sm p-2"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Nav ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-default bg-bg-surface animate-slideDown">
            <nav className="flex flex-col gap-1 p-3">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => { navigate(path); setMobileOpen(false); }}
                    className={cn('nav-link', active && 'active')}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer so content doesn't hide under fixed navbar */}
      <div className="h-14" />
    </>
  );
};
