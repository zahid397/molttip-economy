import { useEffect } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';

export function useSimulation(autoStart = false) {
  const { startSimulation, stopSimulation, isRunning } = useSimulationStore();

  useEffect(() => {
    if (autoStart && !isRunning) {
      startSimulation();
    }
    return () => {
      if (autoStart) stopSimulation();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  return { isRunning, startSimulation, stopSimulation };
}
