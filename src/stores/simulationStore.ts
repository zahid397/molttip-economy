import { create } from 'zustand';
import { useWalletStore }      from '@/stores/walletStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useEconomyStore }     from '@/stores/economyStore';
import { SIMULATION_TICK_MS, MAX_TRANSFER_PERCENT } from '@/config/constants';

interface SimulationState {
  isRunning:       boolean;
  tickCount:       number;
  intervalId:      ReturnType<typeof setInterval> | null;
  startSimulation: () => void;
  stopSimulation:  () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isRunning:  false,
  tickCount:  0,
  intervalId: null,

  startSimulation: () => {
    if (get().isRunning) return;

    const intervalId = setInterval(async () => {
      const agents = useWalletStore.getState().agents.filter(a => a.isActive);
      if (agents.length < 2) return;

      const fromIdx = Math.floor(Math.random() * agents.length);
      let   toIdx   = Math.floor(Math.random() * agents.length);
      while (toIdx === fromIdx) {
        toIdx = Math.floor(Math.random() * agents.length);
      }

      const from = agents[fromIdx];
      const to   = agents[toIdx];

      if (!from || !to) return;

      const available = from.balance - from.stakedAmount;
      if (available <= 0) return;

      const maxAmt = Math.floor(available * (MAX_TRANSFER_PERCENT / 100));
      if (maxAmt < 1) return;

      const amount = Math.max(1, Math.floor(Math.random() * maxAmt));

      try {
        await useTransactionStore.getState().recordTransaction({
          fromAgentId: from.id,
          toAgentId:   to.id,
          amount,
          type: 'trade',
        });
        useEconomyStore.getState().updateStats();
      } catch {
        // swallow simulation errors
      }

      set(s => ({ tickCount: s.tickCount + 1 }));
    }, SIMULATION_TICK_MS);

    set({ isRunning: true, intervalId });
  },

  stopSimulation: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isRunning: false, intervalId: null });
  },
}));
