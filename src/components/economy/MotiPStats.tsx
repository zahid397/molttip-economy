import {
  Coins, Bot, Star, TrendingUp,
  ArrowDownRight, Activity, Zap,
} from 'lucide-react';
import { useEconomyStore }  from '@/stores/economyStore';
import { AnimatedNumber }   from '@/components/ui/AnimatedNumber';
import { StatSkeleton }     from '@/components/ui/Skeleton';
import { EconomyStats }     from '@/types';

interface StatConfig {
  key:      keyof EconomyStats;
  label:    string;
  suffix:   string;
  icon:     React.ElementType;
  color:    string;
  decimals?: number;
}

const STATS: StatConfig[] = [
  { key: 'totalSupply',       label: 'Total Supply',   suffix: 'MOTIP',  icon: Coins,      color: 'text-accent-cyan'   },
  { key: 'circulatingSupply', label: 'Circulating',    suffix: 'MOTIP',  icon: TrendingUp, color: 'text-accent-green'  },
  { key: 'totalStaked',       label: 'Total Staked',   suffix: 'MOTIP',  icon: Zap,        color: 'text-accent-purple' },
  { key: 'activeAgents',      label: 'Active Agents',  suffix: 'agents', icon: Bot,        color: 'text-accent-yellow', decimals: 0 },
  { key: 'volumeLast24h',     label: '24h Volume',     suffix: 'MOTIP',  icon: Activity,   color: 'text-accent-orange' },
  { key: 'avgReputation',     label: 'Avg Reputation', suffix: '/ 100',  icon: Star,       color: 'text-accent-green',  decimals: 1 },
];

export const MotiPStats: React.FC = () => {
  const stats = useEconomyStore(s => s.stats);

  if (!stats) return <StatSkeleton />;

  const stakedPct = stats.totalSupply > 0
    ? (stats.totalStaked / stats.totalSupply) * 100
    : 0;

  return (
    <div className="card">

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-accent-cyan" />
          <h2 className="font-display font-bold text-lg text-primary">Economy Overview</h2>
        </div>
        <span className="badge badge-cyan text-2xs glow-border-animate">
          <span className="live-dot mr-1">
            <span className="status-dot active" />
          </span>
          LIVE
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STATS.map(({ key, label, suffix, icon: Icon, color, decimals }) => {
          const raw = stats[key] as number;
          return (
            <div
              key={key}
              className="bg-bg-elevated border border-default rounded-lg px-4 py-3
                card-hover cursor-default"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xs font-mono text-text-muted uppercase tracking-wider">
                  {label}
                </p>
                <Icon size={13} className={color} />
              </div>
              <AnimatedNumber
                value={raw}
                decimals={decimals}
                className={`font-mono text-xl font-bold leading-none ${color}`}
              />
              <p className="text-2xs font-mono text-text-muted mt-1">{suffix}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-default">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xs font-mono text-text-muted uppercase tracking-wider">
            Staked Ratio
          </span>
          <span className="text-2xs font-mono text-accent-purple font-bold">
            <AnimatedNumber value={stakedPct} decimals={1} />% of supply locked
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${stakedPct}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <ArrowDownRight size={11} className="text-text-muted" />
          <span className="text-2xs font-mono text-text-secondary">Total Transactions</span>
        </div>
        <AnimatedNumber
          value={stats.totalTransactions}
          decimals={0}
          className="font-mono text-xs font-bold text-text-primary"
        />
      </div>
    </div>
  );
};
