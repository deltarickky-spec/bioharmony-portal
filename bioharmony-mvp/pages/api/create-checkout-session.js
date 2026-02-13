import { getTierById } from "../../lib/pricing";
import { createOrder } from "../../lib/store";
import { getStripe } from "../../lib/stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { tierId } = req.body || {};
    const tier = getTierById(tierId);
    if (!tier) return res.status(400).json({ error: "Invalid tierId" });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Dev fallback (no Stripe): create demo session
    if (!process.env.STRIPE_SECRET_KEY) {
      const session_id = `demo_${Date.now()}`;
      createOrder({
        id: session_id,
        stripe_session_id: session_id,
        tier_id: tier.id,
        amount_cents: tier.amount_cents,
        currency: tier.currency,
        status: "paid_demo",
        created_at: Date.now(),
      });
      return res.status(200).json({ url: `${appUrl}/record?session_id=${encodeURIComponent(session_id)}` });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: tier.currency,
            product_data: { name: `BioHarmony Solutions — ${tier.name}` },
            unit_amount: tier.amount_cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/record?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?canceled=1`,
    });

    createOrder({
      id: session.id,
      stripe_session_id: session.id,
      tier_id: tier.id,
      amount_cents: tier.amount_cents,
      currency: tier.currency,
      status: "created",
      created_at: Date.now(),
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}
