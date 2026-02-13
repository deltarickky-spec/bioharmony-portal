import { isAuthed } from "../../lib/auth";
import { listSubmissions } from "../../lib/store";

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  return res.status(200).json({ submissions: listSubmissions() });
}
