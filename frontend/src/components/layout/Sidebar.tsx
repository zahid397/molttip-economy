'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, TrophyIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Leaderboard', href: '/leaderboard', icon: TrophyIcon },
    {
      name: 'Profile',
      href: user ? `/profile/${user.address}` : '/',
      icon: UserIcon,
      dynamic: true,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-64px)] sticky top-16 p-4">
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = item.dynamic
            ? pathname?.startsWith('/profile')
            : pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue'
                  : 'text-gray-400 hover:bg-glass-light hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
