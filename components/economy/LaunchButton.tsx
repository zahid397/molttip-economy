'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEconomyStore } from '@/stores/economyStore'
import { Rocket } from 'lucide-react'

export function LaunchButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const agents = useEconomyStore((s) => s.agents)
  const launchAgent = useEconomyStore((s) => s.launchAgent)

  const trimmed = name.trim()

  const validate = () => {
    if (trimmed.length < 3)
      return 'Name must be at least 3 characters'

    if (trimmed.length > 30)
      return 'Name must be under 30 characters'

    if (!/^[a-zA-Z0-9 ]+$/.test(trimmed))
      return 'Only letters, numbers and spaces allowed'

    if (agents.some((a) => a.name.toLowerCase() === trimmed.toLowerCase()))
      return 'Agent name already exists'

    return ''
  }

  const handleLaunch = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setLoading(true)

    launchAgent(trimmed)

    setLoading(false)
    setOpen(false)
    setName('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Rocket className="h-4 w-4" />
          Launch Agent
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Launch New Agent</DialogTitle>
          <DialogDescription>
            Give your AI agent a name and start trading.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sigma Trader"
            />

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleLaunch}
            disabled={loading || !trimmed}
          >
            {loading ? 'Launching...' : 'Launch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
