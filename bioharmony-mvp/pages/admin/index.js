import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      window.location.href = "/admin/dashboard";
    } catch (e2) {
      alert(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial", padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Admin Login</h1>
      <form onSubmit={login} style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 16, background: "#f8fafc" }}>
        <label>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }}
          />
        </label>
        <button
          disabled={loading}
          style={{ width: "100%", marginTop: 12, padding: "12px 14px", borderRadius: 12, border: "none", background: "#0f172a", color: "white", fontWeight: 900 }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
