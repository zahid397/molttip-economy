/**

Spinner Component

A customizable loading spinner with multiple sizes, colors, and accessibility support.

Includes a convenient LoadingSpinner wrapper with text and optional overlay.
*/


import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/helpers';

// ============================================================================
// Base Spinner Component
// ============================================================================

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
/** Size of the spinner /
size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
/* Color variant /
variant?: 'default' | 'primary' | 'white' | 'muted';
/* Speed of the spin animation (in seconds per full rotation) /
speed?: number;
/* Thickness of the spinner border (CSS border-width value) /
thickness?: string;
/* Accessible label for screen readers (default: "Loading") */
label?: string;
}

/**

A simple, accessible loading spinner.
*/
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
(
{
size = 'md',
variant = 'default',
speed = 0.8,
thickness,
label = 'Loading',
className,
...props
},
ref
) => {
const sizeClasses = {
xs: 'w-3 h-3',
sm: 'w-4 h-4',
md: 'w-6 h-6',
lg: 'w-8 h-8',
xl: 'w-12 h-12',
};

const variantClasses = {
default: 'border-moleskine-black border-t-transparent',
primary: 'border-primary-600 border-t-transparent',
white: 'border-white border-t-transparent',
muted: 'border-gray-300 border-t-transparent',
};

const thicknessValue = thickness || {
xs: 'border-2',
sm: 'border-2',
md: 'border-2',
lg: 'border-3',
xl: 'border-4',
}[size];

return (

   <div  
     ref={ref}  
     role="status"  
     aria-label={label}  
     className={cn(  
       'inline-block rounded-full animate-spin',  
       sizeClasses[size],  
       variantClasses[variant],  
       thicknessValue,  
       className  
     )}  
     style={{ animationDuration: `${speed}s` }}  
     {...props}  
   >  
     <span className="sr-only">{label}</span>  
   </div>  
 );  
}
);

Spinner.displayName = 'Spinner';

// ============================================================================
// LoadingSpinner (full‑page or inline wrapper with text)
// ============================================================================

export interface LoadingSpinnerProps {
/** Optional message to display below the spinner /
message?: string;
/* Size of the spinner /
spinnerSize?: SpinnerProps['size'];
/* Color variant of the spinner /
spinnerVariant?: SpinnerProps['variant'];
/* Whether to show a full‑page overlay (centers spinner) /
fullPage?: boolean;
/* Additional class names for the container */
className?: string;
}

/**

A loading indicator with an optional message, can be used inline or as a full‑page overlay.
*/
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
message = 'Loading...',
spinnerSize = 'lg',
spinnerVariant = 'primary',
fullPage = false,
className,
}) => {
const content = (

 <div  
   className={cn(  
     'flex flex-col items-center justify-center gap-4',  
     fullPage ? 'min-h-screen' : 'py-12',  
     className  
   )}  
 >  
   <Spinner size={spinnerSize} variant={spinnerVariant} />  
   {message && (  
     <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>  
   )}  
 </div>  
);

if (fullPage) {
return (
<div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
{content}
</div>
);
}

return content;
};

LoadingSpinner.displayName = 'LoadingSpinner';
