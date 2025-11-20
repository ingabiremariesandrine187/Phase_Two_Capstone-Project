'use client';

// Client-side providers wrapper
// This component wraps all client-side providers needed for the app
import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from '@/contexts/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" richColors />
      </QueryProvider>
    </SessionProvider>
  );
}