'use client';
import Button from '@/components/ui/Button';
import { useState } from 'react';

export default function TipJarButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const r = await fetch('/api/stripe/create-tip-session', {
      method: 'POST',
      body: JSON.stringify({ projectId, amountCents: 500 }), // $5 fixed tip
    });
    const { url } = await r.json();
    window.location.href = url;
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={loading}>
      {loading ? 'Redirecting…' : 'Tip $5'}
    </Button>
  );
} 