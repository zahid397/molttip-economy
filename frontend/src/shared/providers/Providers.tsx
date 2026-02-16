/**

Root Providers Component

Wraps the application with all necessary context providers:

React Query (for data fetching)


Toast notifications


Error boundary


Also includes React Query Devtools in development.
*/


'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastProvider } from '@/shared/components/ui/Toast';
import { ErrorBoundary } from '@/shared/components/common/ErrorBoundary';

// Create a client
const queryClient = new QueryClient({
defaultOptions: {
queries: {
refetchOnWindowFocus: false,
retry: 1,
staleTime: 5 * 60 * 1000, // 5 minutes
},
},
});

interface ProvidersProps {
children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
return (
<ErrorBoundary>
<QueryClientProvider client={queryClient}>
<ToastProvider />
{children}
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
</QueryClientProvider>
</ErrorBoundary>
);
};
