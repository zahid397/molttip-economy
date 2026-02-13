'use client';

import { WalletConnect } from '@/components/wallet/WalletConnect';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import Link from 'next/link';

export const Header = () => {
  return (
    <header className="sticky top-0 z-20 glass-panel border-b border-glass-light px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">MT</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent hidden sm:inline">
            MoltTip
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <NotificationsDropdown />
          <WalletConnect />
        </div>
      </div>
    </header>
  );
};
