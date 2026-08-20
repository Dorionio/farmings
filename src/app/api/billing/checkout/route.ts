import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';

export async function POST(req: Request) {
  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe configuration is missing on the server." }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret);

  try {
    const { priceId, orgId, orgName, userId, email, customerId, redirectOrigin } = await req.json();
    
    if (!priceId || !orgId) {
      return NextResponse.json({ error: "Missing required parameters (priceId, orgId)" }, { status: 400 });
    }

    // Retrieve organization's trial_end date to compute remaining days
    let trialDaysRemaining = 0;
    try {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('trial_end')
        .eq('id', orgId)
        .single();
        
      if (orgData && orgData.trial_end) {
        const trialEndDate = new Date(orgData.trial_end);
        const diffTime = trialEndDate.getTime() - Date.now();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          trialDaysRemaining = diffDays;
        }
      }
    } catch (e) {
      console.warn("Could not query organization trial end, defaulting to local config:", e);
      // Fallback: If DB columns not active, read from local storage simulated config
    }

    let stripeCustomerId = customerId;
    
    // Create new customer if not already stored
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        name: orgName || undefined,
        metadata: {
          orgId,
          userId: userId || ''
        }
      });
      stripeCustomerId = customer.id;
    }

    // Prepare checkout options
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${redirectOrigin}/billing?checkout_success=true&sub_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${redirectOrigin}/billing?checkout_cancel=true`,
    };

    // Only apply trial period to Stripe if there is trial time left from the 14 days
    if (trialDaysRemaining > 0) {
      sessionOptions.subscription_data = {
        trial_period_days: trialDaysRemaining,
        metadata: {
          orgId
        }
      };
    } else {
      sessionOptions.subscription_data = {
        metadata: {
          orgId
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url, 
      customerId: stripeCustomerId 
    });
  } catch (err: any) {
    console.error("Stripe Checkout Session Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 });
  }
}
