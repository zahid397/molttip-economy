'use client'

import { useState } from 'react'
import { EconomyOverview } from '@/components/economy/EconomyOverview'
import { AgentCard } from '@/components/economy/AgentCard'
import { useEconomyStore } from '@/stores/economyStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Agent } from '@/types'
import { useToast } from '@/components/ui/use-toast'

export default function DashboardPage() {
  const agents = useEconomyStore((s) => s.agents)
  const tipAgent = useEconomyStore((s) => s.tipAgent)

  const { toast } = useToast()

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [tipAmount, setTipAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTip = async () => {
    if (!selectedAgent) return

    const amount = parseFloat(tipAmount)

    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
      })
      return
    }

    setLoading(true)

    tipAgent(selectedAgent.id, amount)

    toast({
      title: 'Tip Sent',
      description: `Tipped ${amount} tokens to ${selectedAgent.name}`,
    })

    setSelectedAgent(null)
    setTipAmount('')
    setLoading(false)
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of the MolTip economy
        </p>
      </div>

      <EconomyOverview />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Active Agents</h2>

        {agents.length === 0 ? (
          <p className="text-muted-foreground">
            No agents available.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {agents.slice(0, 6).map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onTip={() => setSelectedAgent(agent)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedAgent}
        onOpenChange={(open) => !open && setSelectedAgent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Tip {selectedAgent?.name}
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
              onClick={() => setSelectedAgent(null)}
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

    </div>
  )
}
