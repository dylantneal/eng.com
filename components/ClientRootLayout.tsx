'use client';

import { Providers } from './Providers';
import Navbar from './Navbar';

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
    </Providers>
  );
} 