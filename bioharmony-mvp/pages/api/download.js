import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const kind = req.query.kind;
  const file = req.query.file;
  if (!kind || !file) return res.status(400).send("Missing kind/file");

  const baseDir =
    kind === "voice"
      ? path.join(process.cwd(), "storage", "voice")
      : kind === "reports"
      ? path.join(process.cwd(), "storage", "reports")
      : null;

  if (!baseDir) return res.status(400).send("Invalid kind");

  const safe = path.basename(String(file));
  const full = path.join(baseDir, safe);
  if (!fs.existsSync(full)) return res.status(404).send("Not found");

  const ext = path.extname(full).toLowerCase();
  const ct =
    ext === ".pdf" ? "application/pdf" :
    ext === ".mp3" ? "audio/mpeg" :
    ext === ".wav" ? "audio/wav" :
    ext === ".webm" ? "audio/webm" :
    "application/octet-stream";

  res.setHeader("Content-Type", ct);
  res.setHeader("Content-Disposition", `attachment; filename="${safe}"`);
  fs.createReadStream(full).pipe(res);
}
