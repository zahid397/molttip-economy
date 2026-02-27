import React, { useEffect, useState } from 'react';
import {
  Search, X, Bot, SlidersHorizontal,
  ArrowUpDown, Send, Lock, TrendingUp, Activity,
} from 'lucide-react';
import { AgentCard }    from '@/components/economy/AgentCard';
import { TokenBalance } from '@/components/economy/TokenBalance';
import { PaymentButton } from '@/components/economy/PaymentButton';
import { useWalletStore } from '@/stores/walletStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { Agent, AgentStatus } from '@/types';
import { cn, formatNumber } from '@/lib/utils';

type SortKey = 'balance' | 'reputation' | 'name' | 'staked';
type SortDir = 'asc' | 'desc';

const STATUS_FILTERS: { label: string; value: AgentStatus | 'all' }[] = [
  { label: 'All',     value: 'all'     },
  { label: 'Active',  value: 'active'  },
  { label: 'Idle',    value: 'idle'    },
  { label: 'Offline', value: 'offline' },
];

export const Agents: React.FC = () => {
  const { agents, fetchAgents, isLoading } = useWalletStore();
  const { getByAgent }                     = useTransactionStore();

  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState<AgentStatus | 'all'>('all');
  const [sortKey,        setSortKey]        = useState<SortKey>('balance');
  const [sortDir,        setSortDir]        = useState<SortDir>('desc');
  const [selectedAgent,  setSelectedAgent]  = useState<Agent | null>(null);
  const [showFilters,    setShowFilters]    = useState(false);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = agents
    .filter(a => {
      const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
        || a.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name')       return mul * a.name.localeCompare(b.name);
      if (sortKey === 'balance')    return mul * (a.balance - b.balance);
      if (sortKey === 'reputation') return mul * (a.reputation - b.reputation);
      if (sortKey === 'staked')     return mul * (a.stakedAmount - b.stakedAmount);
      return 0;
    });

  const agentTxs = selectedAgent ? getByAgent(selectedAgent.id) : [];

  return (
    <div className="space-y-6 page-enter">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-primary flex items-center gap-3">
            <Bot size={24} className="text-accent-cyan" />
            Agents
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-mono">
            {agents.length} agents registered · {agents.filter(a => a.isActive).length} active
          </p>
        </div>
      </div>

      {/* ── Search + Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            placeholder="Search by name or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 font-mono text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted
                hover:text-text-primary transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'btn btn-sm font-mono text-xs px-3',
                statusFilter === f.value ? 'btn-primary' : 'btn-secondary'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className={cn('btn btn-sm btn-ghost gap-2', showFilters && 'text-accent-cyan')}
        >
          <SlidersHorizontal size={13} />
          Sort
        </button>
      </div>

      {/* ── Sort options ── */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-bg-elevated
          border border-default rounded-lg animate-slideDown">
          <span className="text-2xs font-mono text-text-muted uppercase tracking-wider mr-1">
            Sort by:
          </span>
          {(['balance', 'reputation', 'name', 'staked'] as SortKey[]).map(key => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={cn(
                'btn btn-sm font-mono text-xs gap-1.5',
                sortKey === key ? 'btn-primary' : 'btn-secondary'
              )}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
              {sortKey === key && (
                <ArrowUpDown size={10} className={sortDir === 'asc' ? 'rotate-180' : ''} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Bot size={32} className="text-text-muted mx-auto mb-3" />
          <p className="font-mono text-sm text-text-muted">
            No agents match your search.
          </p>
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); }}
            className="btn btn-ghost btn-sm mt-3 font-mono text-xs"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onSelect={setSelectedAgent}
              selected={selectedAgent?.id === agent.id}
            />
          ))}
        </div>
      )}

      {/* ── Agent Detail Modal ── */}
      {selectedAgent && (
        <div className="modal-backdrop" onClick={() => setSelectedAgent(null)}>
          <div className="modal max-w-lg" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-bg-overlay border border-default
                  flex items-center justify-center font-display font-bold text-accent-cyan">
                  {selectedAgent.name[0]}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-primary leading-none">
                    {selectedAgent.name}
                  </h3>
                  <p className="text-2xs font-mono text-text-muted mt-0.5">
                    {selectedAgent.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="btn btn-ghost btn-sm p-1.5"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body space-y-4">

              {/* Balance */}
              <TokenBalance
                balance={selectedAgent.balance}
                stakedAmount={selectedAgent.stakedAmount}
                size="md"
                showStaked
                label="Token Balance"
              />

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-bg-elevated border border-default rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp size={10} className="text-accent-green" />
                    <p className="text-2xs font-mono text-text-muted uppercase tracking-wider">
                      Reputation
                    </p>
                  </div>
                  <p className="font-mono text-lg font-bold text-accent-green">
                    {selectedAgent.reputation}
                  </p>
                  <p className="text-2xs text-text-muted">/ 100</p>
                </div>

                <div className="bg-bg-elevated border border-default rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <Lock size={10} className="text-accent-purple" />
                    <p className="text-2xs font-mono text-text-muted uppercase tracking-wider">
                      Staked
                    </p>
                  </div>
                  <p className="font-mono text-lg font-bold text-accent-purple">
                    {formatNumber(selectedAgent.stakedAmount)}
                  </p>
                  <p className="text-2xs text-text-muted">MOTIP</p>
                </div>

                <div className="bg-bg-elevated border border-default rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <Activity size={10} className="text-accent-yellow" />
                    <p className="text-2xs font-mono text-text-muted uppercase tracking-wider">
                      Txs
                    </p>
                  </div>
                  <p className="font-mono text-lg font-bold text-accent-yellow">
                    {agentTxs.length}
                  </p>
                  <p className="text-2xs text-text-muted">total</p>
                </div>
              </div>

              {/* Recent txs for agent */}
              {agentTxs.length > 0 && (
                <div>
                  <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">
                    Recent Activity
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-hide">
                    {agentTxs.slice(0, 8).map(tx => {
                      const isOut = tx.fromAgentId === selectedAgent.id;
                      return (
                        <div key={tx.id}
                          className="flex items-center justify-between px-3 py-2
                            bg-bg-elevated border border-default rounded-md text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <Send size={10} className={isOut ? 'text-accent-red' : 'text-accent-green'} />
                            <span className="text-text-secondary">
                              {isOut ? 'Sent' : 'Received'}
                            </span>
                          </div>
                          <span className={cn(
                            'font-bold',
                            isOut ? 'text-accent-red' : 'text-accent-green'
                          )}>
                            {isOut ? '-' : '+'}{formatNumber(tx.amount)} MOTIP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                onClick={() => setSelectedAgent(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <PaymentButton
                fromAgentId={selectedAgent.id}
                className="gap-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
