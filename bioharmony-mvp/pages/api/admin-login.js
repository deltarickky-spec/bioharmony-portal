import { setCookie, sign } from "../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return res.status(500).json({ error: "Missing ADMIN_PASSWORD env var" });
  if (!password || password !== expected) return res.status(401).json({ error: "Invalid password" });

  setCookie(res, sign({ role: "admin", ts: Date.now() }));
  return res.status(200).json({ ok: true });
}
