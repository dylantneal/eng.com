'use client';

import { PropsWithChildren } from 'react';
import CommandPaletteProvider from '@/components/CommandPalette';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <CommandPaletteProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </CommandPaletteProvider>
  );
} 