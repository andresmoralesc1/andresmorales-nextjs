import nodemailer, { type Transporter } from 'nodemailer';

// Self-hosted Mailcow SMTP — single shared transporter, lazy-init.
//
// Why Mailcow instead of Brevo:
//   - Brevo API key in the global secrets file is rotated/401 (see
//     brevo-api-key-status memory). Mailcow is provisioned locally on
//     mail.cleida.com.co and already relays for andresmorales.com.co
//     and the cleida.com.co family (see cleida-mailcow-migration).
//   - We own the server, so a deletion request never leaves our
//     jurisdiction — strengthens GDPR Art. 28 (processor location)
//     and avoids DPA renegotiation with a third-party SaaS.
//
// Env vars (set in .env.local):
//   MAILCOW_HOST          — default `mail.cleida.com.co`
//   MAILCOW_PORT          — default `465` (SSL/TLS). 587 STARTTLS also OK.
//   MAILCOW_USER          — e.g. `info@andresmorales.com.co`
//   MAILCOW_PASSWORD      — mailbox password (the one in
//                            `~/.claude/secrets.env`, prefixed
//                            `SMTP_PASSWORD_INFO_ANDRESMORALES`)
//   MAIL_FROM_EMAIL       — optional override of the From: address
//   MAIL_FROM_NAME        — optional override of the From: display

const HOST = process.env.MAILCOW_HOST || 'mail.cleida.com.co';
const PORT = Number(process.env.MAILCOW_PORT || 465);
const USER = process.env.MAILCOW_USER || 'info@andresmorales.com.co';
const PASS = process.env.MAILCOW_PASSWORD || '';
const FROM_EMAIL = process.env.MAIL_FROM_EMAIL || USER;
const FROM_NAME = process.env.MAIL_FROM_NAME || 'Andrés Morales · Portfolio';

let cached: Transporter | null = null;

function transporter(): Transporter {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
  });
  return cached;
}

export type SendArgs = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendMail(args: SendArgs): Promise<{ messageId: string }> {
  if (!PASS) {
    // Dev / no-cred fallback. We deliberately do NOT throw here so the
    // route handler can still return 200 to the UI in environments
    // where email is not configured (preview deploys, local dev).
    // The route's emailSent flag will be false; the UI shows a
    // generic "we'll be in touch" message either way.
    // eslint-disable-next-line no-console
    console.warn('[email] MAILCOW_PASSWORD not set; would send:', {
      to: args.to,
      subject: args.subject,
    });
    return { messageId: 'dev-noop' };
  }
  const info = await transporter().sendMail({
    from: { name: FROM_NAME, address: FROM_EMAIL },
    to: args.toName ? { name: args.toName, address: args.to } : args.to,
    replyTo: args.replyTo,
    subject: args.subject,
    text: args.text,
    html: args.html,
  });
  return { messageId: info.messageId };
}

export const MAILCOW_CONFIG = { host: HOST, port: PORT, user: USER, from: FROM_EMAIL };
