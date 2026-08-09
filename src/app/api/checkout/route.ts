import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, isStripeConfigured, PlanId } from '@/lib/stripe';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = await checkRateLimit('checkout:' + ip, 5, 300000); // 5 per 5 min
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const { planId, billing, email } = await req.json();
    if (!planId || !billing || !email) {
      return NextResponse.json({ error: 'Missing planId, billing, or email' }, { status: 400 });
    }
    const session = await createCheckoutSession(planId as PlanId, billing, email);
    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
