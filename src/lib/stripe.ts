import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY.trim()) : null;

export function isStripeConfigured() {
  return !!STRIPE_SECRET_KEY;
}

export const PLANS = {
  free: { name: 'Free', priceMonthly: 0, priceYearly: 0, stripePriceMonthly: null, stripePriceYearly: null },
  starter: { name: 'Starter', priceMonthly: 2900, priceYearly: 19900, stripePriceMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY?.trim() || null, stripePriceYearly: process.env.STRIPE_PRICE_STARTER_YEARLY?.trim() || null },
  pro: { name: 'Pro', priceMonthly: 7900, priceYearly: 54900, stripePriceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY?.trim() || null, stripePriceYearly: process.env.STRIPE_PRICE_PRO_YEARLY?.trim() || null },
  premium: { name: 'Premium', priceMonthly: 14900, priceYearly: 99900, stripePriceMonthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY?.trim() || null, stripePriceYearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY?.trim() || null },
} as const;

export type PlanId = keyof typeof PLANS;

export async function createCheckoutSession(planId: PlanId, billing: 'monthly' | 'yearly', customerEmail: string) {
  if (!stripe) throw new Error('Stripe not configured');
  const plan = PLANS[planId];
  const priceId = billing === 'yearly' ? plan.stripePriceYearly : plan.stripePriceMonthly;
  if (!priceId) throw new Error('Stripe price ID not configured for this plan');

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: (process.env.NEXT_PUBLIC_APP_URL || 'https://referaus.com') + '/dashboard?upgraded=true',
    cancel_url: (process.env.NEXT_PUBLIC_APP_URL || 'https://referaus.com') + '/pricing',
    metadata: { planId, billing },
  });
  return session;
}

export async function createPortalSession(customerId: string) {
  if (!stripe) throw new Error('Stripe not configured');
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: (process.env.NEXT_PUBLIC_APP_URL || 'https://referaus.com') + '/dashboard',
  });
  return session;
}
