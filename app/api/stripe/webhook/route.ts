import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseServerAdmin } from '@/lib/supabase/server-admin';
import type Stripe from 'stripe';

export const config = { runtime: 'nodejs' };              // raw body OK

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid sig' }, { status: 400 });
  }

  switch (event.type) {
    /* ───────── tips (one-off payment) ───────── */
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata as any;

      // persist payment row
      await supabaseServerAdmin().from('payments').insert({
        payer: metadata.payer_id ?? null,
        payee: metadata.payee_id,
        project_id: metadata.project_id,
        amount_cents: session.amount_total!,
        stripe_intent_id: session.payment_intent as string,
        type: 'tip',
      });
      break;
    }

    /* ───────── subscription events ──────────── */
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (userId) {
        const plan = sub.status === 'active' ? 'pro' : 'free';
        await supabaseServerAdmin().from('profiles').update({ plan }).eq('id', userId);
      }
      break;
    }
  }

  return NextResponse.json({ ok: true });
} 