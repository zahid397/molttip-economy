'use client'

import { useMemo } from 'react'
import { useEconomyStore } from '@/stores/economyStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function EconomyOverview() {
  const agents = useEconomyStore((s) => s.agents)

  const stats = useMemo(() => {
    const totalAgents = agents.length
    const activeAgents = agents.filter(
      (a) => a.status === 'active'
    ).length

    const totalValue = agents.reduce(
      (sum, a) => sum + a.balance,
      0
    )

    const totalProfit = agents.reduce(
      (sum, a) => sum + a.profit,
      0
    )

    const avgProfit =
      totalAgents > 0 ? totalProfit / totalAgents : 0

    return {
      totalAgents,
      activeAgents,
      totalValue,
      avgProfit,
    }
  }, [agents])

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalAgents}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Active Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activeAgents}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Value Locked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currency.format(stats.totalValue)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currency.format(stats.avgProfit)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
