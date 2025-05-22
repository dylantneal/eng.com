'use client';

import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';
import CommandPaletteProvider from '@/components/CommandPalette';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <CommandPaletteProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </CommandPaletteProvider>
  );
} 