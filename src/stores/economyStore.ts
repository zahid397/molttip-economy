import { create } from 'zustand';
import { EconomyStats } from '@/types';
import { useWalletStore }      from '@/stores/walletStore';
import { useTransactionStore } from '@/stores/transactionStore';

interface EconomyState {
  stats:       EconomyStats | null;
  updateStats: () => void;
}

export const useEconomyStore = create<EconomyState>((set) => ({
  stats: null,

  updateStats: () => {
    const agents       = useWalletStore.getState().agents;
    const transactions = useTransactionStore.getState().transactions;

    const totalStaked   = agents.reduce((s, a) => s + a.stakedAmount, 0);
    const totalBalance  = agents.reduce((s, a) => s + a.balance, 0);
    const activeAgents  = agents.filter(a => a.isActive).length;
    const avgRep        = agents.length
      ? agents.reduce((s, a) => s + a.reputation, 0) / agents.length
      : 0;

    const oneDayAgo     = Date.now() - 86_400_000;
    const volumeLast24h = transactions
      .filter(t => t.timestamp >= oneDayAgo && t.status === 'confirmed')
      .reduce((s, t) => s + t.amount, 0);

    set({
      stats: {
        totalSupply:       1_000_000,
        circulatingSupply: totalBalance,
        totalStaked,
        totalTransactions: transactions.length,
        activeAgents,
        totalAgents:       agents.length,
        volumeLast24h,
        avgReputation:     Math.round(avgRep),
      },
    });
  },
}));
