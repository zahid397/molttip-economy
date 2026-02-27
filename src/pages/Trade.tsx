import React, { useEffect, useState } from 'react';
import {
  ArrowLeftRight, ArrowRight, ChevronDown,
  Zap, AlertCircle, Loader2, TrendingUp,
  CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import { useWalletStore }      from '@/stores/walletStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { Agent }               from '@/types';
import { cn, formatNumber }    from '@/lib/utils';

type SortKey = 'balance' | 'reputation' | 'name';

export const Trade: React.FC = () => {
  const { agents, fetchAgents }         = useWalletStore();
  const { recordTransaction, transactions } = useTransactionStore();

  const [fromId,    setFromId]    = useState('');
  const [toId,      setToId]      = useState('');
  const [amount,    setAmount]    = useState('');
  const [error,     setError]     = useState('');
  const [isPending, setIsPending] = useState(false);
  const [lastTxId,  setLastTxId]  = useState<string | null>(null);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const fromAgent   = agents.find(a => a.id === fromId);
  const toAgent     = agents.find(a => a.id === toId);
  const fromOptions = agents.filter(a => a.isActive);
  const toOptions   = agents.filter(a => a.isActive && a.id !== fromId);
  const available   = (fromAgent?.balance ?? 0) - (fromAgent?.stakedAmount ?? 0);
  const numAmount   = Number(amount);
  const pct         = available > 0 ? (numAmount / available) * 100 : 0;

  // Last 6 trade transactions
  const recentTrades = transactions
    .filter(t => t.type === 'trade' || t.type === 'payment')
    .slice(0, 6);

  const validate = (): string => {
    if (!fromId)                              return 'Select a sender agent.';
    if (!toId)                                return 'Select a recipient agent.';
    if (fromId === toId)                      return 'Sender and recipient must differ.';
    if (!amount || isNaN(numAmount) || numAmount <= 0) return 'Enter a valid amount.';
    if (numAmount > available)                return `Insufficient balance. Available: ${formatNumber(available)} MOTIP`;
    return '';
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setIsPending(true);

    try {
      const tx = await recordTransaction({
        fromAgentId: fromId,
        toAgentId:   toId,
        amount:      numAmount,
        type:        'trade',
      });
      setLastTxId(tx.id);
      setAmount('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  const swapAgents = () => {
    if (!toId) return;
    const tmp = fromId;
    setFromId(toId);
    setToId(tmp);
    setAmount('');
    setError('');
  };

  return (
    <div className="space-y-6 page-enter">

      {/* ── Header ── */}
      <div>
        <h1 className="font-display font-bold text-3xl text-primary flex items-center gap-3">
          <ArrowLeftRight size={24} className="text-accent-cyan" />
          Trade
        </h1>
        <p className="text-sm text-text-secondary mt-1 font-mono">
          Transfer MOTIP tokens between agents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Trade form ── */}
        <div className="lg:col-span-3">
          <form onSubmit={handleTrade} className="card space-y-5">

            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-accent-yellow" />
              <h2 className="font-display font-bold text-lg text-primary">
                Execute Trade
              </h2>
            </div>

            {/* From / Swap / To row */}
            <div className="space-y-3">

              {/* From */}
              <div>
                <label className="text-xs font-mono text-text-secondary
                  uppercase tracking-wider block mb-2">
                  From Agent
                </label>
                <div className="relative">
                  <select
                    value={fromId}
                    onChange={e => {
                      setFromId(e.target.value);
                      setToId('');
                      setError('');
                      setLastTxId(null);
                    }}
                    required
                    className={cn('appearance-none pr-9', !fromId && 'text-text-muted')}
                  >
                    <option value="">Select sender…</option>
                    {fromOptions.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {formatNumber(a.balance)} MOTIP
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2
                    -translate-y-1/2 text-text-secondary pointer-events-none" />
                </div>
                {fromAgent && (
                  <p className="text-2xs font-mono text-text-muted mt-1.5">
                    Available:
                    <span className="text-accent-cyan ml-1 font-bold">
                      {formatNumber(available)} MOTIP
                    </span>
                  </p>
                )}
              </div>

              {/* Swap button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={swapAgents}
                  disabled={!toId}
                  className={cn(
                    'btn btn-ghost btn-sm p-2 border border-default rounded-full',
                    'hover:border-accent-cyan hover:text-accent-cyan transition-all',
                    !toId && 'opacity-30'
                  )}
                  title="Swap agents"
                >
                  <ArrowLeftRight size={14} />
                </button>
              </div>

              {/* To */}
              <div>
                <label className="text-xs font-mono text-text-secondary
                  uppercase tracking-wider block mb-2">
                  To Agent
                </label>
                <div className="relative">
                  <select
                    value={toId}
                    onChange={e => { setToId(e.target.value); setError(''); }}
                    required
                    disabled={!fromId}
                    className={cn('appearance-none pr-9', !toId && 'text-text-muted')}
                  >
                    <option value="">Select recipient…</option>
                    {toOptions.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {formatNumber(a.balance)} MOTIP
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2
                    -translate-y-1/2 text-text-secondary pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Preview strip */}
            {fromAgent && toAgent && (
              <div className="flex items-center justify-between
                px-4 py-3 rounded-lg bg-bg-elevated border border-default text-xs font-mono">
                <span className="font-bold text-primary">{fromAgent.name}</span>
                <ArrowRight size={12} className="text-accent-cyan" />
                <span className="font-bold text-primary">{toAgent.name}</span>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="text-xs font-mono text-text-secondary
                uppercase tracking-wider block mb-2">
                Amount <span className="text-accent-cyan">(MOTIP)</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(''); setLastTxId(null); }}
                className="font-mono text-lg font-bold"
                required
              />

              {/* Quick % */}
              <div className="flex gap-2 mt-2">
                {[25, 50, 75, 100].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(String(Math.floor(available * p / 100)))}
                    disabled={!fromAgent}
                    className="btn btn-ghost btn-sm text-2xs font-mono px-2 py-1
                      border border-default hover:border-accent-cyan disabled:opacity-30"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            {/* Amount bar */}
            {numAmount > 0 && (
              <div>
                <div className="progress-track">
                  <div
                    className={cn(
                      'progress-fill transition-all duration-300',
                      pct > 100 && 'bg-accent-red'
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="text-2xs font-mono text-text-muted mt-1">
                  {pct.toFixed(1)}% of available balance
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg
                bg-accent-red/5 border border-accent-red/20 text-accent-red text-xs font-mono">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Success */}
            {lastTxId && !error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg
                bg-accent-green/5 border border-accent-green/20 text-accent-green text-xs font-mono">
                <CheckCircle2 size={13} className="shrink-0" />
                Trade confirmed — TX: {lastTxId}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary btn-lg w-full gap-2 font-mono"
            >
              {isPending
                ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
                : <><Zap size={15} fill="currentColor" /> Execute Trade
                    {numAmount > 0 && ` · ${formatNumber(numAmount)} MOTIP`}
                  </>
              }
            </button>
          </form>
        </div>

        {/* ── Recent trades ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-accent-green" />
            <h2 className="font-display font-bold text-lg text-primary">
              Recent Trades
            </h2>
          </div>

          <div className="card space-y-2">
            {recentTrades.length === 0 ? (
              <p className="text-xs font-mono text-text-muted text-center py-8">
                No trades yet. Execute one above.
              </p>
            ) : (
              recentTrades.map(tx => {
                const from = agents.find(a => a.id === tx.fromAgentId);
                const to   = agents.find(a => a.id === tx.toAgentId);
                const StatusIcon =
                  tx.status === 'confirmed' ? CheckCircle2 :
                  tx.status === 'pending'   ? Clock        : XCircle;
                const statusColor =
                  tx.status === 'confirmed' ? 'text-accent-green' :
                  tx.status === 'pending'   ? 'text-accent-yellow' :
                                              'text-accent-red';
                return (
                  <div key={tx.id}
                    className="flex items-center justify-between px-3 py-2.5
                      bg-bg-elevated border border-default rounded-lg">
                    <div className="flex items-center gap-2 text-xs font-mono min-w-0">
                      <StatusIcon size={11} className={cn('shrink-0', statusColor)} />
                      <span className="text-primary truncate max-w-[70px]">
                        {from?.name ?? '?'}
                      </span>
                      <ArrowRight size={9} className="text-text-muted shrink-0" />
                      <span className="text-primary truncate max-w-[70px]">
                        {to?.name ?? '?'}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-accent-cyan shrink-0 ml-2">
                      {formatNumber(tx.amount)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
