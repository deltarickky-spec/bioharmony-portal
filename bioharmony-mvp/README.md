# BioHarmony MVP (Working Portal)

This is a **working MVP** you can run locally today:
- Landing page with 3 tiers (CAD): $33 / $77 / $133
- Stripe Checkout (or demo mode if Stripe keys are empty)
- Payment-gated voice submission page with consent checkbox
- Admin dashboard: download voice + upload PDF/MP3 to deliver results
- Optional email notifications via SendGrid (logs to server if not configured)

## Run locally

```bash
cd bioharmony-mvp
cp .env.example .env
npm install
npm run dev
```

Open:
- Client: http://localhost:3000
- Admin login: http://localhost:3000/admin

## Stripe
Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_APP_URL` in `.env`.
This app creates Checkout Sessions on-demand (no products needed).

## Emails
Set SendGrid vars to enable real email:
- SENDGRID_API_KEY
- SENDGRID_FROM_EMAIL
- ADMIN_EMAIL

If not set, emails will be printed to the server console.

## Storage
Uploads are stored locally in:
- `storage/voice/` (voice samples)
- `storage/reports/` (PDF/MP3)

For production, replace `/lib/storage.js` + API endpoints with S3/R2 signed URLs.

## Security note (MVP)
- `/api/download` is intentionally simple for development.
- For production, use **signed URLs** and restrict downloads by user identity/token.
