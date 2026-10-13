// notify.ts — Sends an email via Mailcow SMTP and (optionally) a Telegram
// message when a new draft is ready for review. Mailcow is the local SMTP
// relay (mail.cleida.com.co); Telegram is optional and silent-skipped if
// env vars are missing.

import type { Draft } from './generate.js';
import nodemailer from 'nodemailer';

interface NotifyArgs {
  draft: Draft;
  locale: 'es' | 'en' | 'pt';
  slug: string;
  previewUrl: string; // absolute URL the human can click
}

const MAILCOW_HOST = process.env.MAILCOW_HOST || 'mail.cleida.com.co';
const MAILCOW_PORT = Number(process.env.MAILCOW_PORT || 465);
const MAILCOW_USER = process.env.MAILCOW_USER || 'andres@andresmorales.com.co';

function buildApproveUrl(slug: string, locale: string): string {
  const base = process.env.PREVIEW_BASE_URL || 'http://localhost:3006';
  const token = process.env.DRAFTS_ADMIN_TOKEN;
  // Deep link: ?token= saves to localStorage, ?open= auto-opens the modal.
  // Landing in the modal means one click from email → reading the post.
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  params.set('open', slug);
  params.set('locale', locale);
  return `${base}/${locale}/drafts?${params.toString()}`;
}

export async function notify(args: NotifyArgs): Promise<void> {
  await sendMailcowEmail(args);
  await sendTelegram(args);
}

async function sendMailcowEmail(args: NotifyArgs): Promise<void> {
  const pass = process.env.MAILCOW_PASSWORD;
  if (!pass) {
    console.warn('[notify] MAILCOW_PASSWORD not set. Skipping email.');
    return;
  }

  const toEmail = process.env.BRIEF_TO_EMAIL || 'info@andresmorales.com.co';
  const transporter = nodemailer.createTransport({
    host: MAILCOW_HOST,
    port: MAILCOW_PORT,
    secure: MAILCOW_PORT === 465,
    auth: { user: MAILCOW_USER, pass },
  });

  const approveUrl = buildApproveUrl(args.slug, args.locale);
  const subject = `[Blog] Nuevo borrador esperando aprobación: ${args.draft.frontmatter.title}`;
  const html = `
    <h2>Nuevo borrador esperando aprobación</h2>
    <p><strong>Título:</strong> ${args.draft.frontmatter.title}</p>
    <p><strong>Slug:</strong> ${args.slug} (${args.locale})</p>
    <p><strong>Descripción:</strong> ${args.draft.frontmatter.description}</p>
    <p><strong>Fuente:</strong> <a href="${args.draft.frontmatter.source}">${args.draft.frontmatter.sourceTitle}</a></p>
    <hr>
    <p style="margin-top:24px"><a href="${approveUrl}" style="display:inline-block;padding:12px 24px;background:#f96e03;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Revisar y aprobar →</a></p>
    <p style="color:#666;font-size:12px;margin-top:24px">El link te lleva a la cola de borradores donde puedes leer el draft completo, editarlo inline, aprobarlo (lo mueve a <code>content/blog/</code>) o descartarlo. El link incluye tu token personal — no lo compartas.</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Andrés Morales Blog Pipeline" <${MAILCOW_USER}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`[notify] Email sent to ${toEmail} via Mailcow.`);
  } catch (err) {
    console.warn(`[notify] Mailcow send failed: ${(err as Error).message}`);
  }
}

async function sendTelegram(args: NotifyArgs): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.log('[notify] Telegram env not set. Skipping.');
    return;
  }

  const approveUrl = buildApproveUrl(args.slug, args.locale);
  const text =
    `📝 *Nuevo borrador: ${args.draft.frontmatter.title}*\n\n` +
    `${args.draft.frontmatter.description}\n\n` +
    `Fuente: ${args.draft.frontmatter.sourceTitle}\n\n` +
    `✅ [Revisar y aprobar](${approveUrl})`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      },
    );
    if (!res.ok) {
      const t = await res.text();
      console.warn(`[notify] Telegram returned ${res.status}: ${t.slice(0, 200)}`);
    } else {
      console.log('[notify] Telegram message sent.');
    }
  } catch (err) {
    console.warn(`[notify] Telegram fetch failed: ${(err as Error).message}`);
  }
}