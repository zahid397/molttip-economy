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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'

export function PaymentButton() {
  const [open, setOpen] = useState(false)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState<'MOTIP' | 'USD'>('MOTIP')
  const [loading, setLoading] = useState(false)

  const balance = useWalletStore((s) => s.balance)
  const transfer = useWalletStore((s) => s.transfer)
  const addTransaction = useTransactionStore((s) => s.addTransaction)

  const num = parseFloat(amount)
  const available = balance?.[token] ?? 0
  const insufficient = !isNaN(num) && num > available

  const handleSend = async () => {
    if (!to || isNaN(num) || num <= 0 || insufficient) return

    setLoading(true)

    const success = await transfer(to, num, token)

    if (success) {
      addTransaction({
        id: crypto.randomUUID(),
        from: 'me',
        to,
        amount: num,
        token,
        timestamp: Date.now(),
        status: 'completed',
      })

      setOpen(false)
      setTo('')
      setAmount('')
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Send Payment</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Payment</DialogTitle>
          <DialogDescription>
            Transfer tokens to another address or agent.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="to">Recipient Address</Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x... or agent ID"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="grid gap-2">
            <Label>Token</Label>
            <Select
              value={token}
              onValueChange={(v: 'MOTIP' | 'USD') => setToken(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MOTIP">MOTIP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            Available: {available.toFixed(2)} {token}
          </p>

          {insufficient && (
            <p className="text-sm text-destructive">
              Insufficient balance
            </p>
          )}
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
            onClick={handleSend}
            disabled={loading || insufficient || !to || !amount}
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
