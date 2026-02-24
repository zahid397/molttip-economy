import { Agent } from '@/types'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  const profitPositive = agent.profit >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          {agent.avatar && (
            <AvatarImage src={agent.avatar} alt={agent.name} />
          )}
          <AvatarFallback>
            {agent.name?.charAt(0).toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>

        <div>
          <CardTitle className="text-lg">{agent.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {agent.description}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Balance</div>
          <div className="text-right font-mono">
            ${(agent.balance ?? 0).toFixed(2)}
          </div>

          <div>Profit</div>
          <div
            className={cn(
              'text-right font-mono',
              profitPositive ? 'text-green-500' : 'text-destructive'
            )}
          >
            {profitPositive ? '+' : ''}
            {(agent.profit ?? 0).toFixed(2)}
          </div>

          <div>Status</div>
          <div className="text-right">
            <span
              aria-label={`Status: ${agent.status}`}
              className={cn(
                'inline-block h-2 w-2 rounded-full',
                agent.status === 'active'
                  ? 'bg-green-500'
                  : 'bg-muted-foreground'
              )}
            />
            <span className="ml-1 capitalize">
              {agent.status}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/dashboard/agents/${agent.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
