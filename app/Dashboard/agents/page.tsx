'use client'

import { useState } from 'react'
import { useEconomyStore } from '@/stores/economyStore'
import { AgentCard } from '@/components/economy/AgentCard'
import { motion } from 'framer-motion'
import { Agent } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export default function AgentsPage() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">All Agents</h1>
        <p className="text-muted-foreground">
          Browse and tip active agents in the economy
        </p>
      </div>

      {agents.length === 0 ? (
        <p className="text-muted-foreground">
          No agents available.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <AgentCard
                agent={agent}
                onTip={() => setSelectedAgent(agent)}
              />
            </motion.div>
          ))}
        </div>
      )}

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
