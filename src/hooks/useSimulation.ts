import { useEffect } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';

export function useSimulation(autoStart = true) {
  const { startSimulation, stopSimulation, isRunning } = useSimulationStore();

  useEffect(() => {
    if (autoStart) {
      startSimulation();
    }
    return () => {
      stopSimulation();
    };
  }, [autoStart, startSimulation, stopSimulation]);

  return { isRunning };
}
