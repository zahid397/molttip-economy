/**

Modal Component

Accessible modal dialog with focus trap, keyboard navigation,

and customizable content. Uses React Portal to render outside DOM hierarchy.
*/


import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/helpers';
import { Button } from './Button';

export interface ModalProps {
/** Whether the modal is open /
isOpen: boolean;
/* Callback when modal requests to close /
onClose: () => void;
/* Modal title (optional) /
title?: string;
/* Modal content /
children: React.ReactNode;
/* Size variant /
size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
/* Show close button in header /
showCloseButton?: boolean;
/* Close modal when clicking overlay /
closeOnOverlayClick?: boolean;
/* Close modal when pressing Escape /
closeOnEscape?: boolean;
/* Footer content (typically buttons) /
footer?: React.ReactNode;
/* Custom icon for close button /
closeIcon?: React.ReactNode;
/* Additional class names for the modal panel /
className?: string;
/* ARIA description (optional) */
description?: string;
}

/**

Modal component with accessibility features.
*/
export const Modal: React.FC<ModalProps> = ({
isOpen,
onClose,
title,
children,
size = 'md',
showCloseButton = true,
closeOnOverlayClick = true,
closeOnEscape = true,
footer,
closeIcon = <X className="w-5 h-5" />,
className,
description,
}) => {
// Refs for focus management
const modalRef = useRef<HTMLDivElement>(null);
const closeButtonRef = useRef<HTMLButtonElement>(null);
const previousActiveElement = useRef<HTMLElement | null>(null);


// Size classes
const sizes = {
sm: 'max-w-sm',
md: 'max-w-md',
lg: 'max-w-lg',
xl: 'max-w-xl',
full: 'max-w-4xl w-full mx-4',
};

// Handle Escape key
useEffect(() => {
const handleEscape = (e: KeyboardEvent) => {
if (closeOnEscape && isOpen && e.key === 'Escape') {
e.preventDefault();
onClose();
}
};

document.addEventListener('keydown', handleEscape);  
return () => document.removeEventListener('keydown', handleEscape);

}, [closeOnEscape, isOpen, onClose]);

// Prevent body scroll and manage focus
useEffect(() => {
if (!isOpen) return;

// Save current active element  
previousActiveElement.current = document.activeElement as HTMLElement;  

// Prevent body scroll  
document.body.style.overflow = 'hidden';  

// Focus the modal panel (or close button if exists)  
setTimeout(() => {  
  if (closeButtonRef.current) {  
    closeButtonRef.current.focus();  
  } else if (modalRef.current) {  
    modalRef.current.focus();  
  }  
}, 100); // Small delay to ensure DOM is ready  

return () => {  
  // Restore body scroll  
  document.body.style.overflow = 'unset';  

  // Restore previous focus  
  if (previousActiveElement.current) {  
    previousActiveElement.current.focus();  
  }  
};

}, [isOpen]);

// Focus trap inside modal
const handleKeyDown = useCallback(
(e: React.KeyboardEvent) => {
if (!isOpen) return;

if (e.key === 'Tab') {  
    const focusableElements = modalRef.current?.querySelectorAll(  
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'  
    );  

    if (!focusableElements || focusableElements.length === 0) return;  

    const firstElement = focusableElements[0] as HTMLElement;  
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;  

    if (e.shiftKey && document.activeElement === firstElement) {  
      e.preventDefault();  
      lastElement.focus();  
    } else if (!e.shiftKey && document.activeElement === lastElement) {  
      e.preventDefault();  
      firstElement.focus();  
    }  
  }  
},  
[isOpen]

);

if (!isOpen) return null;

const modalContent = (
<div  
className="fixed inset-0 z-50 flex items-center justify-center p-4"  
onKeyDown={handleKeyDown}  
>
{/* Overlay */}
<div
className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
onClick={closeOnOverlayClick ? onClose : undefined}
/>

{/* Modal Panel */}  
  <div  
    ref={modalRef}  
    role="dialog"  
    aria-modal="true"  
    aria-labelledby={title ? 'modal-title' : undefined}  
    aria-describedby={description ? 'modal-description' : undefined}  
    tabIndex={-1}  
    className={cn(  
      'relative w-full bg-moleskine-cream border-2 border-moleskine-black rounded-lg shadow-moleskine-lg animate-scale-in',  
      sizes[size],  
      className  
    )}  
  >  
    {/* Header */}  
    {(title || showCloseButton) && (  
      <div className="flex items-center justify-between p-4 border-b-2 border-moleskine-black">  
        {title && (  
          <h2 id="modal-title" className="text-xl font-bold text-moleskine-black">  
            {title}  
          </h2>  
        )}  
        {showCloseButton && (  
          <button  
            ref={closeButtonRef}  
            onClick={onClose}  
            className="p-1 rounded-lg hover:bg-moleskine-tan transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"  
            aria-label="Close modal"  
          >  
            {closeIcon}  
          </button>  
        )}  
      </div>  
    )}  

    {/* Description (visually hidden) */}  
    {description && (  
      <p id="modal-description" className="sr-only">  
        {description}  
      </p>  
    )}  

    {/* Content */}  
    <div className="p-4 max-h-[70vh] overflow-y-auto">{children}</div>  

    {/* Footer */}  
    {footer && (  
      <div className="flex items-center justify-end gap-2 p-4 border-t-2 border-moleskine-black">  
        {footer}  
      </div>  
    )}  
  </div>  
</div>

);

return createPortal(modalContent, document.body);
};
