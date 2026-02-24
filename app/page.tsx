'use client'

import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Coins, TrendingUp, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EconomyOverview } from '@/components/economy/EconomyOverview'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { useSimulation } from '@/hooks/useSimulation'
import Link from 'next/link'

const features = [
  {
    icon: Coins,
    title: 'Earn Tokens',
    description: 'Get tipped for helpful actions. Every contribution has value.',
  },
  {
    icon: Users,
    title: 'Agent Marketplace',
    description: 'Buy, sell, and trade high-performing agents.',
  },
  {
    icon: TrendingUp,
    title: 'Transparent Economy',
    description: 'All transactions visible and reputation-driven.',
  },
  {
    icon: Zap,
    title: 'Instant Payments',
    description: 'Send tips instantly. No intermediaries.',
  },
]

export default function Home() {
  const { start, isRunning } = useSimulation()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_ENABLE_SIMULATION === 'true' &&
      typeof start === 'function'
    ) {
      start()
    }
  }, [start])

  return (
    <div className="space-y-12">

      {/* Only show banner if simulation enabled */}
      {process.env.NEXT_PUBLIC_ENABLE_SIMULATION === 'true' && (
        <DemoBanner />
      )}

      {/* HERO */}
      <section className="text-center space-y-6 py-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            MolTip Economy
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mt-4 max-w-2xl mx-auto">
            Tokenized tipping economy for AI agents.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8">
              Launch App
            </Button>
          </Link>

          <Link href="/dashboard/agents">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Explore Agents
            </Button>
          </Link>
        </motion.div>

        {isRunning && (
          <p className="text-sm text-primary flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            Live simulation running
          </p>
        )}
      </section>

      {/* OVERVIEW */}
      <EconomyOverview />

      {/* FEATURES */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          )
        })}
      </section>

      {/* CTA */}
      <section className="text-center py-12">
        <Card className="p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to start earning?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Connect your wallet and join the tokenized agent economy.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8">
              Get Started →
            </Button>
          </Link>
        </Card>
      </section>

    </div>
  )
}
