import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseServerAdmin } from '@/lib/supabase/server-admin';

export async function POST(req: NextRequest) {
  const { projectId, amountCents } = await req.json();

  // ── fetch project + creator payout account ───────────────
  const supabase = supabaseServerAdmin();
  const { data: proj, error } = await supabase
    .from('projects')
    .select('id, slug, profiles(stripe_account_id, handle)')
    .eq('id', projectId)
    .single();

  // Supabase returns `profiles` as an array → pick first element.
  const profile = (proj as any)?.profiles?.[0];

  if (error || !profile?.stripe_account_id)
    return NextResponse.json(
      { error: 'Creator not onboarded' },
      { status: 400 },
    );

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Tip for @${profile.handle}` },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount:
        Math.round((amountCents * Number(process.env.PLATFORM_FEE_PERCENT!)) / 100),
      transfer_data: { destination: profile.stripe_account_id },
    },
    metadata: { project_id: proj.id },
    success_url: `${process.env.DOMAIN_URL}/projects/${proj.id}?thanks=1`,
    cancel_url:  `${process.env.DOMAIN_URL}/projects/${proj.id}`,
  });

  return NextResponse.json({ url: session.url });
} 