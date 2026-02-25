'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useWalletStore } from '@/stores/walletStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Menu } from 'lucide-react'

export function Navbar() {
  const { address, connect, disconnect } = useWalletStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-primary">MOTIP</span>
          </Link>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {address ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <Avatar>
                <AvatarFallback>👤</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connect}>Connect Wallet</Button>
          )}
        </div>
      </div>
    </header>
  )
}
