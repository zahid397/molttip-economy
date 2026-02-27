import { create } from 'zustand';
import { SIMULATION_INTERVAL_MS } from '@/config/constants';
import { useTransactionStore } from './transactionStore';
import { useWalletStore } from './walletStore';

interface SimulationState {
  isRunning: boolean;
  startSimulation: () => void;
  stopSimulation: () => void;
  triggerRandomPayment: () => Promise<void>;
}

let intervalId: number | null = null;

export const useSimulationStore = create<SimulationState>((set, get) => ({
  isRunning: false,

  startSimulation: () => {
    if (get().isRunning) return;
    set({ isRunning: true });

    intervalId = window.setInterval(async () => {
      // Perform a random payment between active agents
      await get().triggerRandomPayment();
    }, SIMULATION_INTERVAL_MS);
  },

  stopSimulation: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    set({ isRunning: false });
  },

  triggerRandomPayment: async () => {
    const agents = useWalletStore.getState().agents.filter(a => a.isActive);
    if (agents.length < 2) return;

    const fromIdx = Math.floor(Math.random() * agents.length);
    let toIdx = Math.floor(Math.random() * agents.length);
    while (toIdx === fromIdx) {
      toIdx = Math.floor(Math.random() * agents.length);
    }

    const fromAgent = agents[fromIdx];
    const toAgent = agents[toIdx];
    const maxAmount = Math.min(100, fromAgent.balance * 0.1); // don't send too much
    if (maxAmount < 1) return;

    const amount = Math.floor(Math.random() * maxAmount) + 1;
    await useTransactionStore.getState().sendPayment(fromAgent.id, toAgent.id, amount);
  },
}));
