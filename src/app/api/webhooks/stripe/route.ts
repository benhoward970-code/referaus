import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { updateProviderPlan, downgradeProviderByCustomerId } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!signature || !webhookSecret) {
    console.error('[Stripe] Missing signature or webhook secret');
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe] Webhook signature error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const planId = session.metadata?.planId || 'starter';
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;

        console.log('[Stripe] Checkout completed:', customerEmail, planId);

        if (customerEmail && customerId) {
          const result = await updateProviderPlan(customerEmail, planId, customerId, subscriptionId);
          if (result.error) {
            console.error('[Stripe] Failed to update plan:', result.error);
          } else {
            console.log('[Stripe] Plan updated:', customerEmail, '->', planId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        const status = subscription.status;

        // If subscription becomes active again (e.g. after failed payment recovery)
        if (status === 'active' && customerId) {
          // Get plan from subscription metadata or price lookup
          const planId = subscription.metadata?.planId;
          if (planId && customerId) {
            await updateProviderPlan('', planId, customerId, subscription.id);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

        console.log('[Stripe] Subscription cancelled:', subscription.id, 'customer:', customerId);

        if (customerId) {
          const result = await downgradeProviderByCustomerId(customerId);
          if (result.error) {
            console.error('[Stripe] Failed to downgrade plan:', result.error);
          } else {
            console.log('[Stripe] Provider downgraded to free, customer:', customerId);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('[Stripe] Payment failed for invoice:', invoice.id);
        // Could notify provider here in the future
        break;
      }

      default:
        console.log('[Stripe] Unhandled event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe] Webhook processing error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
