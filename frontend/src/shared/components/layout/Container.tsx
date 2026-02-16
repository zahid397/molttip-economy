/**

Container Component

A centered, responsive container with configurable max-width.

Useful for laying out page content consistently.
*/


import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils/helpers';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
/** Maximum width variant /
size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
/* Children to render inside the container */
children: React.ReactNode;
}

/**

Container – provides consistent horizontal padding and max-width.
*/
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
({ children, className, size = 'lg', ...props }, ref) => {
const sizes = {
sm: 'max-w-3xl',
md: 'max-w-5xl',
lg: 'max-w-7xl',
xl: 'max-w-[1400px]',
full: 'max-w-full',
};

return (

   <div  
     ref={ref}  
     className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizes[size], className)}  
     {...props}  
   >  
     {children}  
   </div>  
 );  
}
);

Container.displayName = 'Container';
