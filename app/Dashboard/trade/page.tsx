'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowDownUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'
import { useEconomyStore } from '@/stores/economyStore'

export default function TradePage() {
  const { toast } = useToast()
  const surgePrice = useEconomyStore((s) => s.motipPrice)

  const [fromToken, setFromToken] = useState<'SURGE' | 'USD'>('USD')
  const [toToken, setToToken] = useState<'SURGE' | 'USD'>('SURGE')
  const [amount, setAmount] = useState('')

  const switchTokens = () => {
    setFromToken((prev) => {
      setToToken(prev)
      return toToken
    })
  }

  const estimatedOutput = useMemo(() => {
    const num = parseFloat(amount) || 0
    if (!num) return '0'

    if (fromToken === 'USD') {
      return (num / surgePrice).toFixed(4)
    }

    return (num * surgePrice).toFixed(2)
  }, [amount, fromToken, surgePrice])

  const handleSwap = () => {
    const num = parseFloat(amount)

    if (fromToken === toToken) {
      toast({
        variant: 'destructive',
        title: 'Cannot swap same token',
      })
      return
    }

    if (isNaN(num) || num <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
      })
      return
    }

    toast({
      title: 'Swap Successful',
      description: `Swapped ${amount} ${fromToken} → ${estimatedOutput} ${toToken}`,
    })

    setAmount('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold mb-2">Trade</h1>
        <p className="text-muted-foreground">
          Swap between SURGE tokens and USD
        </p>
      </div>

      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Swap Tokens</CardTitle>
            <CardDescription>
              Simulated market swap
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>From</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
                <select
                  value={fromToken}
                  onChange={(e) =>
                    setFromToken(
                      e.target.value as 'SURGE' | 'USD'
                    )
                  }
                  className="w-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="SURGE">SURGE</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={switchTokens}
                className="rounded-full"
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>To (estimated)</Label>
              <div className="flex gap-2">
                <Input
                  value={estimatedOutput}
                  readOnly
                  className="bg-muted"
                />
                <div className="flex w-28 items-center justify-center rounded-md border bg-muted px-3 text-sm">
                  {toToken}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between">
                <span>Price</span>
                <span>
                  1 SURGE = ${surgePrice.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleSwap}
              disabled={!amount}
            >
              Swap
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Demo swap only. No real tokens exchanged.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
