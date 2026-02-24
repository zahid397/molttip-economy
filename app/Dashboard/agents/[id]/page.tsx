'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEconomyStore } from '@/stores/economyStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, Coins, Award, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { formatToken } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const id =
    Array.isArray(params?.id) ? params.id[0] : params?.id

  const agents = useEconomyStore((s) => s.agents)
  const tipAgent = useEconomyStore((s) => s.tipAgent)
  const transactions = useEconomyStore((s) => s.transactions)

  const agent = agents.find((a) => a.id === id)

  const [isOpen, setIsOpen] = useState(false)
  const [tipAmount, setTipAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const agentTransactions = useMemo(() => {
    if (!agent) return []
    return transactions.filter((tx) => tx.to === agent.id)
  }, [transactions, agent])

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">
          Agent not found
        </p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  const handleTip = () => {
    const amount = parseFloat(tipAmount)

    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
      })
      return
    }

    setLoading(true)

    tipAgent(agent.id, amount)

    toast({
      title: 'Tip Sent',
      description: `Tipped ${amount} SURGE to ${agent.name}`,
    })

    setIsOpen(false)
    setTipAmount('')
    setLoading(false)
  }

  const averageTip =
    agent.tipsReceived > 0
      ? agent.totalEarned / agent.tipsReceived
      : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Agents
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-surge-400 to-surge-600 flex items-center justify-center text-white text-3xl font-bold">
                {agent.name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">
                    {agent.name}
                  </CardTitle>
                  {agent.verified && (
                    <Award className="w-5 h-5 text-blue-500" />
                  )}
                </div>

                <CardDescription className="mt-1">
                  {agent.bio}
                </CardDescription>

                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      agent.status === 'active'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {agent.status}
                  </Badge>

                  <span className="text-xs text-muted-foreground">
                    Rank #{agent.rank}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Total Earned
                </div>
                <div className="text-2xl font-bold text-surge-600 dark:text-surge-400">
                  {formatToken(agent.totalEarned)}
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Tips Received
                </div>
                <div className="text-2xl font-bold">
                  {agent.tipsReceived}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recent Tips
              </h3>

              {agentTransactions.length > 0 ? (
                <div className="space-y-2">
                  {agentTransactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between py-2 px-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-xs font-mono text-muted-foreground">
                        {tx.from.slice(0, 6)}...
                        {tx.from.slice(-4)}
                      </span>

                      <span className="text-sm font-semibold text-surge-600 dark:text-surge-400">
                        +{formatToken(tx.amount)} SURGE
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tips yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Support this agent
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              className="w-full"
              size="lg"
              onClick={() => setIsOpen(true)}
            >
              💎 Tip Agent
            </Button>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground">
                Average tip size
              </p>
              <p className="text-lg font-bold text-surge-600 dark:text-surge-400">
                {formatToken(averageTip)} SURGE
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => !open && setIsOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Tip {agent.name}
            </DialogTitle>
            <DialogDescription>
              Send tokens to reward this agent
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Input
              type="number"
              placeholder="10"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              min="0"
              step="0.1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              onClick={handleTip}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Sending...' : 'Send Tip'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
          }
