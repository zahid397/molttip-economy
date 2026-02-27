import React, { useState } from 'react';
import { Play, Square, Loader2, Zap, Activity } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { cn } from '@/lib/utils';

export const LaunchButton: React.FC = () => {
  const [isPending, setIsPending] = useState(false);
  const { isRunning, startSimulation, stopSimulation, tickCount } = useSimulationStore();

  const handleClick = async () => {
    setIsPending(true);
    try {
      isRunning ? stopSimulation() : startSimulation();
    } finally {
      // Brief delay so button feels responsive
      setTimeout(() => setIsPending(false), 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full sm:w-auto">

      {/* ── Main button ── */}
      <button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          'btn btn-lg w-full sm:w-auto gap-3 font-mono font-bold tracking-wider',
          'relative overflow-hidden transition-all duration-300',
          isRunning
            ? 'btn-danger text-accent-red border-accent-red/40 hover:shadow-glow-red'
            : 'btn-primary hover:shadow-glow-cyan'
        )}
      >
        {/* Animated background pulse when running */}
        {isRunning && (
          <span className="absolute inset-0 bg-accent-red/5 animate-pulse pointer-events-none" />
        )}

        {isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isRunning ? (
          <Square size={16} fill="currentColor" />
        ) : (
          <Play size={16} fill="currentColor" />
        )}

        {isPending
          ? 'Processing…'
          : isRunning
          ? 'Stop Simulation'
          : 'Launch Simulation'
        }

        {isRunning && (
          <span className="flex items-center gap-1 text-xs opacity-60 ml-1">
            <Activity size={10} className="animate-pulse" />
            #{tickCount}
          </span>
        )}
      </button>

      {/* ── Status label ── */}
      <div className={cn(
        'flex items-center gap-2 text-2xs font-mono uppercase tracking-widest',
        isRunning ? 'text-accent-green' : 'text-text-muted'
      )}>
        <Zap size={10} className={isRunning ? 'text-accent-green' : 'text-text-muted'} />
        {isRunning
          ? 'Economy simulation is live'
          : 'Simulation is paused'
        }
      </div>
    </div>
  );
};
