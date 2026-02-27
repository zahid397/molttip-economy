React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Activity, TrendingUp,
  Zap, RefreshCw,
} from 'lucide-react';
import { MotiPStats }    from '@/components/economy/MotiPStats';
import { TokenBalance }  from '@/components/economy/TokenBalance';
import { AgentCard }     from '@/components/economy/AgentCard';
import { LaunchButton }  from '@/components/economy/LaunchButton';
import { useWalletStore }  from '@/stores/walletStore';
import { useEconomyStore } from '@/stores/economyStore';
import { useSimulation }   from '@/hooks/useSimulation';
import { useTransactionStore } from '@/stores/transactionStore';
import { formatNumber }  from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { agents, fetchAgents, isLoading }       = useWalletStore();
  const { stats, updateStats }                   = useEconomyStore();
  const { transactions }                         = useTransactionStore();

  useSimulation(false); // manual start via LaunchButton

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  useEffect(() => {
    if (agents.length) updateStats();
  }, [agents, updateStats]);

  const topAgents  = [...agents]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 3);

  const primaryAgent   = agents[0] ?? null;
  const recentTxs      = transactions.slice(0, 5);
  const totalVolume    = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 page-enter">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-primary">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-mono">
            MotiP Economy — AI Agent Token Network
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAgents()}
            disabled={isLoading}
            className="btn btn-ghost btn-sm gap-2"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <LaunchButton />
        </div>
      </div>

      {/* ── Economy stats ── */}
      <MotiPStats />

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Wallet panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-primary flex items-center gap-2">
              <Zap size={15} className="text-accent-yellow" />
              Primary Wallet
            </h2>
            {primaryAgent && (
              <span className="badge badge-cyan text-2xs">{primaryAgent.name}</span>
            )}
          </div>

          {isLoading ? (
            <div className="skeleton h-36 rounded-lg" />
          ) : primaryAgent ? (
            <TokenBalance
              balance={primaryAgent.balance}
              stakedAmount={primaryAgent.stakedAmount}
              label={`${primaryAgent.name}'s Balance`}
              size="lg"
              showStaked
            />
          ) : (
            <div className="card text-center py-8 text-text-muted font-mono text-sm">
              No agents loaded
            </div>
          )}

          {/* Recent transactions mini list */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-primary flex items-center gap-2">
                <Activity size={13} className="text-accent-cyan" />
                Recent Transactions
              </h3>
              <span className="font-mono text-2xs text-text-muted">
                Vol: {formatNumber(totalVolume)} MOTIP
              </span>
            </div>

            {recentTxs.length === 0 ? (
              <p className="text-xs font-mono text-text-muted text-center py-4">
                No transactions yet. Launch simulation to begin.
              </p>
            ) : (
              <div className="space-y-2">
                {recentTxs.map(tx => {
                  const from = agents.find(a => a.id === tx.fromAgentId);
                  const to   = agents.find(a => a.id === tx.toAgentId);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between
                        px-3 py-2 rounded-md bg-bg-elevated border border-default
                        text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 text-text-secondary">
                        <span className="text-primary truncate max-w-[80px]">
                          {from?.name ?? tx.fromAgentId}
                        </span>
                        <ArrowRight size={10} className="text-text-muted shrink-0" />
                        <span className="text-primary truncate max-w-[80px]">
                          {to?.name ?? tx.toAgentId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-accent-cyan font-bold">
                          {formatNumber(tx.amount)}
                        </span>
                        <span className={`badge text-2xs ${
                          tx.status === 'confirmed' ? 'badge-green' :
                          tx.status === 'pending'   ? 'badge-yellow' :
                                                      'badge-red'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => navigate('/payments')}
              className="btn btn-ghost btn-sm w-full mt-3 gap-1 font-mono text-xs"
            >
              View all payments <ArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* Top agents panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-primary flex items-center gap-2">
              <TrendingUp size={15} className="text-accent-green" />
              Top Agents
            </h2>
            <span className="font-mono text-2xs text-text-muted">
              by balance
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-28 rounded-lg" />
              ))}
            </div>
          ) : topAgents.length === 0 ? (
            <div className="card text-center py-8 text-text-muted font-mono text-sm">
              No agents loaded
            </div>
          ) : (
            <div className="space-y-3">
              {topAgents.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onSelect={() => navigate('/agents')}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => navigate('/agents')}
            className="btn btn-secondary w-full gap-2 font-mono text-xs"
          >
            View all agents <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
