import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe configuration is missing on the server." }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret);

  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature construction verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook signature mismatch: ${err.message}` }, { status: 400 });
  }

  console.log(`Received Stripe webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        // Retrieve tenant organization ID from metadata
        const orgId = subscription.metadata?.orgId;
        const customerId = subscription.customer as string;
        const subId = subscription.id;
        const status = subscription.status; // trialing, active, past_due, canceled
        
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
        const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null;

        // Resolve organization ID
        let targetOrgId = orgId;
        if (!targetOrgId) {
          const { data: dbOrg } = await supabase
            .from('organizations')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
            
          if (dbOrg) {
            targetOrgId = dbOrg.id;
          }
        }

        if (targetOrgId) {
          const { error } = await supabase
            .from('organizations')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subId,
              subscription_status: status,
              trial_end: trialEnd,
              current_period_end: currentPeriodEnd
            })
            .eq('id', targetOrgId);

          if (error) {
            console.error("Failed to update organization subscription via webhook database query:", error);
          } else {
            console.log(`Successfully synced organization ${targetOrgId} billing status to: ${status}`);
          }
        } else {
          console.warn(`Could not resolve organization reference for customer: ${customerId}`);
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
          
          await supabase
            .from('organizations')
            .update({
              subscription_status: subscription.status,
              current_period_end: currentPeriodEnd
            })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          await supabase
            .from('organizations')
            .update({
              subscription_status: 'past_due'
            })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }

      default:
        console.log(`Ignoring unhandled webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe Webhook Database sync handler failed:", err);
    return NextResponse.json({ error: "Internal processing failed" }, { status: 500 });
  }
}
