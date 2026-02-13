import { useState } from "react";
import { PRICING_TIERS } from "../lib/pricing";

export default function Home() {
  const [loadingTier, setLoadingTier] = useState(null);

  async function startCheckout(tierId) {
    try {
      setLoadingTier(tierId);
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      alert(e.message);
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial", padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>BioHarmony Solutions</div>
          <div style={{ color: "#334155" }}>Voice-to-Report Wellness Portal</div>
        </div>
        <a href="#pricing" style={{ color: "#0ea5a4", fontWeight: 700, textDecoration: "none" }}>Pricing</a>
      </header>

      <section style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
        <h1 style={{ margin: 0, fontSize: 34, color: "#0f172a" }}>Pay → Submit a 10‑second voice sample → Receive your wellness report</h1>
        <p style={{ color: "#334155", lineHeight: 1.6 }}>
          This service provides educational wellness insights from voice frequency patterns. It is not medical advice and does not diagnose or treat disease.
        </p>
        <ul style={{ color: "#334155", lineHeight: 1.7 }}>
          <li>Secure Stripe checkout</li>
          <li>Consent required before recording</li>
          <li>Private upload and delivery</li>
          <li>Optional upgrade path to Solex technology (affiliate link)</li>
        </ul>
      </section>

      <section id="pricing" style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>Choose your scan</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {PRICING_TIERS.map((t) => (
            <div key={t.id} style={{ border: t.popular ? "2px solid #5AB2B8" : "1px solid #e2e8f0", borderRadius: 16, padding: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{t.name}</div>
              <div style={{ marginTop: 6, color: "#334155" }}>{t.description}</div>
              <div style={{ marginTop: 12, fontSize: 34, fontWeight: 900, color: "#0f172a" }}>
                ${(t.amount_cents / 100).toFixed(0)} <span style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>CAD</span>
              </div>
              <button
                onClick={() => startCheckout(t.id)}
                disabled={loadingTier === t.id}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  background: "#5AB2B8",
                  color: "white",
                  fontWeight: 800,
                  opacity: loadingTier === t.id ? 0.7 : 1,
                }}
              >
                {loadingTier === t.id ? "Redirecting…" : "Pay & Continue"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid #e2e8f0", color: "#64748b", fontSize: 13 }}>
        <strong>Disclaimer:</strong> Educational wellness tool only. Not medical advice, diagnosis, treatment, or cure.
      </footer>
    </div>
  );
}
