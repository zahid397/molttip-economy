'use client'

import { useMemo } from 'react'
import { useEconomyStore } from '@/stores/economyStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  formatDate,
  formatToken,
  formatAddress,
} from '@/lib/utils'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PaymentsPage() {
  const transactions = useEconomyStore(
    (s) => s.transactions
  )

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => b.timestamp - a.timestamp
    )
  }, [transactions])

  const { totalAmount, avgAmount } = useMemo(() => {
    if (sortedTransactions.length === 0) {
      return { totalAmount: 0, avgAmount: 0 }
    }

    const confirmed = sortedTransactions.filter(
      (tx) => tx.status === 'confirmed'
    )

    const total = confirmed.reduce(
      (sum, tx) => sum + tx.amount,
      0
    )

    return {
      totalAmount: total,
      avgAmount:
        confirmed.length > 0
          ? total / confirmed.length
          : 0,
    }
  }, [sortedTransactions])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Payments
          </h1>
          <p className="text-muted-foreground">
            View your transaction history
          </p>
        </div>
        <Button className="gap-2">
          <ArrowUpRight className="w-4 h-4" />
          Send Payment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Transaction History
          </CardTitle>
        </CardHeader>

        <CardContent>
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No transactions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTransactions.map(
                (tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(
                        index * 0.05,
                        0.3
                      ),
                    }}
                    className="flex justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {tx.type}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatAddress(tx.from)} →{' '}
                        {formatAddress(tx.to)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.timestamp)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-semibold text-surge-600 dark:text-surge-400">
                        {formatToken(tx.amount)} SURGE
                      </p>

                      <Badge
                        variant={
                          tx.status ===
                          'confirmed'
                            ? 'default'
                            : 'secondary'
                        }
                        className="mt-1"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {sortedTransactions.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Total Confirmed
              </p>
              <p className="text-2xl font-bold text-surge-600 dark:text-surge-400">
                {formatToken(totalAmount)} SURGE
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Total Transactions
              </p>
              <p className="text-2xl font-bold">
                {sortedTransactions.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Average Amount
              </p>
              <p className="text-2xl font-bold text-surge-600 dark:text-surge-400">
                {formatToken(avgAmount)} SURGE
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  )
}
