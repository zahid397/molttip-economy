/**

Footer Component

Renders the site footer with brand info, navigation links, social icons,

and a dynamic copyright year. Accessible and responsive.
*/


'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Heart, ArrowUp } from 'lucide-react';
import { cn } from '@/shared/utils/helpers';

export interface FooterProps {
/** Whether to hide the "Back to top" button /
hideBackToTop?: boolean;
/* Additional class names for the footer element */
className?: string;
}

export const Footer: React.FC<FooterProps> = ({
hideBackToTop = false,
className,
}) => {
const currentYear = new Date().getFullYear();

const scrollToTop = () => {
window.scrollTo({ top: 0, behavior: 'smooth' });
};

return (
<footer
className={cn(
'bg-moleskine-black text-moleskine-cream border-t-2 border-moleskine-black',
className
)}
>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
{/* Brand */}
<div className="col-span-1 md:col-span-2">
<div className="flex items-center gap-2 mb-4">
<div className="w-8 h-8 bg-moleskine-cream rounded-lg flex items-center justify-center">
<span className="text-moleskine-black text-sm font-bold">MT</span>
</div>
<span className="font-bold text-xl">Molttip Economy</span>
</div>
<p className="text-moleskine-tan text-sm max-w-md">
A Moleskine-style social platform where quality content is rewarded through
a decentralized tipping economy. Share, engage, and earn.
</p>
</div>

{/* Quick Links */}  
      <div>  
        <h3 className="font-semibold mb-4">Quick Links</h3>  
        <ul className="space-y-2 text-sm">  
          <li>  
            <Link  
              href="/"  
              className="text-moleskine-tan hover:text-moleskine-cream transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-moleskine-black rounded"  
            >  
              Feed  
            </Link>  
          </li>  
          <li>  
            <Link  
              href="/leaderboard"  
              className="text-moleskine-tan hover:text-moleskine-cream transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-moleskine-black rounded"  
            >  
              Leaderboard  
            </Link>  
          </li>  
          <li>  
            <Link  
              href="/marketplace"  
              className="text-moleskine-tan hover:text-moleskine-cream transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-moleskine-black rounded"  
            >  
              Marketplace  
            </Link>  
          </li>  
        </ul>  
      </div>  

      {/* Community */}  
      <div>  
        <h3 className="font-semibold mb-4">Community</h3>  
        <div className="flex gap-4">  
          <a  
            href="https://github.com/yourusername/molttip-economy"  
            target="_blank"  
            rel="noopener noreferrer"  
            aria-label="GitHub repository"  
            className="p-2 bg-moleskine-tan/20 hover:bg-moleskine-tan/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-moleskine-black"  
          >  
            <Github className="w-5 h-5" />  
          </a>  
          <a  
            href="https://twitter.com/molttip"  
            target="_blank"  
            rel="noopener noreferrer"  
            aria-label="Twitter profile"  
            className="p-2 bg-moleskine-tan/20 hover:bg-moleskine-tan/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-moleskine-black"  
          >  
            <Twitter className="w-5 h-5" />  
          </a>  
        </div>  
      </div>  
    </div>  

    <div className="mt-8 pt-8 border-t border-moleskine-tan/20">  
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-moleskine-tan">  
        <p>© {currentYear} Molttip Economy. All rights reserved.</p>  
        <p className="flex items-center gap-1">  
          Made with <Heart className="w-4 h-4 text-red-500 fill-current" aria-hidden="true" /> for the community  
        </p>  
      </div>  
    </div>  

    {/* Back to top */}  
    {!hideBackToTop && (  
      <div className="mt-4 text-center">  
        <button  
          onClick={scrollToTop}  
          className="inline-flex items-center gap-2 text-sm text-moleskine-tan hover:text-moleskine-cream transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-moleskine-black rounded px-3 py-1"  
          aria-label="Back to top"  
        >  
          <ArrowUp className="w-4 h-4" />  
          Back to top  
        </button>  
      </div>  
    )}  
  </div>  
</footer>

);
};
