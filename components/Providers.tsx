'use client';

// Client-side providers wrapper
// This component wraps all client-side providers needed for the app
import { SessionProvider } from 'next-auth/react';
import { QueryProvider } from '@/contexts/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </SessionProvider>
  );
}