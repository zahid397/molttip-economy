'use client'

import { useEffect, useRef } from 'react'
import { useEconomyStore } from '@/stores/economyStore'
import { useSimulationStore } from '@/stores/simulationStore'

export const useSimulation = () => {
  const { isRunning, speed } = useSimulationStore()
  const updatePrice = useEconomyStore((state) => state.updatePrice)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (isRunning) {
      intervalRef.current = setInterval(() => {
        updatePrice()
      }, 1000 / speed)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, speed, updatePrice])
}
