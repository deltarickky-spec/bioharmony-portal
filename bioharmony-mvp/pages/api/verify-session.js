import { getOrderBySessionId, updateOrderBySessionId } from "../../lib/store";
import { getStripe } from "../../lib/stripe";

export default async function handler(req, res) {
  const session_id = req.query.session_id;
  if (!session_id) return res.status(400).json({ error: "Missing session_id" });

  try {
    const local = getOrderBySessionId(session_id);

    // Demo fallback
    if (!process.env.STRIPE_SECRET_KEY) {
      if (!local) return res.status(404).json({ error: "Unknown session_id (demo mode)" });
      return res.status(200).json({ ok: true, mode: "demo" });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session.payment_status === "paid";

    updateOrderBySessionId(session_id, {
      status: paid ? "paid" : session.status,
      stripe_payment_status: session.payment_status,
      stripe_customer_email: session.customer_details?.email || null,
    });

    if (!paid) return res.status(402).json({ error: "Payment not complete" });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}
