// Reusable, responsive HTML email design system aligned with andresmorales.com.co
// Features: Logo header, warm architectural palette (#1E1810, #f96e03, #FAF7F4),
// clean typography, mobile-first table, CTA buttons, and verified Mailcow footer.

export function escapeHtml(s: string): string {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface BrandedEmailOptions {
  badge?: string; // e.g. "⚡ BRIEF WEB EXPRESS", "📑 PROPUESTA FORMAL", "✉️ CONTACTO"
  title: string;
  subtitle?: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  replyToEmail?: string;
  footerNote?: string;
  tableRows?: Array<{ label: string; value?: string | number | null | undefined; isHtml?: boolean }>;
}

export function renderEmailTable(
  rows: Array<{ label: string; value?: string | number | null | undefined; isHtml?: boolean }>
): string {
  const activeRows = rows.filter((r) => r.value !== undefined && r.value !== null && String(r.value).trim() !== '');
  if (activeRows.length === 0) return '';

  const trs = activeRows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 14px;font-weight:600;color:#1E1810;background:#FAF7F4;border-bottom:1px solid #EFEAE6;width:34%;font-size:12.5px;vertical-align:top;">
          ${escapeHtml(r.label)}
        </td>
        <td style="padding:10px 14px;color:#4A423D;background:#FFFFFF;border-bottom:1px solid #EFEAE6;font-size:13px;vertical-align:top;line-height:1.5;">
          ${r.isHtml ? String(r.value) : escapeHtml(String(r.value))}
        </td>
      </tr>`
    )
    .join('');

  return `
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0;margin:20px 0;border:1px solid #EFEAE6;border-radius:12px;overflow:hidden;">
      <tbody>${trs}</tbody>
    </table>
  `;
}

export function buildBrandedEmailHtml(opts: BrandedEmailOptions): string {
  const badgeHtml = opts.badge
    ? `<span style="display:inline-block;background:rgba(249,110,3,0.15);border:1px solid rgba(249,110,3,0.3);color:#f96e03;font-size:10.5px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:3px 9px;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${escapeHtml(opts.badge)}</span>`
    : '';

  const tableHtml = opts.tableRows ? renderEmailTable(opts.tableRows) : '';

  let ctaBlock = '';
  if (opts.ctaText && opts.ctaUrl) {
    ctaBlock = `
      <div style="text-align:center;margin:32px 0 16px 0;">
        <a href="${escapeHtml(opts.ctaUrl)}" target="_blank" style="display:inline-block;background:#f96e03;color:#1E1810;font-weight:700;font-size:13.5px;padding:13px 28px;border-radius:12px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;box-shadow:0 2px 8px rgba(249,110,3,0.25);">
          ${escapeHtml(opts.ctaText)} →
        </a>
        ${
          opts.secondaryCtaText && opts.secondaryCtaUrl
            ? `
          <div style="margin-top:12px;">
            <a href="${escapeHtml(opts.secondaryCtaUrl)}" target="_blank" style="display:inline-block;background:#FAF7F4;border:1px solid #E0DAD5;color:#1E1810;font-weight:600;font-size:12.5px;padding:9px 20px;border-radius:10px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              ${escapeHtml(opts.secondaryCtaText)}
            </a>
          </div>`
            : ''
        }
      </div>
    `;
  }

  const replyToBlock = opts.replyToEmail
    ? `
    <p style="margin:20px 0 0 0;font-size:12px;color:#786F68;">
      Para responder a este mensaje directamente, escribe a: 
      <a href="mailto:${escapeHtml(opts.replyToEmail)}" style="color:#f96e03;text-decoration:none;font-weight:600;">${escapeHtml(opts.replyToEmail)}</a>
    </p>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F0EB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <div style="background-color:#F4F0EB;padding:32px 12px;">
    <table cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;width:100%;background-color:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #E5DFD9;box-shadow:0 4px 20px rgba(30,24,16,0.06);">
      
      <!-- HEADER BRAND BLOCK -->
      <tr>
        <td style="background-color:#1E1810;padding:32px 32px 28px 32px;color:#FFFFFF;">
          <table cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="vertical-align:middle;text-align:left;">
                <a href="https://andresmorales.com.co" target="_blank" style="text-decoration:none;display:inline-block;">
                  <img src="https://andresmorales.com.co/logo-wp.png" alt="Andrés Morales" height="32" style="height:32px;width:auto;display:block;border:0;outline:none;" />
                </a>
              </td>
              <td style="vertical-align:middle;text-align:right;">
                ${badgeHtml}
              </td>
            </tr>
          </table>

          <div style="margin-top:22px;">
            <h1 style="margin:0;font-size:21px;font-weight:700;color:#FFFFFF;line-height:1.3;letter-spacing:-0.01em;">
              ${escapeHtml(opts.title)}
            </h1>
            ${
              opts.subtitle
                ? `<p style="margin:8px 0 0 0;font-size:13px;color:#D5CEC7;line-height:1.5;">${escapeHtml(opts.subtitle)}</p>`
                : ''
            }
          </div>
        </td>
      </tr>

      <!-- BODY CONTENT BLOCK -->
      <tr>
        <td style="padding:32px 32px 28px 32px;color:#2B2520;font-size:14.5px;line-height:1.65;">
          ${opts.contentHtml}
          ${tableHtml}
          ${ctaBlock}
          ${replyToBlock}
        </td>
      </tr>

      <!-- FOOTER BLOCK -->
      <tr>
        <td style="background-color:#FAF7F4;border-top:1px solid #EFEAE6;padding:26px 32px;color:#786F68;font-size:12px;line-height:1.6;">
          <table cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="vertical-align:top;padding-bottom:12px;">
                <div style="font-weight:700;color:#1E1810;font-size:13px;margin-bottom:2px;">
                  Andrés Morales
                </div>
                <div style="color:#786F68;font-size:11.5px;">
                  Senior Full Stack & AI Automation Engineer · Medellín & Bogotá, Colombia
                </div>
              </td>
            </tr>
            <tr>
              <td style="vertical-align:top;padding-top:8px;border-top:1px solid #EAE4DF;">
                <div style="font-size:11.5px;color:#786F68;">
                  <a href="https://andresmorales.com.co" target="_blank" style="color:#f96e03;text-decoration:none;font-weight:600;">Sitio Web</a>
                  <span style="color:#D0C8C2;margin:0 6px;">·</span>
                  <a href="https://calendar.app.google/QvUUb5xu4927P95a8" target="_blank" style="color:#1E1810;text-decoration:none;font-weight:600;">Agendar 30 min</a>
                  <span style="color:#D0C8C2;margin:0 6px;">·</span>
                  <a href="https://wa.me/573161482507" target="_blank" style="color:#1E1810;text-decoration:none;font-weight:600;">WhatsApp Oficial</a>
                  <span style="color:#D0C8C2;margin:0 6px;">·</span>
                  <a href="mailto:info@andresmorales.com.co" style="color:#1E1810;text-decoration:none;font-weight:600;">info@andresmorales.com.co</a>
                </div>
                ${
                  opts.footerNote
                    ? `<div style="margin-top:10px;font-size:11px;color:#A09890;">${escapeHtml(opts.footerNote)}</div>`
                    : `<div style="margin-top:10px;font-size:10.5px;color:#A09890;">Enviado desde el servidor local seguro Mailcow de Andrés Morales.</div>`
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}
