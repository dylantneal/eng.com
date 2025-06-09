import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,   // ← needs admin scope
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: authData, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,      // skip "confirm your email" for dev
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Create a basic profile record that will be completed during onboarding
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        handle: null, // will be set during onboarding
        bio: null,
        avatar_url: null
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail signup if profile creation fails, user can complete later
    }
  }

  return NextResponse.json({ ok: true });
} 