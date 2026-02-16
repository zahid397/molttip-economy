/**

SkipLink Component

A hidden link that becomes visible on focus, allowing keyboard users to skip

directly to the main content.
*/


'use client';

import React from 'react';
import { cn } from '@/shared/utils/helpers';

interface SkipLinkProps {
href: string;
children?: React.ReactNode;
className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
href,
children = 'Skip to main content',
className,
}) => {
return (
<a
href={href}
className={cn(
'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-moleskine-black focus:border-2 focus:border-moleskine-black focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
className
)}
>
{children}
</a>
);
};
