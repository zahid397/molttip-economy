import React, { useState } from 'react';
import { Send, X, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { useTransactionStore } from '@/stores/transactionStore';
import { useWalletStore }      from '@/stores/walletStore';
import { cn, formatNumber }    from '@/lib/utils';

interface PaymentButtonProps {
  fromAgentId: string;
  toAgentId?:  string;
  className?:  string;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  fromAgentId,
  toAgentId,
  className,
}) => {
  const [isOpen,     setIsOpen]     = useState(false);
  const [amount,     setAmount]     = useState('');
  const [selectedTo, setSelectedTo] = useState(toAgentId ?? '');
  const [error,      setError]      = useState('');
  const [isPending,  setIsPending]  = useState(false);

  const { recordTransaction } = useTransactionStore();
  const { agents }            = useWalletStore();

  const fromAgent = agents.find(a => a.id === fromAgentId);
  const toAgent   = agents.find(a => a.id === selectedTo);
  const toOptions = agents.filter(a => a.id !== fromAgentId && a.isActive);
  const available = (fromAgent?.balance ?? 0) - (fromAgent?.stakedAmount ?? 0);
  const numAmount = Number(amount);

  const validate = (): string => {
    if (!selectedTo)                             return 'Select a recipient agent.';
    if (!amount)                                 return 'Enter an amount.';
    if (isNaN(numAmount) || numAmount <= 0)      return 'Amount must be a positive number.';
    if (numAmount > available)                   return `Insufficient balance. Available: ${formatNumber(available)} MOTIP`;
    return '';
  };

  const handleClose = () => {
    setIsOpen(false);
    setAmount('');
    setError('');
    if (!toAgentId) setSelectedTo('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setIsPending(true);

    try {
      await recordTransaction({
        fromAgentId,
        toAgentId: selectedTo,
        amount:    numAmount,
        type:      'payment',
      });
      handleClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsPending(false);
    }
  };

  const pct = available > 0 ? (numAmount / available) * 100 : 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={!fromAgent?.isActive}
        className={cn('btn btn-primary gap-2', className)}
      >
        <Send size={13} />
        Send Payment
      </button>

      {isOpen && (
        <div className="modal-backdrop" onClick={handleClose}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Send size={15} className="text-accent-cyan" />
                <h3 className="font-display font-bold text-lg text-primary">
                  Send MOTIP
                </h3>
              </div>
              <button onClick={handleClose} className="btn btn-ghost btn-sm p-1.5">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-5">

                {/* From */}
                <div className="flex items-center justify-between
                  px-3 py-2.5 rounded-lg bg-bg-elevated border border-default">
                  <div>
                    <p className="text-2xs font-mono text-text-muted uppercase tracking-wider mb-0.5">
                      From
                    </p>
                    <p className="font-display font-bold text-sm text-primary">
                      {fromAgent?.name ?? fromAgentId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xs font-mono text-text-muted mb-0.5">Available</p>
                    <p className="font-mono text-sm font-bold text-accent-cyan">
                      {formatNumber(available)}
                      <span className="text-2xs text-text-secondary ml-1">MOTIP</span>
                    </p>
                  </div>
                </div>

                {/* To */}
                {toAgentId ? (
                  <div className="flex items-center justify-between
                    px-3 py-2.5 rounded-lg bg-bg-elevated border border-default">
                    <div>
                      <p className="text-2xs font-mono text-text-muted uppercase tracking-wider mb-0.5">To</p>
                      <p className="font-display font-bold text-sm text-primary">
                        {toAgent?.name ?? toAgentId}
                      </p>
                    </div>
                    <span className="badge badge-green text-2xs">Fixed</span>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-mono text-text-secondary
                      uppercase tracking-wider block mb-2">
                      Recipient Agent
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTo}
                        onChange={e => { setSelectedTo(e.target.value); setError(''); }}
                        required
                        className={cn('appearance-none pr-9', !selectedTo && 'text-text-muted')}
                      >
                        <option value="">Select recipient…</option>
                        {toOptions.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} — {formatNumber(agent.balance)} MOTIP
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2
                        -translate-y-1/2 text-text-secondary pointer-events-none" />
                    </div>
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
                    onChange={e => { setAmount(e.target.value); setError(''); }}
                    className="font-mono text-lg font-bold"
                    required
                  />
                  <div className="flex items-center gap-2 mt-2">
                    {[25, 50, 75, 100].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(String(Math.floor(available * p / 100)))}
                        className="btn btn-ghost btn-sm text-2xs font-mono px-2 py-1
                          border border-default hover:border-accent-cyan"
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                {numAmount > 0 && (
                  <div>
                    <div className="progress-track">
                      <div
                        className={cn('progress-fill', pct > 100 && 'bg-accent-red')}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p className="text-2xs font-mono text-text-muted mt-1">
                      {pct.toFixed(1)}% of available balance
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg
                    bg-accent-red/5 border border-accent-red/20 text-accent-red text-xs font-mono">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn btn-primary gap-2">
                  {isPending
                    ? <><Loader2 size={13} className="animate-spin" /> Sending…</>
                    : <><Send size={13} /> Send {amount ? formatNumber(numAmount) : ''} MOTIP</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
