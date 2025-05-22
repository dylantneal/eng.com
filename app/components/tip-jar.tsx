'use client'

import { loadStripe } from '@stripe/stripe-js'

export default function TipJar({ projectId, payeeId }: { projectId: string; payeeId: string }) {
  const handleTip = async () => {
    const res     = await fetch('/api/tip', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ projectId, payeeId, amount: 500 }),
    })
    const { sessionId } = await res.json()
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUB!)
    await stripe!.redirectToCheckout({ sessionId })
  }

  return (
    <button onClick={handleTip} className="btn btn-primary w-full">
      Tip this creator
    </button>
  )
} 