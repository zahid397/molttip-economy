'use client'

import { useMemo } from 'react'
import { useEconomyStore } from '@/stores/economyStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

const BASE_PRICE = 1.0 // reference baseline

export function MotiPStats() {
  const motipPrice = useEconomyStore((s) => s.motipPrice)

  const change = useMemo(() => {
    const percent = ((motipPrice - BASE_PRICE) / BASE_PRICE) * 100
    return percent
  }, [motipPrice])

  const isPositive = change >= 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          MOTIP Price
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          ${motipPrice.toFixed(4)}
        </div>

        <p
          className={`flex items-center text-xs ${
            isPositive ? 'text-primary' : 'text-destructive'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="mr-1 h-3 w-3" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3" />
          )}
          {change.toFixed(2)}% (24h)
        </p>
      </CardContent>
    </Card>
  )
}
