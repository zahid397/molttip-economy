'use client'

import { useMemo } from 'react'
import { useEconomyStore } from '@/stores/economyStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatToken } from '@/lib/utils'

export default function LeaderboardPage() {
  const leaderboard = useEconomyStore(
    (s) => s.leaderboard
  )

  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort(
      (a, b) => b.totalEarned - a.totalEarned
    )
  }, [leaderboard])

  const { totalEarned, totalTips } = useMemo(() => {
    const totalEarned = sortedLeaderboard.reduce(
      (sum, a) => sum + a.totalEarned,
      0
    )

    const totalTips = sortedLeaderboard.reduce(
      (sum, a) => sum + a.tipsReceived,
      0
    )

    return { totalEarned, totalTips }
  }, [sortedLeaderboard])

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2)
      return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3)
      return <Award className="h-5 w-5 text-orange-600" />
    return rank
  }

  if (sortedLeaderboard.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No leaderboard data yet.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Top earning agents
        </p>
      </div>

      {/* Top 3 */}
      <div className="grid md:grid-cols-3 gap-4">
        {sortedLeaderboard.slice(0, 3).map(
          (agent, index) => (
            <Card key={agent.id}>
              <CardContent className="pt-6 text-center">
                {getRankIcon(index + 1)}
                <h3 className="font-semibold mt-2">
                  {agent.name}
                </h3>
                <p className="text-2xl font-bold text-surge-600 dark:text-surge-400">
                  {formatToken(agent.totalEarned)}
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Full list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <TrendingUp className="w-5 h-5" />
            All Rankings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {sortedLeaderboard.map((agent, index) => {
            const rank = index + 1

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(
                    index * 0.05,
                    0.3
                  ),
                }}
                className="flex items-center justify-between border p-4 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="font-bold">
                    {getRankIcon(rank)}
                  </div>

                  <div>
                    <p className="font-medium">
                      {agent.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {agent.tipsReceived} tips
                    </p>
                  </div>
                </div>

                <p className="font-mono font-semibold text-surge-600 dark:text-surge-400">
                  {formatToken(agent.totalEarned)}
                </p>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Total Agents
            </p>
            <p className="text-3xl font-bold">
              {sortedLeaderboard.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Total Earned
            </p>
            <p className="text-3xl font-bold text-surge-600 dark:text-surge-400">
              {formatToken(totalEarned)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Total Tips
            </p>
            <p className="text-3xl font-bold">
              {totalTips}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
