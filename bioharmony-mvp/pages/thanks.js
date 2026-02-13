import { useMemo } from "react";

export default function Thanks() {
  const params = useMemo(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""), []);
  const submission_id = params.get("submission_id");
  const solex = process.env.NEXT_PUBLIC_SOLEX_LINK || "https://shop.solexnation.com/kathyowens/home";

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial", padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>✅ Submitted — you’re all set</h1>
      <p style={{ color: "#334155", lineHeight: 1.6 }}>
        We’ve received your voice sample. You’ll receive your PDF + MP3 delivery email after the scan is processed.
      </p>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 16, background: "#f8fafc" }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Your submission ID</div>
        <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{submission_id || "(missing)"}</div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: 900 }}>Want to apply your credit toward your own scanner?</div>
          <p style={{ color: "#334155", lineHeight: 1.6 }}>
            If you decide to purchase through this button, it routes via Kathy’s Solex referral page so she receives credit/commission.
          </p>
          <a
            href={solex}
            target="_blank"
            rel="noreferrer"
            style={{ display: "inline-block", padding: "12px 14px", borderRadius: 12, background: "#5AB2B8", color: "white", fontWeight: 900, textDecoration: "none" }}
          >
            Apply my credit at Solex →
          </a>
        </div>
      </div>

      <footer style={{ marginTop: 18, color: "#64748b", fontSize: 13 }}>
        Educational wellness tool only. Not medical advice.
      </footer>
    </div>
  );
}
