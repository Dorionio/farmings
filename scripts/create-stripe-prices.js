const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function run() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("Error: STRIPE_SECRET_KEY is not defined in the environment.");
    console.log("Please define STRIPE_SECRET_KEY in your env before running this script.");
    process.exit(1);
  }

  console.log("Creating Stripe Products and Prices for DorionAnima SaaS...");
  try {
    const product = await stripe.products.create({
      name: 'DorionAnima SaaS Standard',
      description: 'Complete kennel boarding, checklist chores, and breeding facility management.',
    });

    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 6900, // $69.00
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 69000, // $690.00
      currency: 'usd',
      recurring: { interval: 'year' },
    });

    console.log("\n==========================================");
    console.log("SUCCESSFULLY CREATED STRIPE PRODUCTS");
    console.log("==========================================");
    console.log(`Product ID: ${product.id}`);
    console.log(`Monthly Price ID: ${monthlyPrice.id}`);
    console.log(`Yearly Price ID:  ${yearlyPrice.id}`);
    console.log("==========================================");
    console.log("\nCopy the Price IDs into your .env.local file as follows:");
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=${monthlyPrice.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_YEARLY=${yearlyPrice.id}`);
  } catch (err) {
    console.error("Failed to setup Stripe products:", err);
  }
}
run();
