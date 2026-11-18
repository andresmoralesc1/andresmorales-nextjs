import { NextRequest, NextResponse } from 'next/server';
import { auditProspectWebsite, fetchSiteScreenshot, detectLanguageFromCountry } from '@/lib/prospect-auditor';
import { upsertProspect, generateAuditSlug } from '@/lib/prospect-store';
import { createLead } from '@/lib/crm-store';
import { sendTelegramNotification } from '@/lib/telegram';
import { sendWhatsAppMessage } from '@/lib/evolution';
import { sendMail } from '@/lib/email';
import { buildBrandedEmailHtml, escapeHtml } from '@/lib/email-template';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Formato JSON inválido' }, { status: 400 });
  }

  const { url, name, country = 'Colombia', city = 'Principal', phone, email, lang } = body || {};

  if (!url || typeof url !== 'string' || !url.trim()) {
    return NextResponse.json({ error: 'La URL del sitio web es obligatoria' }, { status: 400 });
  }

  let cleanUrl = url.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }
  cleanUrl = cleanUrl.replace(/\/+$/, '');

  let hostname = '';
  try {
    const parsed = new URL(cleanUrl);
    hostname = parsed.hostname.replace(/^www\./, '');
  } catch {
    return NextResponse.json({ error: 'URL inválida. Por favor ingresa un dominio válido.' }, { status: 400 });
  }

  const prospectName = (name && name.trim()) || hostname.split('.')[0].toUpperCase();
  const auditSlug = generateAuditSlug(prospectName);

  // Client's language is determined by their chosen route or native country
  const clientLang: 'es' | 'en' | 'pt' =
    lang && ['es', 'en', 'pt'].includes(lang)
      ? (lang as 'es' | 'en' | 'pt')
      : detectLanguageFromCountry(country);

  try {
    // 1. Run Google Cloud audit and screenshot in parallel in client's native language
    const [auditRes, fallbackScreenshotUrl] = await Promise.all([
      auditProspectWebsite(
        prospectName,
        cleanUrl,
        country,
        city,
        'Lead Web',
        auditSlug,
        clientLang
      ),
      fetchSiteScreenshot(cleanUrl, auditSlug),
    ]);

    const effectiveScreenshot = auditRes.screenshotUrl || fallbackScreenshotUrl;
    const perfScore = auditRes.audit.lighthouse?.performanceScore ?? auditRes.audit.score;
    const lcp = auditRes.audit.lighthouse?.lcp || 'N/A';
    const fcp = auditRes.audit.lighthouse?.fcp || 'N/A';
    const tbt = auditRes.audit.lighthouse?.tbt || 'N/A';

    // 2. Upsert prospect into prospect-store with their language
    const savedProspect = upsertProspect({
      name: prospectName,
      website: cleanUrl,
      country,
      city,
      lang: clientLang,
      category: 'Lead Web',
      phone: phone?.trim() || auditRes.extractedPhone,
      email: email?.trim() || auditRes.extractedEmail,
      auditSlug,
      status: 'audited',
      screenshotUrl: effectiveScreenshot,
      audit: auditRes.audit,
      pitch: auditRes.pitch,
    });

    const reportUrl = `https://andresmorales.com.co/${clientLang}/audit/${savedProspect.auditSlug || auditSlug}`;

    // 3. Register lead in CRM if contact details provided
    if (phone?.trim() || email?.trim() || name?.trim()) {
      try {
        createLead({
          name: name?.trim() || prospectName,
          email: email?.trim() || '',
          phone: phone?.trim() || '',
          company: prospectName,
          service: 'Auditoría Web & Optimización',
          source: 'manual',
          status: 'new',
          message: `Lead generado a través de la Auditoría Pública Google Cloud para ${cleanUrl}. Score móvil: ${perfScore}/100 (LCP: ${lcp}, FCP: ${fcp}, TBT: ${tbt}). Reporte: ${reportUrl}`,
          notes: [
            {
              id: `note_${Date.now()}`,
              text: `Auditoría Google Cloud completada. Score: ${perfScore}/100. Enlace confidencial: ${reportUrl}`,
              createdAt: new Date().toISOString(),
            },
          ],
        });
      } catch (crmErr) {
        console.warn('[audit-request] Error saving CRM lead:', crmErr);
      }
    }

    // 4. Send Instant Telegram Alert to Andrés
    try {
      const telegramMsg = `🚀 <b>¡Nuevo Diagnóstico Web Solicitado!</b>\n\n` +
        `🏢 <b>Empresa:</b> ${escapeHtml(prospectName)}\n` +
        `🌐 <b>Sitio:</b> ${escapeHtml(cleanUrl)}\n` +
        `⚡ <b>Score Google Cloud:</b> <b>${perfScore}/100</b>\n` +
        `⏱️ <b>LCP:</b> ${lcp} | <b>FCP:</b> ${fcp}\n` +
        `📱 <b>WhatsApp:</b> ${escapeHtml(phone?.trim() || 'No proporcionado')}\n` +
        `✉️ <b>Email:</b> ${escapeHtml(email?.trim() || 'No proporcionado')}\n` +
        `📍 <b>País:</b> ${escapeHtml(country)}\n\n` +
        `🔗 <a href="${reportUrl}">Ver Reporte Interactivo</a>`;

      await sendTelegramNotification(telegramMsg, {
        parseMode: 'HTML',
        buttons: [[{ text: '📊 Abrir Reporte Web', url: reportUrl }]],
      });
    } catch (tgErr) {
      console.warn('[audit-request] Telegram notification failed:', tgErr);
    }

    const userLang = detectLanguageFromCountry(country);

    // 5. Automated WhatsApp follow-up via Evolution API if phone was provided
    if (phone && phone.trim()) {
      const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.length === 10 && cleanPhone.startsWith('3') ? `57${cleanPhone}` : cleanPhone;

      if (formattedPhone.length >= 10) {
        try {
          let waText = '';
          if (userLang === 'en') {
            waText = `Hi ${name ? name.trim() : 'there'}, this is Andrés Morales 👋\n\n` +
              `I just generated the 360° Performance, UX/UI & AI Automation Diagnostic for your website (${cleanUrl}):\n\n` +
              `⚡ *Google Cloud Speed:* ${perfScore}/100 (LCP: ${lcp})\n` +
              `🎨 *Mobile UX/UI:* Friction analysis & conversion leaks identified\n` +
              `🤖 *AI Operations Plan:* Strategy to automate quotes and client qualification 24/7\n\n` +
              `You can access your full confidential brief and recommendations here:\n` +
              `${reportUrl}\n\n` +
              `Feel free to reply if you would like to discuss how to streamline your operation and scale sales. Best regards!`;
          } else if (userLang === 'pt') {
            waText = `Olá ${name ? name.trim() : 'amigo/a'}, aqui é o Andrés Morales 👋\n\n` +
              `Acabei de gerar o Diagnóstico 360° de Performance, UX/UI e Automação IA para o seu site (${cleanUrl}):\n\n` +
              `⚡ *Performance Google Cloud:* ${perfScore}/100 (LCP: ${lcp})\n` +
              `🎨 *Design Mobile UX/UI:* Análise de atrito no checkout e pontos de fuga\n` +
              `🤖 *Plano de Automação IA:* Estratégia para orçamentos e atendimento 24/7\n\n` +
              `Você pode conferir o relatório confidencial completo e o plano de ação aqui:\n` +
              `${reportUrl}\n\n` +
              `Fico à disposição se quiser conversar sobre como acelerar as vendas e eliminar tarefas manuais. Um abraço!`;
          } else {
            waText = `Hola ${name ? name.trim() : 'amigo/a'}, te habla Andrés Morales 👋\n\n` +
              `Acabo de generar el Diagnóstico 360° de Rendimiento, UX/UI y Automatización IA para tu sitio web (${cleanUrl}):\n\n` +
              `⚡ *Rendimiento Google Cloud:* ${perfScore}/100 (LCP: ${lcp})\n` +
              `🎨 *Diseño Móvil UX/UI:* Puntos de fricción en compra y fugas de conversión\n` +
              `🤖 *Plan de Automatización IA:* Estrategia para cotizaciones y atención 24/7\n\n` +
              `He preparado un informe interactivo y confidencial con el dictamen completo. Puedes revisarlo aquí:\n` +
              `${reportUrl}\n\n` +
              `Quedo a tu disposición por si deseas revisar alternativas para acelerar las ventas y la operación de tu negocio. ¡Un saludo!`;
          }

          await sendWhatsAppMessage({
            number: formattedPhone,
            text: waText,
          });
        } catch (waErr) {
          console.warn('[audit-request] WhatsApp auto-send failed:', waErr);
        }
      }
    }

    // 6. Automated Email notification if email was provided
    if (email && email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      try {
        let emailSubject = '';
        let emailBadge = '';
        let emailTitle = '';
        let emailSubtitle = '';
        let emailIntro = '';
        let btnText = '';
        let textSummary = '';

        if (userLang === 'en') {
          emailSubject = `⚡ 360° Audit & AI Automation Blueprint: ${prospectName} (${perfScore}/100)`;
          emailBadge = '⚡ 360° DIAGNOSTIC · ANDRÉS MORALES';
          emailTitle = `Technical, UX/UI & AI Diagnostic for ${cleanUrl}`;
          emailSubtitle = `Google Cloud Speed: ${perfScore}/100 · Mobile UX/UI · AI Automation Plan`;
          emailIntro = `Hi <strong>${escapeHtml(name?.trim() || 'team')}</strong>, your 360° comprehensive audit has been generated via Google Cloud PageSpeed API and our design architecture engine.`;
          btnText = 'Open Interactive 360° Report →';
          textSummary = `Hi ${name || 'team'},\n\nYour 360° diagnostic for ${cleanUrl} is ready. Google Cloud score: ${perfScore}/100.\n\nView the full interactive report at: ${reportUrl}\n\nAndrés Morales`;
        } else if (userLang === 'pt') {
          emailSubject = `⚡ Diagnóstico 360° & Plano de Automação: ${prospectName} (${perfScore}/100)`;
          emailBadge = '⚡ DIAGNÓSTICO 360° · ANDRÉS MORALES';
          emailTitle = `Diagnóstico Técnico, UX/UI e IA para ${cleanUrl}`;
          emailSubtitle = `Performance Google: ${perfScore}/100 · Design Mobile · Plano com IA`;
          emailIntro = `Olá <strong>${escapeHtml(name?.trim() || 'equipe')}</strong>, seu diagnóstico 360° foi gerado com sucesso via Google Cloud PageSpeed e nosso motor de arquitetura.`;
          btnText = 'Ver Relatório Interativo 360° →';
          textSummary = `Olá ${name || 'equipe'},\n\nSeu diagnóstico 360° para ${cleanUrl} está pronto. Score Google: ${perfScore}/100.\n\nConfira o relatório completo em: ${reportUrl}\n\nAndrés Morales`;
        } else {
          emailSubject = `⚡ Diagnóstico 360° & Plan de Automatización: ${prospectName} (${perfScore}/100)`;
          emailBadge = '⚡ DIAGNÓSTICO 360° · ANDRÉS MORALES';
          emailTitle = `Diagnóstico Técnico, UX/UI & IA para ${cleanUrl}`;
          emailSubtitle = `Velocidad Google Cloud: ${perfScore}/100 · Diseño Móvil · Automatización con IA`;
          emailIntro = `Hola <strong>${escapeHtml(name?.trim() || 'equipo')}</strong>, hemos generado con éxito el diagnóstico 360° para tu negocio mediante la API de Google Cloud y nuestro motor de análisis de conversión.`;
          btnText = 'Ver Informe Técnico Interactivo 360° →';
          textSummary = `Hola ${name || 'equipo'},\n\nTu diagnóstico 360° para ${cleanUrl} está listo. Score Google Cloud: ${perfScore}/100.\n\nPuedes ver el reporte completo en: ${reportUrl}\n\nAndrés Morales`;
        }

        const emailHtml = buildBrandedEmailHtml({
          badge: emailBadge,
          title: emailTitle,
          subtitle: emailSubtitle,
          contentHtml: `
            <p style="margin:0 0 16px 0;font-size:15px;color:#2B2520;line-height:1.6;">
              ${emailIntro}
            </p>
            <div style="background:#F9F8F6;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #f96e03;">
              <p style="margin:0 0 8px 0;font-size:14px;color:#555;">Puntuación de Rendimiento Google Cloud:</p>
              <p style="margin:0 0 12px 0;font-size:32px;font-weight:bold;color:#0A0D14;">${perfScore} / 100</p>
              <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">
                • Largest Contentful Paint (LCP): <strong>${lcp}</strong><br/>
                • First Contentful Paint (FCP): <strong>${fcp}</strong><br/>
                • Total Blocking Time (TBT): <strong>${tbt}</strong>
              </p>
            </div>
            <div style="background:#FFFFFF;border:1px solid #E5E0DB;border-radius:12px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 6px 0;font-size:13px;font-weight:bold;color:#1E1810;">Pilares del Análisis 360°:</p>
              <p style="margin:0;font-size:13px;color:#666;line-height:1.5;">
                1. ⚡ <strong>Velocidad Google Cloud:</strong> Medición en red móvil 4G.<br/>
                2. 🎨 <strong>Auditoría UX/UI Móvil:</strong> Detección de puntos de fuga en checkout y fricción de compra.<br/>
                3. 🤖 <strong>Plan de Automatización IA:</strong> Estrategia para cotizaciones automáticas y atención 24/7 en WhatsApp.
              </p>
            </div>
            <p style="margin:24px 0 0 0;text-align:center;">
              <a href="${reportUrl}" style="display:inline-block;background:#f96e03;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:8px;">
                ${btnText}
              </a>
            </p>
          `,
          tableRows: [
            { label: 'Sitio Web', value: cleanUrl },
            { label: 'Score Google', value: `${perfScore}/100` },
            { label: 'Enlace Privado', value: reportUrl },
          ],
        });

        await sendMail({
          to: email.trim(),
          toName: name?.trim() || prospectName,
          subject: emailSubject,
          html: emailHtml,
          text: textSummary,
        });
      } catch (mailErr) {
        console.warn('[audit-request] Email auto-send failed:', mailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      slug: savedProspect.auditSlug || auditSlug,
      lang: clientLang,
      url: `/${clientLang}/audit/${savedProspect.auditSlug || auditSlug}`,
      score: perfScore,
      lcp,
      fcp,
    });
  } catch (err: any) {
    console.error('[audit-request] Audit execution error:', err);
    return NextResponse.json(
      { error: err.message || 'No se pudo completar el análisis del sitio web. Verifica que la URL esté activa.' },
      { status: 500 }
    );
  }
}
