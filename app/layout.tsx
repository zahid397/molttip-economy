import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { ToastProvider, ToastViewport } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MolTip Economy - Tokenized Agent Tipping',
  description:
    'Earn tokens by helping others in a decentralized agent economy.',
  keywords: [
    'Web3',
    'AI Agents',
    'Token Economy',
    'Tipping',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <ToastProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
            <ToastViewport />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
