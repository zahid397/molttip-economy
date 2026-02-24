'use client'

import { Button } from '@/components/ui/button'
import { useSimulationStore } from '@/stores/simulationStore'
import { Play, Pause, Zap } from 'lucide-react'

export function DemoBanner() {
  const isRunning = useSimulationStore((s) => s.isRunning)
  const toggle = useSimulationStore((s) => s.toggle)
  const speed = useSimulationStore((s) => s.speed)
  const setSpeed = useSimulationStore((s) => s.setSpeed)

  return (
    <div className="bg-primary/10 py-2 text-sm">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-medium">Demo Mode</span>
          <span className="text-muted-foreground">
            – prices update live
          </span>
          {isRunning && (
            <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-green-500" />
          )}
        </div>

        <div className="flex items-center gap-4">
          <label htmlFor="sim-speed" className="sr-only">
            Simulation speed
          </label>

          <select
            id="sim-speed"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="rounded border bg-background px-2 py-1 text-xs"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={toggle}
            className="gap-2"
          >
            {isRunning ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            {isRunning ? 'Pause' : 'Start'} Simulation
          </Button>
        </div>
      </div>
    </div>
  )
}
