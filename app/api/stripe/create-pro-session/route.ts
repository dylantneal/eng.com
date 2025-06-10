import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { supabaseServerAdmin } from '@/lib/supabase/server-admin';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  const supabase = supabaseServerAdmin();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', session.user.id)
    .single();

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: session.user.email!,
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    metadata: { user_id: profile!.id },
    success_url: `${process.env.DOMAIN_URL}/settings?upgrade=success`,
    cancel_url:  `${process.env.DOMAIN_URL}/settings`,
  });

  return NextResponse.json({ url: checkout.url });
} 