'use client';

import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';
import CommandPaletteProvider from '@/components/CommandPalette';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModals } from '@/components/auth/AuthModals';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <CommandPaletteProvider>
      <SessionProvider>
        <AuthProvider>
          {children}
          <AuthModals />
        </AuthProvider>
      </SessionProvider>
    </CommandPaletteProvider>
  );
} 