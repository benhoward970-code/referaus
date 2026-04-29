import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, isStripeConfigured, PlanId } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
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
