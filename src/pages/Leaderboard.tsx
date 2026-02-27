import React, { useEffect, useMemo, useState } from 'react';
import {
  Trophy, Medal, ArrowUp, ArrowDown,
  Minus, TrendingUp, Star, Activity,
  Crown, Zap,
} from 'lucide-react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useWalletStore }      from '@/stores/walletStore';
import { LeaderboardEntry }    from '@/types';
import { cn, formatNumber }    from '@/lib/utils';

type SortKey = 'rank' | 'totalEarned' | 'totalSpent' | 'tradeCount' | 'reputation';

const RANK_CONFIG = [
  { rank: 1, icon: Crown,  color: 'text-accent-yellow', bg: 'bg-accent-yellow/10 border-accent-yellow/30' },
  { rank: 2, icon: Medal,  color: 'text-slate-300',      bg: 'bg-slate-300/10    border-slate-300/20'     },
  { rank: 3, icon: Medal,  color: 'text-accent-orange',  bg: 'bg-accent-orange/10 border-accent-orange/20' },
] as const;

export const Leaderboard: React.FC = () => {
  const { transactions }        = useTransactionStore();
  const { agents, fetchAgents } = useWalletStore();
  const [sortKey, setSortKey]   = useState<SortKey>('totalEarned');
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('desc');

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  // Derive leaderboard from live store data — no api call needed
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    return agents
      .map(agent => {
        const earned = transactions
          .filter(t => t.toAgentId   === agent.id && t.status === 'confirmed')
          .reduce((s, t) => s + t.amount, 0);
        const spent = transactions
          .filter(t => t.fromAgentId === agent.id && t.status === 'confirmed')
          .reduce((s, t) => s + t.amount, 0);
        const tradeCount = transactions
          .filter(t => t.fromAgentId === agent.id || t.toAgentId === agent.id)
          .length;
        return {
          agentId:    agent.id,
          agentName:  agent.name,
          avatar:     agent.avatar,
          rank:       0, // computed below
          previousRank: undefined,
          totalEarned: earned,
          totalSpent:  spent,
          tradeCount,
          reputation: agent.reputation,
        } satisfies LeaderboardEntry;
      })
      .sort((a, b) => b.totalEarned - a.totalEarned)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }, [agents, transactions]);

  const sorted = useMemo(() => {
    const mul = sortDir === 'asc' ? 1 : -1;
    return [...leaderboard].sort((a, b) => {
      if (sortKey === 'rank')        return mul * (a.rank - b.rank);
      if (sortKey === 'totalEarned') return mul * (a.totalEarned - b.totalEarned);
      if (sortKey === 'totalSpent')  return mul * (a.totalSpent  - b.totalSpent);
      if (sortKey === 'tradeCount')  return mul * (a.tradeCount  - b.tradeCount);
      if (sortKey === 'reputation')  return mul * (a.reputation  - b.reputation);
      return 0;
    });
  }, [leaderboard, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey !== k ? null :
    sortDir === 'desc'
      ? <ArrowDown size={10} className="text-accent-cyan" />
      : <ArrowUp   size={10} className="text-accent-cyan" />;

  // Podium top 3
  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="space-y-6 page-enter">

      {/* ── Header ── */}
      <div>
        <h1 className="font-display font-bold text-3xl text-primary flex items-center gap-3">
          <Trophy size={24} className="text-accent-yellow" />
          Leaderboard
        </h1>
        <p className="text-sm text-text-secondary mt-1 font-mono">
          Agent rankings by total MOTIP earned
        </p>
      </div>

      {/* ── Podium ── */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[top3[1], top3[0], top3[2]].map((entry, col) => {
            const cfg    = RANK_CONFIG.find(r => r.rank === entry.rank)!;
            const Icon   = cfg.icon;
            const isFirst = entry.rank === 1;
            return (
              <div
                key={entry.agentId}
                className={cn(
                  'card text-center relative overflow-hidden',
                  'border transition-all duration-200',
                  cfg.bg,
                  isFirst && 'ring-1 ring-accent-yellow/30'
                )}
              >
                {isFirst && (
                  <div className="absolute inset-0 bg-radial-glow opacity-30
                    pointer-events-none" />
                )}
                <Icon size={isFirst ? 22 : 18} className={cn('mx-auto mb-2', cfg.color)} />
                <div className={cn(
                  'w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center',
                  'font-display font-bold text-lg bg-bg-overlay border',
                  cfg.color,
                )}>
                  {entry.agentName[0]}
                </div>
                <p className="font-display font-bold text-sm text-primary truncate px-1">
                  {entry.agentName}
                </p>
                <p className={cn('font-mono text-xs font-bold mt-1', cfg.color)}>
                  #{entry.rank}
                </p>
                <p className="font-mono text-xs text-accent-cyan mt-1">
                  {formatNumber(entry.totalEarned)}
                </p>
                <p className="text-2xs text-text-muted">MOTIP earned</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Table ── */}
      <div className="card p-0 overflow-hidden">

        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-3
          border-b border-default bg-bg-elevated">
          <h2 className="font-display font-bold text-sm text-primary flex items-center gap-2">
            <Activity size={13} className="text-accent-cyan" />
            Full Rankings
          </h2>
          <span className="font-mono text-2xs text-text-muted">
            {sorted.length} agents
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={32} className="text-text-muted mx-auto mb-3" />
            <p className="font-mono text-sm text-text-muted">
              No data yet. Launch simulation to populate rankings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  {([
                    ['rank',        'Rank'       ],
                    [null,          'Agent'      ],
                    ['totalEarned', 'Earned'     ],
                    ['totalSpent',  'Spent'      ],
                    ['tradeCount',  'Trades'     ],
                    ['reputation',  'Reputation' ],
                  ] as [SortKey | null, string][]).map(([key, label]) => (
                    <th
                      key={label}
                      onClick={key ? () => toggleSort(key) : undefined}
                      className={cn(key && 'cursor-pointer hover:text-text-primary')}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {key && <SortIcon k={key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(entry => {
                  const rankCfg   = RANK_CONFIG.find(r => r.rank === entry.rank);
                  const RankIcon  = rankCfg?.icon;
                  const delta     = entry.previousRank !== undefined
                    ? entry.previousRank - entry.rank : null;
                  const repColor  =
                    entry.reputation >= 80 ? 'text-accent-green'  :
                    entry.reputation >= 50 ? 'text-accent-yellow' :
                                             'text-accent-red';

                  return (
                    <tr key={entry.agentId}>

                      {/* Rank */}
                      <td className="w-16">
                        <div className="flex items-center gap-2">
                          {RankIcon
                            ? <RankIcon size={14} className={rankCfg!.color} />
                            : <span className="font-mono font-bold text-text-secondary w-4">
                                {entry.rank}
                              </span>
                          }
                          {delta !== null && (
                            delta > 0
                              ? <ArrowUp   size={10} className="text-accent-green"  />
                              : delta < 0
                              ? <ArrowDown size={10} className="text-accent-red"    />
                              : <Minus     size={10} className="text-text-muted"    />
                          )}
                        </div>
                      </td>

                      {/* Agent */}
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-bg-overlay border border-default
                            flex items-center justify-center font-display text-xs
                            font-bold text-accent-cyan shrink-0">
                            {entry.agentName[0]}
                          </div>
                          <span className="font-display font-bold text-sm text-primary">
                            {entry.agentName}
                          </span>
                        </div>
                      </td>

                      {/* Earned */}
                      <td>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={11} className="text-accent-green" />
                          <span className="font-mono font-bold text-accent-cyan">
                            {formatNumber(entry.totalEarned)}
                          </span>
                        </div>
                      </td>

                      {/* Spent */}
                      <td>
                        <span className="font-mono text-text-secondary">
                          {formatNumber(entry.totalSpent)}
                        </span>
                      </td>

                      {/* Trades */}
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Zap size={10} className="text-accent-yellow" />
                          <span className="font-mono text-text-primary">
                            {entry.tradeCount}
                          </span>
                        </div>
                      </td>

                      {/* Reputation */}
                      <td>
                        <div className="flex items-center gap-2">
                          <Star size={11} className={repColor} />
                          <span className={cn('font-mono font-bold text-sm', repColor)}>
                            {entry.reputation}
                          </span>
                          <div className="flex-1 max-w-[60px]">
                            <div className="progress-track">
                              <div
                                className="progress-fill"
                                style={{ width: `${entry.reputation}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
