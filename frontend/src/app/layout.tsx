/**
 * Root Layout
 *
 * The main layout component that wraps all pages.
 * Includes global providers, navigation, footer, and a skip-to-content link for accessibility.
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/shared/providers/Providers'; // ✅ FIXED PATH
import { Navbar } from '@/shared/components/layout/Navbar';
import { Footer } from '@/shared/components/layout/Footer';
import { SkipLink } from '@/shared/components/common/SkipLink';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Molttip Economy - Decentralized Social Tipping Platform',
  description:
    'A Moleskine-style social platform where quality content is rewarded through a decentralized tipping economy',
  keywords: ['social', 'tipping', 'blockchain', 'web3', 'moleskine'],
  authors: [{ name: 'Molttip Team' }],
  openGraph: {
    title: 'Molttip Economy',
    description: 'Share, engage, and earn on the decentralized social platform',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#f5f1e8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <SkipLink href="#main-content" />
          <div className="flex flex-col min-h-screen bg-moleskine-cream">
            <Navbar />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
