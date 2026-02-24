'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  CreditCard,
  Trophy,
} from 'lucide-react'

const items = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agents', href: '/dashboard/agents', icon: Users },
  { name: 'Trade', href: '/dashboard/trade', icon: ArrowLeftRight },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon

          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + '/')

          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
