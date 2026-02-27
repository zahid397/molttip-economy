import { useEffect } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';

export function useSimulation(autoStart = true) {
  const {
    startSimulation,
    stopSimulation,
    isRunning,
  } = useSimulationStore();

  useEffect(() => {
    if (autoStart && !isRunning) {
      startSimulation();
    }
  }, [autoStart, isRunning, startSimulation]);

  return {
    isRunning,
    start: startSimulation,
    stop: stopSimulation,
  };
}
