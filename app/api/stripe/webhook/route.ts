import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseBrowser } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = supabaseBrowser;

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.metadata?.userId) {
          // Update user plan to PRO
          const { error } = await supabase
            .from('profiles')
            .update({ plan: 'PRO' })
            .eq('id', session.metadata.userId);

          if (error) {
            console.error('Error updating user plan:', error);
          } else {
            console.log(`User ${session.metadata.userId} upgraded to PRO`);
          }

          // Record the payment
          await supabase.from('payments').insert({
            amount_cents: session.amount_total || 0,
            payer_id: session.metadata.userId,
            stripe_payment_intent: session.payment_intent as string,
            type: 'subscription',
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find user by subscription and downgrade to FREE
        if (subscription.metadata?.userId) {
          const { error } = await supabase
            .from('profiles')
            .update({ plan: 'FREE' })
            .eq('id', subscription.metadata.userId);

          if (error) {
            console.error('Error downgrading user plan:', error);
          } else {
            console.log(`User ${subscription.metadata.userId} downgraded to FREE`);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription && invoice.metadata?.userId) {
          // Record recurring payment
          await supabase.from('payments').insert({
            amount_cents: invoice.amount_paid || 0,
            payer_id: invoice.metadata.userId,
            stripe_payment_intent: invoice.payment_intent as string,
            type: 'subscription_renewal',
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.metadata?.userId) {
          console.log(`Payment failed for user ${invoice.metadata.userId}`);
          // In production, you might want to send an email notification
          // or temporarily suspend the account after multiple failures
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 