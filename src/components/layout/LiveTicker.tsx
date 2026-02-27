import { useState } from 'react';
import { ArrowRight, TrendingUp, Activity } from 'lucide-react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useWalletStore }      from '@/stores/walletStore';
import { useSimulationStore }  from '@/stores/simulationStore';
import { formatNumber }        from '@/lib/utils';

export const LiveTicker: React.FC = () => {
  const { transactions }    = useTransactionStore();
  const { agents }          = useWalletStore();
  const { isRunning }       = useSimulationStore();
  const [paused, setPaused] = useState(false);

  const recent = transactions.slice(0, 20);

  if (!isRunning && recent.length === 0) return null;

  const items = [...recent, ...recent];

  return (
    <div
      className="relative overflow-hidden border-b border-default bg-bg-surface"
      style={{ height: '32px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10
        bg-gradient-to-r from-bg-surface to-transparent pointer-events-none" />

      <div className="absolute right-0 top-0 bottom-0 w-12 z-10
        bg-gradient-to-l from-bg-surface to-transparent pointer-events-none" />

      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20
        flex items-center gap-1.5">
        <Activity size={10} className="text-accent-cyan animate-pulse" />
        <span className="font-mono text-2xs text-accent-cyan uppercase tracking-widest font-bold">
          Live
        </span>
      </div>

      <div
        className="flex items-center h-full pl-20"
        style={{
          animation:  paused ? 'none' : 'ticker 30s linear infinite',
          whiteSpace: 'nowrap',
          width:      'max-content',
        }}
      >
        {items.map((tx, i) => {
          const from  = agents.find(a => a.id === tx.fromAgentId);
          const to    = agents.find(a => a.id === tx.toAgentId);
          const color =
            tx.type === 'trade'  ? 'text-accent-purple' :
            tx.type === 'reward' ? 'text-accent-green'  :
            tx.type === 'stake'  ? 'text-accent-yellow' :
                                   'text-accent-cyan';
          return (
            <span
              key={`${tx.id}-${i}`}
              className="inline-flex items-center gap-1.5 mx-6 text-2xs font-mono"
            >
              <TrendingUp size={9} className={color} />
              <span className="text-text-secondary">{from?.name ?? '?'}</span>
              <ArrowRight size={8} className="text-text-muted" />
              <span className="text-text-secondary">{to?.name ?? '?'}</span>
              <span className={`font-bold ${color}`}>
                +{formatNumber(tx.amount)} MOTIP
              </span>
              <span className="text-text-muted mx-2">·</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
