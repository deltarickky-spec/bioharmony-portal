import sgMail from "@sendgrid/mail";

function isConfigured() {
  return Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
}

export async function sendEmail({ to, subject, text, html }) {
  if (!isConfigured()) {
    // Dev fallback: log to server output
    console.log("[EMAIL - not configured]", { to, subject, text });
    return;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text,
    html,
  });
}

export function renderWelcomeEmail({ name, recordUrl }) {
  const subject = "Action Required: Record Your Voice Sample for BioHarmony Solutions";
  const text = `Hi ${name || "there"},\n\nThanks for your purchase. Please record your 10-second voice sample here:\n${recordUrl}\n\nFind a quiet space and speak naturally for 10 seconds.\n\n— BioHarmony Solutions`;
  return { subject, text };
}

export function renderReportReadyEmail({ name, downloadUrl }) {
  const subject = "Your BioHarmony Wellness Report is Ready!";
  const text = `Hi ${name || "there"},\n\nYour report is ready. Download it here:\n${downloadUrl}\n\nReminder: This is an educational wellness tool and not medical advice.\n\n— BioHarmony Solutions`;
  return { subject, text };
}

export function renderUpsellEmail({ name, solexLink }) {
  const subject = "Your Scan Credit: Apply it toward your own scanner";
  const text = `Hi ${name || "there"},\n\nIf you'd like to scan at home, you can apply your credit toward your own system here:\n${solexLink}\n\n— BioHarmony Solutions`;
  return { subject, text };
}
