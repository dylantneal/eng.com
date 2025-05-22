import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseServerAdmin } from '@/lib/supabase/server-admin';
import type Stripe from 'stripe';

export const config = { runtime: 'nodejs' };              // raw body OK

export async function POST(req: NextRequest) {
  const sig  = req.headers.get('stripe-signature')!;
  const body = Buffer.from(await req.arrayBuffer());

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = supabaseServerAdmin();

  switch (event.type) {
    /* ───────── tips (one-off payment) ───────── */
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.mode === 'payment') {
        await supabase.from('payments').insert({
          stripe_payment_intent: s.payment_intent as string,
          amount_cents: s.amount_total!,
          type: 'tip',
          // payer_id could be null for anonymous tips
          project_id: s.metadata?.project_id,
        });
      }
      break;
    }

    /* ───────── subscription events ──────────── */
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (userId) {
        const plan = sub.status === 'active' ? 'pro' : 'free';
        await supabase.from('profiles').update({ plan }).eq('id', userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
} 