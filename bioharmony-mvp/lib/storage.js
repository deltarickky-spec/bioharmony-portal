import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "storage");
const VOICE_DIR = path.join(ROOT, "voice");
const REPORT_DIR = path.join(ROOT, "reports");

function ensure() {
  if (!fs.existsSync(VOICE_DIR)) fs.mkdirSync(VOICE_DIR, { recursive: true });
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
}

export function voicePath(filename) {
  ensure();
  return path.join(VOICE_DIR, filename);
}

export function reportPath(filename) {
  ensure();
  return path.join(REPORT_DIR, filename);
}

export function getPublicDownloadUrl(kind, filename) {
  // In production use signed URLs. For MVP dev: simple API streaming endpoint.
  return `/api/download?kind=${encodeURIComponent(kind)}&file=${encodeURIComponent(filename)}`;
}
