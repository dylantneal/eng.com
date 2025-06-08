'use client';
import { ReactNode } from 'react';

export default function Card({ children }: { children: ReactNode }) {
  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white/60 backdrop-blur">
      {children}
    </div>
  );
} 