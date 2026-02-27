import { create } from 'zustand';
import { SIMULATION_CONFIG } from '@/config/constants';
import { useTransactionStore } from './transactionStore';
import { useEconomyStore } from './economyStore';

interface SimulationState {
  isRunning: boolean;
  intervalId: number | null;
  startSimulation: () => void;
  stopSimulation: () => void;
  triggerRandomPayment: () => Promise<void>;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isRunning: false,
  intervalId: null,

  startSimulation: () => {
    if (get().isRunning) return;

    const id = window.setInterval(() => {
      // fire but don't stack
      get().triggerRandomPayment();
    }, SIMULATION_CONFIG.INTERVAL_MS);

    set({ isRunning: true, intervalId: id });
  },

  stopSimulation: () => {
    const id = get().intervalId;
    if (id) clearInterval(id);

    set({ isRunning: false, intervalId: null });
  },

  triggerRandomPayment: async () => {
    const agents = useEconomyStore
      .getState()
      .agents.filter((a) => a.isActive);

    if (agents.length < 2) return;

    const from = agents[Math.floor(Math.random() * agents.length)];
    let to = agents[Math.floor(Math.random() * agents.length)];

    while (to.id === from.id) {
      to = agents[Math.floor(Math.random() * agents.length)];
    }

    const maxAmount = Math.min(100, from.balance * 0.1);
    if (maxAmount < 1) return;

    const amount = Math.floor(Math.random() * maxAmount) + 1;

    // call transaction store
    await useTransactionStore
      .getState()
      .sendPayment(from.id, to.id, amount);
  },
}));
