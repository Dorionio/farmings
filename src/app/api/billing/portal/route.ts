import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';

export async function POST(req: Request) {
  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe configuration is missing on the server." }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret);

  try {
    const { customerId, redirectOrigin } = await req.json();
    
    if (!customerId) {
      return NextResponse.json({ error: "Missing required stripe customer ID parameter." }, { status: 400 });
    }

    // Create Stripe customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${redirectOrigin}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Customer Portal Session Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create customer portal session" }, { status: 500 });
  }
}
