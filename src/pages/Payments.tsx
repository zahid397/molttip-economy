import { useEffect, useState } from 'react';
import {
  CreditCard, ArrowRight, Search, X,
  CheckCircle2, Clock, XCircle, Filter, Activity,
} from 'lucide-react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useWalletStore }      from '@/stores/walletStore';
import { TransactionType, TransactionStatus } from '@/types';
import { cn, formatNumber, formatDate }       from '@/lib/utils';

const TYPE_FILTERS: { label: string; value: TransactionType | 'all' }[] = [
  { label: 'All',     value: 'all'     },
  { label: 'Payment', value: 'payment' },
  { label: 'Trade',   value: 'trade'   },
  { label: 'Reward',  value: 'reward'  },
  { label: 'Stake',   value: 'stake'   },
  { label: 'Unstake', value: 'unstake' },
];

const STATUS_ICON: Record<TransactionStatus, { icon: React.ElementType; color: string }> = {
  confirmed: { icon: CheckCircle2, color: 'text-accent-green'  },
  pending:   { icon: Clock,        color: 'text-accent-yellow' },
  failed:    { icon: XCircle,      color: 'text-accent-red'    },
};

const TYPE_BADGE: Record<TransactionType, string> = {
  payment: 'badge-cyan',
  trade:   'badge-purple',
  reward:  'badge-green',
  stake:   'badge-yellow',
  unstake: 'badge-orange',
};

export const Payments: React.FC = () => {
  const { transactions }        = useTransactionStore();
  const { agents, fetchAgents } = useWalletStore();

  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const getAgent = (id: string) => agents.find(a => a.id === id);

  const filtered = transactions.filter(tx => {
    const from = getAgent(tx.fromAgentId)?.name ?? tx.fromAgentId;
    const to   = getAgent(tx.toAgentId)?.name   ?? tx.toAgentId;
    const matchSearch = !search
      || from.toLowerCase().includes(search.toLowerCase())
      || to.toLowerCase().includes(search.toLowerCase())
      || tx.id.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || tx.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalVolume = transactions.reduce((s, t) => s + t.amount, 0);
  const confirmed   = transactions.filter(t => t.status === 'confirmed').length;
  const pending     = transactions.filter(t => t.status === 'pending').length;
  const failed      = transactions.filter(t => t.status === 'failed').length;

  return (
    <div className="space-y-6 page-enter">

      <div>
        <h1 className="font-display font-bold text-3xl text-primary flex items-center gap-3">
          <CreditCard size={24} className="text-accent-cyan" />
          Payments
        </h1>
        <p className="text-sm text-text-secondary mt-1 font-mono">
          Full transaction history across all agents
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Volume', value: formatNumber(totalVolume), suffix: 'MOTIP', color: 'text-accent-cyan',   icon: Activity     },
          { label: 'Confirmed',    value: confirmed,                 suffix: 'txs',   color: 'text-accent-green',  icon: CheckCircle2 },
          { label: 'Pending',      value: pending,                   suffix: 'txs',   color: 'text-accent-yellow', icon: Clock        },
          { label: 'Failed',       value: failed,                    suffix: 'txs',   color: 'text-accent-red',    icon: XCircle      },
        ].map(({ label, value, suffix, color, icon: Icon }) => (
          <div key={label} className="bg-bg-elevated border border-default rounded-lg px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-2xs font-mono text-text-muted uppercase tracking-wider">{label}</p>
              <Icon size={12} className={color} />
            </div>
            <p className={`font-mono text-xl font-bold leading-none ${color}`}>{value}</p>
            <p className="text-2xs font-mono text-text-muted mt-1">{suffix}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            placeholder="Search agent or TX ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 font-mono text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={12} className="text-text-muted shrink-0" />
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                'btn btn-sm font-mono text-xs px-3',
                typeFilter === f.value ? 'btn-primary' : 'btn-secondary'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3
          border-b border-default bg-bg-elevated">
          <h2 className="font-display font-bold text-sm text-primary">
            Transaction History
          </h2>
          <span className="font-mono text-2xs text-text-muted">
            {filtered.length} of {transactions.length} records
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard size={32} className="text-text-muted mx-auto mb-3" />
            <p className="font-mono text-sm text-text-muted">
              {transactions.length === 0
                ? 'No transactions yet. Launch simulation to begin.'
                : 'No results match your filters.'
              }
            </p>
            {(search || typeFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setTypeFilter('all'); }}
                className="btn btn-ghost btn-sm mt-3 font-mono text-xs"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>From</th>
                  <th></th>
                  <th>To</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => {
                  const from       = getAgent(tx.fromAgentId);
                  const to         = getAgent(tx.toAgentId);
                  const statusCfg  = STATUS_ICON[tx.status];
                  const StatusIcon = statusCfg.icon;

                  return (
                    <tr key={tx.id}>
                      <td><StatusIcon size={13} className={statusCfg.color} /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-bg-overlay border border-default
                            flex items-center justify-center font-display text-xs
                            font-bold text-accent-cyan shrink-0">
                            {(from?.name ?? '?')[0]}
                          </div>
                          <span className="font-medium text-primary truncate max-w-[100px]">
                            {from?.name ?? tx.fromAgentId}
                          </span>
                        </div>
                      </td>
                      <td className="px-1">
                        <ArrowRight size={12} className="text-text-muted" />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-bg-overlay border border-default
                            flex items-center justify-center font-display text-xs
                            font-bold text-accent-purple shrink-0">
                            {(to?.name ?? '?')[0]}
                          </div>
                          <span className="font-medium text-primary truncate max-w-[100px]">
                            {to?.name ?? tx.toAgentId}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={cn('badge text-2xs', TYPE_BADGE[tx.type])}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="font-mono font-bold text-accent-cyan">
                          {formatNumber(tx.amount)}
                        </span>
                        <span className="text-2xs text-text-muted ml-1">MOTIP</span>
                      </td>
                      <td className="text-right">
                        <span className="font-mono text-xs text-text-secondary">
                          {formatDate(tx.timestamp)}
                        </span>
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
