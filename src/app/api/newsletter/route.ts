import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  // 3 signups per IP per hour to prevent spam
  const { allowed } = await checkRateLimit('newsletter:' + ip, 3, 3600000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Try Supabase first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const res = await fetch(supabaseUrl + '/rest/v1/newsletter', {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': 'Bearer ' + supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal,resolution=ignore-duplicates',
        },
        body: JSON.stringify({ email: String(email).trim().toLowerCase() }),
      });
      if (!res.ok && res.status !== 409) {
        console.error('[Newsletter] Supabase error:', res.status);
      }
    } else {
      console.log('[Newsletter] No Supabase — would save:', { email });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Newsletter] Error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
