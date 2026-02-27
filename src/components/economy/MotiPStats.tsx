import {
  Coins, Bot, Star, TrendingUp,
  ArrowDownRight, Activity, Zap,
} from 'lucide-react';
import { useEconomyStore } from '@/stores/economyStore';
import { formatNumber }    from '@/lib/utils';
import { EconomyStats }    from '@/types';

interface StatConfig {
  key:     keyof EconomyStats;
  label:   string;
  suffix:  string;
  icon:    React.ElementType;
  color:   string;
  format?: (v: number) => string;
}

const STATS: StatConfig[] = [
  { key: 'totalSupply',       label: 'Total Supply',   suffix: 'MOTIP',  icon: Coins,       color: 'text-accent-cyan',   format: formatNumber },
  { key: 'circulatingSupply', label: 'Circulating',    suffix: 'MOTIP',  icon: TrendingUp,  color: 'text-accent-green',  format: formatNumber },
  { key: 'totalStaked',       label: 'Total Staked',   suffix: 'MOTIP',  icon: Zap,         color: 'text-accent-purple', format: formatNumber },
  { key: 'activeAgents',      label: 'Active Agents',  suffix: 'agents', icon: Bot,         color: 'text-accent-yellow', format: String       },
  { key: 'volumeLast24h',     label: '24h Volume',     suffix: 'MOTIP',  icon: Activity,    color: 'text-accent-orange', format: formatNumber },
  { key: 'avgReputation',     label: 'Avg Reputation', suffix: '/ 100',  icon: Star,        color: 'text-accent-green',  format: (v) => v.toFixed(1) },
];

export const MotiPStats: React.FC = () => {
  const stats = useEconomyStore(s => s.stats);

  if (!stats) return (
    <div className="card">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );

  const stakedPct = stats.totalSupply > 0
    ? ((stats.totalStaked / stats.totalSupply) * 100).toFixed(1)
    : '0';

  return (
    <div className="card">

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-accent-cyan" />
          <h2 className="font-display font-bold text-lg text-primary">Economy Overview</h2>
        </div>
        <span className="badge badge-cyan text-2xs">LIVE</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STATS.map(({ key, label, suffix, icon: Icon, color, format }) => {
          const raw = stats[key] as number;
          const val = format ? format(raw) : String(raw);

          return (
            <div
              key={key}
              className="bg-bg-elevated border border-default rounded-lg px-4 py-3
                hover:border-bright transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xs font-mono text-text-muted uppercase tracking-wider">
                  {label}
                </p>
                <Icon size={13} className={color} />
              </div>
              <p className={`font-mono text-xl font-bold leading-none ${color}`}>{val}</p>
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
            {stakedPct}% of supply locked
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
        <span className="font-mono text-xs font-bold text-text-primary">
          {formatNumber(stats.totalTransactions)}
        </span>
      </div>
    </div>
  );
};
