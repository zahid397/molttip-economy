/**

Toast Notification Setup

Provides a centralized toast notification system using react-hot-toast.

Includes a provider component and custom toast functions with consistent styling.
*/


import React from 'react';
import toast, { Toaster, ToastOptions } from 'react-hot-toast';
import { cn } from '@/shared/utils/helpers';

// ============================================================================
// Provider Component
// ============================================================================

export interface ToastProviderProps {
/** Position of toasts on screen /
position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
/* Default duration in milliseconds /
duration?: number;
/* Additional class names for the toaster container */
className?: string;
}

/**

ToastProvider – wraps the Toaster component with default styling.

Place this near the root of your app (e.g., in _app.tsx or RootLayout).
*/
export const ToastProvider: React.FC<ToastProviderProps> = ({
position = 'top-right',
duration = 4000,
className,
}) => {
return (
<Toaster
position={position}
toastOptions={{
duration,
className: cn(
'!bg-moleskine-cream !text-moleskine-black !border-2 !border-moleskine-black !rounded-lg !p-4 !font-medium !shadow-moleskine-lg',
className
),
style: {
background: '#f5f1e8',
color: '#1a1a1a',
border: '2px solid #1a1a1a',
borderRadius: '0.5rem',
padding: '1rem',
fontWeight: '500',
boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
},
success: {
iconTheme: {
primary: '#10b981',
secondary: '#f5f1e8',
},
},
error: {
iconTheme: {
primary: '#ef4444',
secondary: '#f5f1e8',
},
},
loading: {
iconTheme: {
primary: '#f59e0b',
secondary: '#f5f1e8',
},
},
}}
/>
);
};


// ============================================================================
// Custom Toast Functions
// ============================================================================

/**

Show a success toast.

@param message - The message to display.

@param options - Additional toast options.
*/
export const showSuccess = (message: string, options?: ToastOptions) => {
return toast.success(message, options);
};


/**

Show an error toast.

@param message - The message to display.

@param options - Additional toast options.
*/
export const showError = (message: string, options?: ToastOptions) => {
return toast.error(message, options);
};


/**

Show an info toast (default style).

@param message - The message to display.

@param options - Additional toast options.
*/
export const showInfo = (message: string, options?: ToastOptions) => {
return toast(message, options);
};


/**

Show a warning toast (custom style via options).

@param message - The message to display.

@param options - Additional toast options.
*/
export const showWarning = (message: string, options?: ToastOptions) => {
return toast(message, {
icon: '⚠️',
...options,
});
};


/**

Show a loading toast that can be updated later.

@param message - The message to display.

@param options - Additional toast options.

@returns A toast ID that can be used with toast.dismiss or toast.loading.
*/
export const showLoading = (message: string, options?: ToastOptions) => {
return toast.loading(message, options);
};


/**

Dismiss a specific toast or all toasts.

@param id - Optional toast ID; if omitted, dismisses all.
*/
export const dismissToast = (id?: string) => {
if (id) {
toast.dismiss(id);
} else {
toast.dismiss();
}
};


/**

Update a loading toast to success/error/etc.

@param id - The toast ID to update.

@param message - New message.

@param type - Type of toast ('success', 'error', etc.)
*/
export const updateToast = (
id: string,
message: string,
type: 'success' | 'error' | 'loading' | 'blank' = 'success'
) => {
toast[type](message, { id });
};


// ============================================================================
// Custom Hook
// ============================================================================

/**

useToast – A hook providing toast functions with stable references.
*/
export const useToast = () => {
return {
success: showSuccess,
error: showError,
info: showInfo,
warning: showWarning,
loading: showLoading,
dismiss: dismissToast,
update: updateToast,
};
};


// Re-export the original toast for advanced use cases
export { toast };
