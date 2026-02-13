import multer from "multer";
import { newId, createSubmission, getOrderBySessionId } from "../../lib/store";
import { voicePath } from "../../lib/storage";
import { sendEmail } from "../../lib/email";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, require("path").dirname(voicePath("x"))),
    filename: (req, file, cb) => {
      const safe = `${Date.now()}_${file.originalname || "voice.webm"}`.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, safe);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await runMiddleware(req, res, upload.single("voice"));

    const { session_id, name, email, consent } = req.body || {};
    if (!session_id) return res.status(400).json({ error: "Missing session_id" });
    if (!name || !email) return res.status(400).json({ error: "Missing name/email" });
    if (String(consent) !== "true") return res.status(400).json({ error: "Consent required" });
    if (!req.file) return res.status(400).json({ error: "Missing voice file" });

    const order = getOrderBySessionId(session_id);
    if (!order) return res.status(404).json({ error: "Unknown order/session_id" });

    const submission_id = newId("sub");
    createSubmission({
      id: submission_id,
      order_session_id: session_id,
      name,
      email,
      consent: true,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
      voice_file: req.file.filename,
      voice_mime: req.file.mimetype,
      status: "pending",
      created_at: Date.now(),
    });

    // Notify admin + client (email is optional; logs in dev)
    const admin = process.env.ADMIN_EMAIL;
    if (admin) {
      await sendEmail({
        to: admin,
        subject: `New voice sample: ${name}`,
        text: `A new voice submission is ready.\n\nSubmission: ${submission_id}\nName: ${name}\nEmail: ${email}\nSession: ${session_id}\n\nLog into /admin to download.`,
      });
    }
    await sendEmail({
      to: email,
      subject: "BioHarmony — Voice Sample Received",
      text: `Hi ${name},\n\nWe received your voice sample. You'll get your PDF + MP3 delivery email once your report is uploaded.\n\n— BioHarmony Solutions`,
    });

    return res.status(200).json({ ok: true, submission_id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Internal error" });
  }
}
