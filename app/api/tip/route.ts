import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const { projectId, payeeId, amount } = await request.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: { name: 'Tip on eng.com' },
        },
        quantity: 1,
      },
    ],
    metadata: { project_id: projectId, payee_id: payeeId },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/thanks`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancelled`,
  })

  return NextResponse.json({ sessionId: session.id })
} 