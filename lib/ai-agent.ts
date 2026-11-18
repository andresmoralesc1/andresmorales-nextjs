import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ANDRES_PHONE, CALENDAR_URL, BRIEF_URL, DEFAULT_SYSTEM_PROMPT } from './ai-prompt';

export { ANDRES_PHONE, CALENDAR_URL, BRIEF_URL, DEFAULT_SYSTEM_PROMPT };

const execFileAsync = promisify(execFile);

export interface AgentReplyResult {
  reply: string;
  wantsHuman: boolean;
  modelUsed: string;
  durationMs: number;
}

export interface ClientCrmContext {
  company?: string;
  service?: string;
  statusLabel?: string;
  briefSummary?: string;
  advisorNotes?: string[];
  followUpNote?: string;
}

const CORPORATE_WORDS = [
  'escuela', 'empresa', 's.a.s', 'sas', 'ltda', 'financiera', 'constructora',
  'tecnologia', 'tech', 'studio', 'grupo', 'agencia', 'inmobiliaria', 'oficina',
  'colombia', 'servicios', 'industria', 'tienda', 'comercio', 'distribuidora',
  'whatsapp', 'contacto',
];

/**
 * Returns a natural greeting without saying awkward things like "¡Hola Escuela!" or "¡Hola WhatsApp!"
 */
export function getCleanGreeting(customerName: string, incomingMessage?: string): { greeting: string; resolvedName: string } {
  // Check if customer explicitly introduced themselves in the text (e.g. "Mi nombre es Angie", "Soy Carlos")
  if (incomingMessage) {
    const introMatch = incomingMessage.match(/(?:mi nombre es|soy|me llamo)\s+([A-Za-zÁ-ú]{3,20})/i);
    if (introMatch && introMatch[1]) {
      const name = introMatch[1].charAt(0).toUpperCase() + introMatch[1].slice(1).toLowerCase();
      return { greeting: `¡Hola ${name}! Un gusto saludarte.`, resolvedName: name };
    }
  }

  const clean = customerName.replace(/^WhatsApp\s*\+?\d*/i, '').trim();
  const lower = clean.toLowerCase();

  // If name contains corporate/institutional keywords, use friendly impersonal greeting
  const isCorporate = CORPORATE_WORDS.some((word) => lower.includes(word));
  if (isCorporate || !clean || clean.length < 2) {
    return { greeting: '¡Hola! Un gusto saludarte.', resolvedName: customerName };
  }

  // Use person's first name
  const firstName = clean.split(' ')[0] || clean;
  return { greeting: `¡Hola ${firstName}! Un gusto saludarte.`, resolvedName: firstName };
}

/**
 * Checks for deterministic fast-path intents (rescheduling, appointment confirmation, thank you, audio)
 * Returns instant, reliable replies without calling LLM (0ms latency, zero timeout risk).
 */
export function checkQuickAcks(text: string): { reply: string; rule: string } | null {
  const t = text.toLowerCase().trim();

  // Untranscribed voice note fallback
  if (t === '[nota de voz de whatsapp]' || t.startsWith('[nota de voz de whatsapp]')) {
    return {
      reply: `¡Hola! Recibí tu nota de voz. Por este canal leo con mayor facilidad mensajes de texto; ¿me podrías contar brevemente por aquí qué proceso o proyecto buscas solucionar? O si prefieres revisarlo en vivo con Andrés, puedes elegir un espacio de 20 min aquí: ${CALENDAR_URL}`,
      rule: 'voice_note',
    };
  }

  // Reschedule / Cancel appointment
  const rescheduleTriggers = [
    'reagendar', 'cambiar fecha', 'cambiar hora', 'cancelar cita',
    'cancelar llamada', 'mover la llamada', 'mover cita', 'cambiar el horario',
    'otro horario', 'reprogramar',
  ];
  if (rescheduleTriggers.some((tr) => t.includes(tr))) {
    return {
      reply: `¡Claro que sí! Puedes modificar o elegir un nuevo espacio directamente desde el enlace de confirmación que te llegó al correo o eligiendo tu nuevo horario aquí: ${CALENDAR_URL}. ¡Quedamos atentos!`,
      rule: 'reschedule',
    };
  }

  // Appointment already confirmed by user ("Listo, ya quedó agendada", "ya agendé", etc.)
  const confirmedTriggers = [
    'quedo agendada', 'quedó agendada', 'ya agende', 'ya agendé',
    'cita agendada', 'ya quedo agendado', 'ya quedó agendado',
    'listo agendado', 'listo agendada', 'ya quedó listo', 'ya quedo listo',
  ];
  if (confirmedTriggers.some((tr) => t.includes(tr)) || (t.includes('agendad') && (t.includes('listo') || t.includes('ya')))) {
    return {
      reply: `¡Excelente! Muchísimas gracias por confirmar. Ya quedó reservado el espacio en la agenda de Andrés. Nos vemos en la videollamada para revisar todos los detalles técnicos. ¡Que tengas un excelente día!`,
      rule: 'appointment_confirmed',
    };
  }

  // Simple thank you / closing
  const thanksExact = [
    'muchas gracias', 'muchas gracias!', 'mil gracias', 'mil gracias!',
    'dale gracias', 'vale gracias', 'listo gracias', 'gracias a ti', 'ok gracias',
  ];
  if (thanksExact.includes(t) || t === 'gracias' || t === 'muchas gracias.') {
    return {
      reply: `¡Con todo el gusto! Cualquier otra duda o detalle que surja, por aquí sigo muy atento. ¡Un saludo!`,
      rule: 'simple_thanks',
    };
  }

  return null;
}

/**
 * Checks if the incoming message suggests the customer wants to speak with Andres personally
 */
export function checkWantsHuman(text: string): boolean {
  const t = text.toLowerCase();
  const triggers = [
    'hablar con andres',
    'hablar con andrés',
    'humano',
    'persona real',
    'asesor humano',
    'llámame',
    'llamame',
    'comunicar con andres',
    'comunicar con andrés',
    'atención personalizada',
    'numero directo',
    'número directo',
    'hablar con alguien',
    'asesor',
    'llamarme',
  ];
  return triggers.some((trigger) => t.includes(trigger));
}

/**
 * Normalizes text for bot loop comparison (lowercase, remove accents/emojis/punctuation, collapse spaces)
 */
function normalizeTextForBotCheck(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const BOT_LOOP_PHRASES = [
  'me confundi',
  'muchas palabras',
  'intentalo de nuevo',
  'intenta de nuevo',
  'escribe en una frase',
  'no entendi tu respuesta',
  'no logre entender',
  'no pude entender',
  'digita tu documento',
  'marca 1',
  'marca 2',
  'marca 3',
  'opcion 1',
  'opcion 2',
  'opcion 3',
  'menu principal',
  'volver al menu',
  'calificame',
  'califica nuestro servicio',
  'califica nuestra atencion',
  'como te parecio nuestra charla',
  'encuesta de satisfaccion',
  'sesion finalizada por inactividad',
  'chat finalizado por inactividad',
  'gracias por comunicarte con nuestro canal',
  'nuestro horario de atencion',
  'nuestros canales de atencion',
  'para comunicarte con un asesor presiona',
  'para comunicarte con un asesor digita',
  'para hablar con un asesor',
  'selecciona una de las siguientes opciones',
  'selecciona una opcion',
  'elige una opcion',
  'este es un canal automatizado',
];

/**
 * Detects whether the incoming message is from another automated bot or stuck in a loop.
 */
export function detectBotOrLoop(
  incomingText: string,
  previousIncomingTexts: string[] = []
): { isBot: boolean; reason?: string } {
  const norm = normalizeTextForBotCheck(incomingText);
  if (!norm) return { isBot: false };

  // 1. Check known bot phrases
  for (const phrase of BOT_LOOP_PHRASES) {
    if (norm.includes(phrase)) {
      return { isBot: true, reason: `Frase de bot detectada: "${phrase}"` };
    }
  }

  // 2. Check repetition against recent incoming client messages
  if (norm.length >= 8 && previousIncomingTexts.length > 0) {
    for (const prev of previousIncomingTexts.slice(-3)) {
      const prevNorm = normalizeTextForBotCheck(prev);
      if (prevNorm.length >= 8) {
        if (
          norm === prevNorm ||
          (norm.length > 25 && prevNorm.includes(norm)) ||
          (prevNorm.length > 25 && norm.includes(prevNorm))
        ) {
          return { isBot: true, reason: 'Mensaje repetido en bucle por el interlocutor' };
        }
      }
    }
  }

  return { isBot: false };
}

/**
 * Runs Antigravity agent CLI (`agy`) with low-latency flash model to generate response
 */
export async function generateAgentReply({
  customerName,
  customerPhone,
  incomingMessage,
  recentHistory = [],
  crmContext,
  customPrompt,
}: {
  customerName: string;
  customerPhone: string;
  incomingMessage: string;
  recentHistory?: string[];
  crmContext?: ClientCrmContext;
  customPrompt?: string;
}): Promise<AgentReplyResult> {
  const startTime = Date.now();
  const wantsHuman = checkWantsHuman(incomingMessage);

  if (wantsHuman) {
    return {
      reply: `¡Con gusto! Le acabo de avisar a Andrés Morales directamente para que se comunique contigo por este mismo chat en cuanto se desocupe. Si prefieres agendar una llamada directa de 30 min, también puedes elegir tu horario aquí: ${CALENDAR_URL}`,
      wantsHuman: true,
      modelUsed: 'rule-based-fast',
      durationMs: Date.now() - startTime,
    };
  }

  // Check deterministic quick acknowledgments (scheduling confirmation, simple thanks, audio notes)
  const quickAck = checkQuickAcks(incomingMessage);
  if (quickAck) {
    return {
      reply: quickAck.reply,
      wantsHuman: false,
      modelUsed: `rule-based-${quickAck.rule}`,
      durationMs: Date.now() - startTime,
    };
  }

  const { greeting: naturalGreeting, resolvedName } = getCleanGreeting(customerName, incomingMessage);
  const promptToUse = (customPrompt && customPrompt.trim()) ? customPrompt.trim() : DEFAULT_SYSTEM_PROMPT;

  // Build CRM context memory card (Brief, Company, Advisor notes)
  let contextSection = '';
  if (crmContext) {
    const lines: string[] = [];
    if (crmContext.company) lines.push(`• Empresa / Marca del cliente: ${crmContext.company}`);
    if (crmContext.service) lines.push(`• Servicio de interés principal: ${crmContext.service}`);
    if (crmContext.statusLabel) lines.push(`• Estado comercial en pipeline: ${crmContext.statusLabel}`);
    if (crmContext.briefSummary) lines.push(`• Requerimientos del Brief Web: ${crmContext.briefSummary}`);
    if (crmContext.followUpNote) lines.push(`• Próximo seguimiento programado: ${crmContext.followUpNote}`);
    if (crmContext.advisorNotes && crmContext.advisorNotes.length > 0) {
      lines.push(`• Notas internas del asesor (Andrés):\n  - ${crmContext.advisorNotes.join('\n  - ')}`);
    }

    if (lines.length > 0) {
      contextSection = `MEMORIA Y FICHA DEL CLIENTE EN CRM:\n${lines.join('\n')}\n(Usa esta información para responder con contexto y cercanía. No vuelvas a preguntarle cosas que ya sabemos de su brief o empresa).\n\n`;
    }
  }

  // Build conversation history (up to last 12 turns)
  const historyText = recentHistory.length > 0
    ? `HISTORIAL RECIENTE DE LA CONVERSACIÓN:\n${recentHistory.join('\n')}\n\n`
    : '';

  const fullPrompt = `${promptToUse}

${contextSection}${historyText}Cliente: "${resolvedName || customerName}" (${customerPhone})
Mensaje recibido: "${incomingMessage}"

Genera tu respuesta en WhatsApp siguiendo estrictamente las reglas (máximo 2-3 líneas, CERO precios, profesional, contextual y cálido):`;

  try {
    const { stdout, stderr } = await execFileAsync(
      '/home/telchar/.local/bin/agy',
      ['--model', 'gemini-3.8-flash-low', '--effort', 'low', '-p', fullPrompt],
      {
        timeout: 18000,
        env: {
          ...process.env,
          HOME: '/home/telchar',
          PATH: `/home/telchar/.local/bin:${process.env.PATH}`,
        },
      }
    );

    let cleanReply = stdout.trim();

    // Sanitize any internal prefixes
    cleanReply = cleanReply.replace(/^Respuesta:\s*/i, '');
    cleanReply = cleanReply.replace(/^Asistente:\s*/i, '');

    // Fallback if empty output
    if (!cleanReply) {
      cleanReply = recentHistory.length > 0
        ? `¡Entendido! Andrés revisará los detalles para darte la respuesta exacta. Si deseas revisar los puntos técnicos en llamada directa: ${CALENDAR_URL}`
        : `${naturalGreeting} Te escribe el asistente de Andrés Morales (${ANDRES_PHONE}). ¿En qué tipo de proyecto digital o automatización te gustaría que te ayudemos?`;
    }

    return {
      reply: cleanReply,
      wantsHuman: false,
      modelUsed: 'gemini-3.8-flash-low (agy)',
      durationMs: Date.now() - startTime,
    };
  } catch (err: any) {
    console.error('[AI Agent agy error]:', err?.message || err);

    // High quality graceful fallback (context-aware: does not re-greet if already in conversation)
    const fallbackReply = recentHistory.length > 0
      ? `¡Perfecto! Quedo muy atento. Si necesitas coordinar la videollamada diagnóstica de 30 min con Andrés, puedes seleccionar tu espacio aquí: ${CALENDAR_URL}`
      : `${naturalGreeting} Soy el asistente de Andrés Morales (${ANDRES_PHONE}). Cuéntame un poco más sobre tu proyecto o qué proceso te gustaría automatizar. También puedes agendar una llamada directa de 30 min con Andrés aquí: ${CALENDAR_URL}`;

    return {
      reply: fallbackReply,
      wantsHuman: false,
      modelUsed: 'fallback',
      durationMs: Date.now() - startTime,
    };
  }
}

export interface EmailDraftResult {
  subject: string;
  body: string;
  modelUsed: string;
  durationMs: number;
}

/**
 * Generates an AI-crafted email reply or initial outreach tailored to CRM context
 */
export async function generateAgentEmailDraft({
  leadName,
  leadEmail,
  company,
  service,
  incomingSubject,
  incomingSnippet,
  crmContext,
  instruction,
}: {
  leadName: string;
  leadEmail?: string;
  company?: string;
  service?: string;
  incomingSubject?: string;
  incomingSnippet?: string;
  crmContext?: ClientCrmContext;
  instruction?: string;
}): Promise<EmailDraftResult> {
  const startTime = Date.now();

  const contextLines: string[] = [];
  if (company) contextLines.push(`• Empresa: ${company}`);
  if (service) contextLines.push(`• Servicio de interés: ${service}`);
  if (crmContext?.briefSummary) contextLines.push(`• Requerimientos del Brief: ${crmContext.briefSummary}`);
  if (crmContext?.advisorNotes && crmContext.advisorNotes.length > 0) {
    contextLines.push(`• Notas de Andrés:\n  - ${crmContext.advisorNotes.join('\n  - ')}`);
  }

  const prompt = `Eres el asistente de redacción comercial y técnica de Andrés Morales (Senior Full Stack & AI Automation Engineer en https://andresmorales.com.co).
Tu labor es redactar un borrador de correo electrónico profesional, empático, claro y orientado a la conversión para un cliente o prospecto.

REGLAS COMERCIALES OBLIGATORIAS:
1. NUNCA menciones precios exactos ni inventes tarifas. Si el cliente pregunta por costo, explica que la inversión se estima a la medida tras evaluar requerimientos técnicos en una sesión de diagnóstico de 30 min.
2. Invita a agendar la llamada de 30 minutos en el enlace oficial de Google Calendar: ${CALENDAR_URL}
3. Tono: Profesional, directo, moderno, cálido y sin jerga corporativa vacía.
4. Saludo cordial y personalizado (ej. "Hola ${leadName.split(' ')[0] || 'allí'},").
5. Firma estándar:
Saludos cordiales,

Andrés Morales
Senior Full Stack & AI Automation Engineer
andresmorales.com.co | WhatsApp: ${ANDRES_PHONE}

DATOS DEL DESTINATARIO:
Nombre: ${leadName}
${leadEmail ? `Email: ${leadEmail}` : ''}
${contextLines.length > 0 ? `Contexto CRM:\n${contextLines.join('\n')}` : ''}
${incomingSubject ? `Asunto del correo previo/hilo: ${incomingSubject}` : ''}
${incomingSnippet ? `Contenido o mensaje del cliente: "${incomingSnippet}"` : ''}
${instruction ? `Instrucción particular de Andrés: "${instruction}"` : ''}

RESPONDE ESTRICTAMENTE con un objeto JSON válido con los campos "subject" y "body", sin bloques de código ni explicaciones adicionales:
{"subject": "...", "body": "..."}`;

  try {
    const { stdout } = await execFileAsync(
      '/home/telchar/.local/bin/agy',
      ['--model', 'gemini-3.8-flash-low', '--effort', 'low', '-p', prompt],
      {
        timeout: 20000,
        env: {
          ...process.env,
          HOME: '/home/telchar',
          PATH: `/home/telchar/.local/bin:${process.env.PATH}`,
        },
      }
    );

    const match = stdout.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed.subject && parsed.body) {
          return {
            subject: parsed.subject.trim(),
            body: parsed.body.trim(),
            modelUsed: 'gemini-3.8-flash-low (agy)',
            durationMs: Date.now() - startTime,
          };
        }
      } catch {
        // parsing error handled below
      }
    }

    return {
      subject: incomingSubject ? `Re: ${incomingSubject}` : `Propuesta y siguientes pasos | Andrés Morales`,
      body: stdout.trim(),
      modelUsed: 'gemini-3.8-flash-low (raw)',
      durationMs: Date.now() - startTime,
    };
  } catch (err) {
    console.error('[AI Agent email draft error]:', err);
    const firstName = leadName.split(' ')[0] || leadName;
    return {
      subject: incomingSubject ? `Re: ${incomingSubject}` : `Seguimiento de tu proyecto | Andrés Morales`,
      body: `Hola ${firstName},\n\nGracias por tu mensaje. He revisado los requerimientos de tu proyecto y me encantaría coordinar una breve llamada de 30 minutos para despejar inquietudes técnicas y estructurar la propuesta correspondiente.\n\nPuedes elegir el horario que mejor te quede directamente en mi calendario:\n${CALENDAR_URL}\n\nQuedo a tu disposición.\n\nSaludos cordiales,\n\nAndrés Morales\nSenior Full Stack & AI Automation Engineer\nandresmorales.com.co`,
      modelUsed: 'fallback',
      durationMs: Date.now() - startTime,
    };
  }
}
