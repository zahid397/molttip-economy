'use client'

import { useWalletStore } from '@/stores/walletStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Coins, DollarSign } from 'lucide-react'

export function TokenBalance() {
  const balance = useWalletStore((s) => s.balance)

  const motip = balance?.MOTIP ?? 0
  const usd = balance?.USD ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Your Balance
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            <span className="text-sm">MOTIP</span>
          </div>

          <span
            className="font-mono text-lg font-semibold"
            aria-label={`MOTIP balance ${motip}`}
          >
            {motip.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm">USD</span>
          </div>

          <span
            className="font-mono text-lg font-semibold"
            aria-label={`USD balance ${usd}`}
          >
            ${usd.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
