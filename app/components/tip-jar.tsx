'use client'

import { loadStripe } from '@stripe/stripe-js'

export default function TipJar({ projectId, payeeId }: { projectId: string; payeeId: string }) {
  const handleTip = async () => {
    const amountCents = 500; // Example: 5 USD

    const res     = await fetch('/api/stripe/create-tip-session', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ projectId, amountCents }),
    })
    const { url, error } = await res.json()

    if (error) {
      console.error("Error creating tip session:", error);
      return;
    }

    if (url) {
      window.location.href = url;
    } else {
      const { sessionId } = await res.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUB_KEY!);
      await stripe!.redirectToCheckout({ sessionId });
    }
  }

  return (
    <button onClick={handleTip} className="btn btn-primary w-full">
      Tip this creator
    </button>
  )
} 