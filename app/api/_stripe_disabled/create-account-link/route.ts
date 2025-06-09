import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  /* ----------------------------------------------------------------- */
  /* 1️⃣  Lookup (or create) the Stripe Connect account for this user   */
  /* ----------------------------------------------------------------- */
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single();

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  let connectId = profile?.stripe_account_id as string | null;

  if (!connectId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email ?? undefined,
    });
    connectId = account.id;

    // Persist it so /api/stripe/create-tip-session can route tips correctly
    await supabase
      .from('profiles')
      .update({ stripe_account_id: connectId })
      .eq('id', user.id);
  }

  /* ----------------------------------------------------------------- */
  /* 2️⃣  Generate a fresh onboarding / dashboard link                  */
  /* ----------------------------------------------------------------- */
  const origin = new URL(req.url).origin;
  const link = await stripe.accountLinks.create({
    account: connectId,
    type: 'account_onboarding',
    refresh_url: `${origin}/get-paid?state=refresh`,
    return_url: `${origin}/get-paid?state=success`,
  });

  return NextResponse.json({ url: link.url });
} 