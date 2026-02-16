/**

Navigation Bar Component

Responsive navbar with wallet connection, mobile menu, and navigation links.
*/


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Wallet, User, TrendingUp, ShoppingBag, Home } from 'lucide-react';
import { cn } from '@/shared/utils/helpers';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { useWallet } from '@/shared/hooks/useWallet';

// Helper formatting functions (could be moved to a separate file)
const formatAddress = (address: string): string => {
if (!address) return '';
return ${address.slice(0, 6)}...${address.slice(-4)};
};

const formatBalance = (balance: number | string): string => {
const num = typeof balance === 'string' ? parseFloat(balance) : balance;
return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

export const Navbar: React.FC = () => {
const pathname = usePathname();
const { address, isConnected, balance, connect, disconnect, isConnecting } = useWallet();
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

const navLinks = [
{ href: '/', label: 'Feed', icon: Home },
{ href: '/leaderboard', label: 'Leaderboard', icon: TrendingUp },
{ href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
];

const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
const closeMobileMenu = () => setIsMobileMenuOpen(false);

return (
<nav className="sticky top-0 z-40 bg-moleskine-cream border-b-2 border-moleskine-black">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-16">
{/* Logo */}
<Link href="/" className="flex items-center gap-2 font-bold text-xl focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg">
<div className="w-8 h-8 bg-moleskine-black rounded-lg flex items-center justify-center">
<span className="text-moleskine-cream text-sm">MT</span>
</div>
<span className="hidden sm:inline">Molttip</span>
</Link>

{/* Desktop Navigation */}  
      <div className="hidden md:flex items-center gap-6">  
        {navLinks.map((link) => {  
          const Icon = link.icon;  
          const isActive = pathname === link.href;  
          return (  
            <Link  
              key={link.href}  
              href={link.href}  
              className={cn(  
                'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',  
                isActive  
                  ? 'bg-moleskine-black text-moleskine-cream'  
                  : 'text-moleskine-black hover:bg-moleskine-tan'  
              )}  
              aria-current={isActive ? 'page' : undefined}  
            >  
              <Icon className="w-5 h-5" />  
              {link.label}  
            </Link>  
          );  
        })}  
      </div>  

      {/* Wallet Section */}  
      <div className="flex items-center gap-3">  
        {isConnected ? (  
          <>  
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-moleskine-black rounded-lg">  
              <Wallet className="w-4 h-4" />  
              <span className="font-semibold">{formatBalance(balance)} MOLT</span>  
            </div>  

            <Link  
              href={`/profile/${address}`}  
              className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"  
              aria-label="Profile"  
            >  
              <Avatar  
                size="sm"  
                src="" // TODO: replace with actual avatar URL from user data  
                alt={address || ''}  
                fallback={address ? formatAddress(address) : ''}  
              />  
            </Link>  

            <Button  
              variant="ghost"  
              size="sm"  
              onClick={disconnect}  
              className="hidden sm:inline-flex"  
            >  
              Disconnect  
            </Button>  
          </>  
        ) : (  
          <Button  
            variant="primary"  
            size="sm"  
            onClick={connect}  
            isLoading={isConnecting}  
          >  
            <Wallet className="w-4 h-4 mr-2" />  
            Connect Wallet  
          </Button>  
        )}  

        {/* Mobile Menu Button */}  
        <button  
          className="md:hidden p-2 rounded-lg hover:bg-moleskine-tan focus:outline-none focus:ring-2 focus:ring-primary-500"  
          onClick={toggleMobileMenu}  
          aria-expanded={isMobileMenuOpen}  
          aria-label="Toggle menu"  
        >  
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}  
        </button>  
      </div>  
    </div>  

    {/* Mobile Menu */}  
    <div  
      className={cn(  
        'md:hidden overflow-hidden transition-all duration-300 ease-in-out',  
        isMobileMenuOpen ? 'max-h-96 border-t-2 border-moleskine-black py-4' : 'max-h-0'  
      )}  
    >  
      <div className="flex flex-col gap-2">  
        {navLinks.map((link) => {  
          const Icon = link.icon;  
          const isActive = pathname === link.href;  
          return (  
            <Link  
              key={link.href}  
              href={link.href}  
              onClick={closeMobileMenu}  
              className={cn(  
                'flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',  
                isActive  
                  ? 'bg-moleskine-black text-moleskine-cream'  
                  : 'text-moleskine-black hover:bg-moleskine-tan'  
              )}  
              aria-current={isActive ? 'page' : undefined}  
            >  
              <Icon className="w-5 h-5" />  
              {link.label}  
            </Link>  
          );  
        })}  

        {isConnected && (  
          <>  
            <div className="flex items-center justify-between px-4 py-3 bg-white border-2 border-moleskine-black rounded-lg">  
              <span className="text-sm font-medium">Balance</span>  
              <span className="font-semibold">{formatBalance(balance)} MOLT</span>  
            </div>  

            <Button  
              variant="outline"  
              fullWidth  
              onClick={() => {  
                disconnect();  
                closeMobileMenu();  
              }}  
            >  
              Disconnect Wallet  
            </Button>  
          </>  
        )}  
      </div>  
    </div>  
  </div>  
</nav>

);
};
