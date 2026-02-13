import crypto from "crypto";

const COOKIE_NAME = "bh_admin";

function secret() {
  return process.env.JWT_SECRET || "dev_insecure_secret_change_me";
}

export function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verify(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function getCookie(req) {
  const raw = req.headers.cookie || "";
  const parts = raw.split(";").map((p) => p.trim());
  const hit = parts.find((p) => p.startsWith(COOKIE_NAME + "="));
  if (!hit) return null;
  return decodeURIComponent(hit.split("=").slice(1).join("="));
}

export function setCookie(res, value) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax`);
}

export function clearCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
}

export function isAuthed(req) {
  const token = getCookie(req);
  const data = verify(token);
  return Boolean(data?.role === "admin");
}
