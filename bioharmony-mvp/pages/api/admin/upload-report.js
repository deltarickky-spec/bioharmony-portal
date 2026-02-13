import multer from "multer";
import path from "path";
import { isAuthed } from "../../lib/auth";
import { reportPath, getPublicDownloadUrl } from "../../lib/storage";
import { getSubmission, updateSubmission } from "../../lib/store";
import { sendEmail, renderReportReadyEmail, renderUpsellEmail } from "../../lib/email";

export const config = { api: { bodyParser: false } };

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.dirname(reportPath("x"))),
  filename: (req, file, cb) => {
    const safe = `${Date.now()}_${file.originalname || "file"}`.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, safe);
  },
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

function run(req, res, fn) {
  return new Promise((resolve, reject) => fn(req, res, (r) => (r instanceof Error ? reject(r) : resolve(r))));
}

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await run(req, res, upload.fields([{ name: "pdf", maxCount: 1 }, { name: "mp3", maxCount: 1 }]));
    const { submission_id } = req.body || {};
    if (!submission_id) return res.status(400).json({ error: "Missing submission_id" });

    const sub = getSubmission(submission_id);
    if (!sub) return res.status(404).json({ error: "Unknown submission_id" });

    const pdf = req.files?.pdf?.[0];
    const mp3 = req.files?.mp3?.[0];

    if (!pdf) return res.status(400).json({ error: "PDF required" });

    const patch = {
      status: "complete",
      report_pdf: pdf.filename,
      report_mp3: mp3 ? mp3.filename : null,
      completed_at: Date.now(),
    };
    updateSubmission(submission_id, patch);

    const pdfUrl = getPublicDownloadUrl("reports", pdf.filename);
    const mp3Url = mp3 ? getPublicDownloadUrl("reports", mp3.filename) : null;

    const { subject, text } = renderReportReadyEmail({ name: sub.name, downloadUrl: pdfUrl });
    await sendEmail({ to: sub.email, subject, text });

    // Optional upsell email is left as manual scheduling in MVP; you can run a cron later.
    const solex = process.env.SOLEX_AFFILIATE_LINK || "https://shop.solexnation.com/kathyowens/home";
    const upsell = renderUpsellEmail({ name: sub.name, solexLink: solex });
    console.log("[UPS ELL SCHEDULE - MVP]", upsell);

    return res.status(200).json({ ok: true, pdfUrl, mp3Url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}
