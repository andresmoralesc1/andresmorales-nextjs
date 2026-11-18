// Integration client for self-hosted Evolution API (WhatsApp Baileys)
// Connects to local docker instance at 127.0.0.1:8085 (https://evo.andresmorales.com.co)

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://127.0.0.1:8085';
const EVOLUTION_API_PUBLIC_URL = process.env.EVOLUTION_API_PUBLIC_URL || 'https://evo.andresmorales.com.co';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '71374cc3727907bc3968dd86edc58ccdb27d0434b35c9468';
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'AM';

export interface EvolutionInstanceInfo {
  connected: boolean;
  state: 'open' | 'connecting' | 'close' | 'unknown';
  instanceName: string;
  profileName: string;
  profilePicUrl: string | null;
  ownerJid: string | null;
  number: string | null;
  chatsCount: number;
  messagesCount: number;
  managerUrl: string;
  publicUrl: string;
}

export interface EvolutionChat {
  id: string;
  remoteJid: string;
  phone: string;
  name: string;
  pushName: string | null;
  profilePicUrl: string | null;
  updatedAt: string;
  unreadCount: number;
  isGroup: boolean;
  lastMessage?: {
    id: string;
    text: string;
    fromMe: boolean;
    timestamp: number;
    status?: string;
  };
}

export interface EvolutionChatMessage {
  id: string;
  remoteJid: string;
  fromMe: boolean;
  senderName: string | null;
  text: string;
  timestamp: number;
  status: string;
  mediaType: string;
}

export function extractMessageText(msg: any): string {
  if (!msg) return '';
  if (typeof msg === 'string') return msg;
  const m = msg.message || msg;
  if (!m) return '';

  if (typeof m.conversation === 'string') return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (m.interactiveMessage?.body?.text) return m.interactiveMessage.body.text;
  if (m.templateMessage?.hydratedTemplate?.hydratedContentText) return m.templateMessage.hydratedTemplate.hydratedContentText;
  if (m.imageMessage?.caption) return m.imageMessage.caption;
  if (m.videoMessage?.caption) return m.videoMessage.caption;
  if (m.documentMessage?.fileName) return `📄 ${m.documentMessage.fileName}`;
  if (m.audioMessage) return '🎵 Audio / Nota de voz';
  if (m.buttonsResponseMessage?.selectedDisplayText) return m.buttonsResponseMessage.selectedDisplayText;
  if (m.listResponseMessage?.title) return m.listResponseMessage.title;
  if (m.contactMessage?.displayName) return `👤 ${m.contactMessage.displayName}`;
  if (m.locationMessage) return '📍 Ubicación compartida';
  if (m.stickerMessage) return '👾 Sticker';

  // Fallbacks for media
  if (m.imageMessage) return '📷 Imagen';
  if (m.videoMessage) return '🎥 Video';
  if (m.documentMessage) return '📄 Documento';

  return '';
}

export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();

  // If already a WhatsApp JID (e.g. @lid, @g.us, @s.whatsapp.net), preserve it
  if (trimmed.includes('@lid') || trimmed.includes('@g.us') || trimmed.includes('@s.whatsapp.net')) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  // Colombia 10 digits starting with 3 (e.g. 3161482507) -> 573161482507
  if (digits.length === 10 && digits.startsWith('3')) {
    return `57${digits}`;
  }
  return digits;
}

export async function getEvolutionStatus(): Promise<EvolutionInstanceInfo> {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
      headers: {
        apikey: EVOLUTION_API_KEY,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        connected: false,
        state: 'close',
        instanceName: EVOLUTION_INSTANCE,
        profileName: '',
        profilePicUrl: null,
        ownerJid: null,
        number: null,
        chatsCount: 0,
        messagesCount: 0,
        managerUrl: `${EVOLUTION_API_PUBLIC_URL}/manager`,
        publicUrl: EVOLUTION_API_PUBLIC_URL,
      };
    }

    const instances = await res.json();
    const inst = Array.isArray(instances)
      ? instances.find((i: any) => i.name === EVOLUTION_INSTANCE) || instances[0]
      : null;

    if (!inst) {
      return {
        connected: false,
        state: 'close',
        instanceName: EVOLUTION_INSTANCE,
        profileName: '',
        profilePicUrl: null,
        ownerJid: null,
        number: null,
        chatsCount: 0,
        messagesCount: 0,
        managerUrl: `${EVOLUTION_API_PUBLIC_URL}/manager`,
        publicUrl: EVOLUTION_API_PUBLIC_URL,
      };
    }

    return {
      connected: inst.connectionStatus === 'open',
      state: inst.connectionStatus || 'unknown',
      instanceName: inst.name || EVOLUTION_INSTANCE,
      profileName: inst.profileName || '',
      profilePicUrl: inst.profilePicUrl || null,
      ownerJid: inst.ownerJid || null,
      number: inst.number || (inst.ownerJid ? inst.ownerJid.split('@')[0] : null),
      chatsCount: inst._count?.Chat || 0,
      messagesCount: inst._count?.Message || 0,
      managerUrl: `${EVOLUTION_API_PUBLIC_URL}/manager`,
      publicUrl: EVOLUTION_API_PUBLIC_URL,
    };
  } catch (err) {
    console.error('[Evolution API] Error fetching status:', err);
    return {
      connected: false,
      state: 'close',
      instanceName: EVOLUTION_INSTANCE,
      profileName: '',
      profilePicUrl: null,
      ownerJid: null,
      number: null,
      chatsCount: 0,
      messagesCount: 0,
      managerUrl: `${EVOLUTION_API_PUBLIC_URL}/manager`,
      publicUrl: EVOLUTION_API_PUBLIC_URL,
    };
  }
}

export const recentAppSends = new Set<string>();

export function recordAppSend(idOrKey?: string) {
  if (!idOrKey) return;
  recentAppSends.add(idOrKey);
  // Auto-expire after 5 minutes
  setTimeout(() => recentAppSends.delete(idOrKey), 5 * 60 * 1000);
}

export async function sendWhatsAppPresence({
  number,
  presence = 'composing',
  delay = 1200,
  instance = EVOLUTION_INSTANCE,
}: {
  number: string;
  presence?: 'composing' | 'recording' | 'paused' | 'available' | 'unavailable';
  delay?: number;
  instance?: string;
}): Promise<{ ok: boolean }> {
  try {
    const cleanNumber = number.includes('@') ? number : formatWhatsAppNumber(number);
    if (!cleanNumber) return { ok: false };
    const res = await fetch(`${EVOLUTION_API_URL}/chat/sendPresence/${instance}`, {
      method: 'POST',
      headers: {
        apikey: EVOLUTION_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: cleanNumber,
        presence,
        delay,
      }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export async function sendWhatsAppMessage({
  number,
  remoteJid,
  text,
  instance = EVOLUTION_INSTANCE,
}: {
  number: string;
  remoteJid?: string;
  text: string;
  instance?: string;
}): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    // If remoteJid is @lid or @g.us, send directly to remoteJid
    let cleanNumber = '';
    if (remoteJid && (remoteJid.endsWith('@lid') || remoteJid.endsWith('@g.us'))) {
      cleanNumber = remoteJid;
    } else if (number && (number.endsWith('@lid') || number.endsWith('@g.us') || number.endsWith('@s.whatsapp.net'))) {
      cleanNumber = number;
    } else {
      cleanNumber = formatWhatsAppNumber(number);
    }

    if (!cleanNumber) {
      return { ok: false, error: 'Número de WhatsApp inválido o vacío' };
    }
    if (!text.trim()) {
      return { ok: false, error: 'El mensaje de WhatsApp no puede estar vacío' };
    }

    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        apikey: EVOLUTION_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: cleanNumber,
        text: text.trim(),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      let errMsg = 'Error al enviar por Evolution API';
      if (Array.isArray(data?.response?.message)) {
        errMsg = data.response.message
          .map((m: any) => {
            if (typeof m === 'string') return m;
            if (m?.message) return m.message;
            if (m?.exists === false) return `El contacto ${m.jid || m.number || ''} no está disponible en WhatsApp`;
            return typeof m === 'object' ? JSON.stringify(m) : String(m);
          })
          .join(', ');
      } else if (typeof data?.error === 'string') {
        errMsg = data.error;
      } else if (typeof data?.response?.message === 'string') {
        errMsg = data.response.message;
      } else if (data?.message) {
        errMsg = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
      }
      return { ok: false, error: errMsg };
    }

    if (data?.key?.id) {
      recordAppSend(data.key.id);
    }
    return { ok: true, data };
  } catch (err: any) {
    console.error('[Evolution API] Error sending text message:', err);
    return { ok: false, error: err.message || 'Error de conexión con Evolution API' };
  }
}

export interface EvolutionWebhookConfig {
  enabled: boolean;
  url: string;
  events: string[];
}

export async function getEvolutionWebhook(instance = EVOLUTION_INSTANCE): Promise<EvolutionWebhookConfig | null> {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/webhook/find/${instance}`, {
      headers: { apikey: EVOLUTION_API_KEY },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.url) return null;
    return {
      enabled: Boolean(data.enabled),
      url: data.url,
      events: Array.isArray(data.events) ? data.events : [],
    };
  } catch (err) {
    console.error('[Evolution API] Error getting webhook config:', err);
    return null;
  }
}

export async function setEvolutionWebhook({
  url = 'https://andresmorales.com.co/api/webhooks/evolution',
  enabled = true,
  instance = EVOLUTION_INSTANCE,
}: {
  url?: string;
  enabled?: boolean;
  instance?: string;
} = {}): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/webhook/set/${instance}`, {
      method: 'POST',
      headers: {
        apikey: EVOLUTION_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook: {
          enabled,
          url,
          byEvents: false,
          base64: false,
          events: ['MESSAGES_UPSERT'],
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data?.error || 'Error al configurar webhook en Evolution API' };
    }
    if (data?.key?.id) {
      recordAppSend(data.key.id);
    }
    return { ok: true, data };
  } catch (err: any) {
    console.error('[Evolution API] Error setting webhook:', err);
    return { ok: false, error: err.message || 'Error de conexión con Evolution API' };
  }
}

export async function getEvolutionChats(instance = EVOLUTION_INSTANCE): Promise<EvolutionChat[]> {
  try {
    const [chatsRes, contactsRes] = await Promise.all([
      fetch(`${EVOLUTION_API_URL}/chat/findChats/${instance}`, {
        method: 'POST',
        headers: {
          apikey: EVOLUTION_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        cache: 'no-store',
      }),
      fetch(`${EVOLUTION_API_URL}/chat/findContacts/${instance}`, {
        method: 'POST',
        headers: {
          apikey: EVOLUTION_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        cache: 'no-store',
      }).catch(() => null),
    ]);

    if (!chatsRes.ok) {
      console.error('[Evolution API] findChats returned', chatsRes.status);
      return [];
    }

    const rawChats = await chatsRes.json();
    if (!Array.isArray(rawChats)) return [];

    let contactMap = new Map<string, any>();
    if (contactsRes && contactsRes.ok) {
      const rawContacts = await contactsRes.json();
      if (Array.isArray(rawContacts)) {
        for (const c of rawContacts) {
          if (c.remoteJid) contactMap.set(c.remoteJid, c);
        }
      }
    }

    const chats: EvolutionChat[] = [];

    // Map LID JIDs to phone JIDs when available in lastMessage.key.remoteJidAlt
    const lidToPhoneMap = new Map<string, string>();
    const phoneChatsSet = new Set<string>();

    for (const chat of rawChats) {
      const rJid: string = chat.remoteJid || chat.id || '';
      if (rJid.endsWith('@s.whatsapp.net')) {
        phoneChatsSet.add(rJid);
      } else if (rJid.endsWith('@lid') && chat.lastMessage?.key?.remoteJidAlt) {
        lidToPhoneMap.set(rJid, chat.lastMessage.key.remoteJidAlt);
      }
    }

    // Store merged LID chats for updating the phone chat if LID has newer message
    const lidChatUpdates = new Map<string, any>();

    for (const chat of rawChats) {
      const remoteJid: string = chat.remoteJid || chat.id || '';
      if (!remoteJid || remoteJid.includes('@broadcast')) continue;

      const isLid = remoteJid.endsWith('@lid');
      const mappedPhoneJid = isLid ? lidToPhoneMap.get(remoteJid) : undefined;

      // If this is an LID chat and we already have a corresponding phone chat, save update & skip duplicate row
      if (isLid && mappedPhoneJid && phoneChatsSet.has(mappedPhoneJid)) {
        lidChatUpdates.set(mappedPhoneJid, chat);
        continue;
      }

      const contact = contactMap.get(remoteJid);
      const isGroup = remoteJid.endsWith('@g.us');
      const cleanPhone = mappedPhoneJid
        ? mappedPhoneJid.replace(/@.*$/, '')
        : isLid
          ? remoteJid
          : remoteJid.replace(/@.*$/, '');

      let name = contact?.pushName || chat.pushName || chat.name || chat.lastMessage?.pushName;
      if (!name || name === cleanPhone || name === remoteJid) {
        if (!isLid && cleanPhone.length >= 8) {
          name = `+${cleanPhone}`;
        } else if (mappedPhoneJid) {
          name = `+${cleanPhone}`;
        } else {
          name = isGroup ? 'Grupo WhatsApp' : isLid ? `Contacto WhatsApp (${remoteJid.slice(0, 6)}...)` : 'Contacto WhatsApp';
        }
      }

      const profilePicUrl = contact?.profilePicUrl || chat.profilePicUrl || null;

      let lastMessage: EvolutionChat['lastMessage'] = undefined;
      if (chat.lastMessage) {
        const text = extractMessageText(chat.lastMessage);
        const rawTs = chat.lastMessage.messageTimestamp;
        const ts = typeof rawTs === 'number'
          ? (rawTs > 1000000000000 ? rawTs : rawTs * 1000)
          : (Number(rawTs) > 1000000000000 ? Number(rawTs) : Number(rawTs || 0) * 1000);

        lastMessage = {
          id: chat.lastMessage.id || chat.lastMessage.key?.id || '',
          text: text || (chat.lastMessage.messageType ? `[${chat.lastMessage.messageType}]` : ''),
          fromMe: Boolean(chat.lastMessage.key?.fromMe),
          timestamp: ts || new Date(chat.updatedAt || Date.now()).getTime(),
          status: chat.lastMessage.status || 'READ',
        };
      }

      chats.push({
        id: remoteJid,
        remoteJid,
        phone: cleanPhone,
        name,
        pushName: contact?.pushName || chat.pushName || chat.lastMessage?.pushName || null,
        profilePicUrl,
        updatedAt: chat.updatedAt || new Date().toISOString(),
        unreadCount: chat.unreadCount || 0,
        isGroup,
        lastMessage,
      });
    }

    // Apply any newer lastMessage from merged LID chats to their parent phone chat
    for (const chat of chats) {
      const lidUpdate = lidChatUpdates.get(chat.remoteJid);
      if (lidUpdate && lidUpdate.lastMessage) {
        const lidTs = typeof lidUpdate.lastMessage.messageTimestamp === 'number'
          ? (lidUpdate.lastMessage.messageTimestamp > 1000000000000 ? lidUpdate.lastMessage.messageTimestamp : lidUpdate.lastMessage.messageTimestamp * 1000)
          : Number(lidUpdate.lastMessage.messageTimestamp || 0) * 1000;

        const currentTs = chat.lastMessage?.timestamp || 0;
        if (lidTs >= currentTs) {
          const text = extractMessageText(lidUpdate.lastMessage);
          chat.lastMessage = {
            id: lidUpdate.lastMessage.id || lidUpdate.lastMessage.key?.id || '',
            text: text || (lidUpdate.lastMessage.messageType ? `[${lidUpdate.lastMessage.messageType}]` : ''),
            fromMe: Boolean(lidUpdate.lastMessage.key?.fromMe),
            timestamp: lidTs,
            status: lidUpdate.lastMessage.status || 'READ',
          };
          chat.updatedAt = lidUpdate.updatedAt || new Date(lidTs).toISOString();
        }
        const newPushName = lidUpdate.pushName || lidUpdate.lastMessage?.pushName;
        if (!chat.pushName && newPushName) {
          chat.pushName = newPushName;
          if (chat.name.startsWith('+') || chat.name.includes('Contacto WhatsApp')) {
            chat.name = newPushName;
          }
        }
      }
    }

    // Sort by latest message / update
    chats.sort((a, b) => {
      const tsA = a.lastMessage?.timestamp || new Date(a.updatedAt).getTime() || 0;
      const tsB = b.lastMessage?.timestamp || new Date(b.updatedAt).getTime() || 0;
      return tsB - tsA;
    });

    return chats;
  } catch (err) {
    console.error('[Evolution API] Error getting chats:', err);
    return [];
  }
}

export async function getEvolutionMessages(
  remoteJid: string,
  instance = EVOLUTION_INSTANCE
): Promise<EvolutionChatMessage[]> {
  try {
    if (!remoteJid) return [];

    const fetchWhere = async (whereObj: any) => {
      try {
        const res = await fetch(`${EVOLUTION_API_URL}/chat/findMessages/${instance}`, {
          method: 'POST',
          headers: {
            apikey: EVOLUTION_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ where: whereObj }),
          cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data?.messages?.records || (Array.isArray(data) ? data : []);
      } catch {
        return [];
      }
    };

    const isPhoneJid = remoteJid.endsWith('@s.whatsapp.net');
    const isLid = remoteJid.endsWith('@lid');

    let records: any[] = [];
    if (isPhoneJid) {
      // In WhatsApp Multi-device / LID mode, incoming messages have key.remoteJidAlt = phoneJid,
      // while outgoing responses have key.remoteJid = phoneJid. Fetch both in parallel.
      const [direct, alt] = await Promise.all([
        fetchWhere({ key: { remoteJid } }),
        fetchWhere({ key: { remoteJidAlt: remoteJid } }),
      ]);
      records = [...direct, ...alt];
    } else if (isLid) {
      const direct = await fetchWhere({ key: { remoteJid } });
      const altJid = direct.find((r: any) => r.key?.remoteJidAlt)?.key?.remoteJidAlt;
      if (altJid) {
        const phoneRecords = await fetchWhere({ key: { remoteJid: altJid } });
        records = [...direct, ...phoneRecords];
      } else {
        records = direct;
      }
    } else {
      records = await fetchWhere({ key: { remoteJid } });
    }

    if (!Array.isArray(records)) return [];

    // Deduplicate records by message id
    const seenIds = new Set<string>();
    const uniqueRecords: any[] = [];
    for (const rec of records) {
      const msgId = rec.id || rec.key?.id;
      if (msgId) {
        if (seenIds.has(msgId)) continue;
        seenIds.add(msgId);
      }
      uniqueRecords.push(rec);
    }

    const messages: EvolutionChatMessage[] = [];

    for (const rec of uniqueRecords) {
      const text = extractMessageText(rec);
      const rawTs = rec.messageTimestamp;
      const ts = typeof rawTs === 'number'
        ? (rawTs > 1000000000000 ? rawTs : rawTs * 1000)
        : (Number(rawTs) > 1000000000000 ? Number(rawTs) : Number(rawTs || 0) * 1000);

      messages.push({
        id: rec.id || rec.key?.id || `${Date.now()}-${Math.random()}`,
        remoteJid: rec.key?.remoteJid || remoteJid,
        fromMe: Boolean(rec.key?.fromMe),
        senderName: rec.pushName || null,
        text: text || `[${rec.messageType || 'Mensaje'}]`,
        timestamp: ts || Date.now(),
        status: rec.status || rec.MessageUpdate?.[0]?.status || 'SERVER_ACK',
        mediaType: rec.messageType || 'conversation',
      });
    }

    // Sort chronologically (oldest to newest)
    messages.sort((a, b) => a.timestamp - b.timestamp);

    return messages;
  } catch (err) {
    console.error('[Evolution API] Error getting messages for', remoteJid, err);
    return [];
  }
}

/**
 * Downloads base64 media content from Evolution API
 */
export async function getMediaBase64({
  messageKey,
  messageContent,
  instance = EVOLUTION_INSTANCE,
}: {
  messageKey: any;
  messageContent: any;
  instance?: string;
}): Promise<string | null> {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${instance}`, {
      method: 'POST',
      headers: {
        apikey: EVOLUTION_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          key: messageKey,
          message: messageContent,
        },
        convertToMp4: false,
      }),
    });

    if (!res.ok) {
      console.warn('[Evolution API] getBase64FromMediaMessage error status:', res.status);
      return null;
    }

    const json = await res.json();
    return json.base64 || null;
  } catch (err: any) {
    console.warn('[Evolution API] Error fetching media base64:', err?.message || err);
    return null;
  }
}

/**
 * Transcribes WhatsApp voice notes (audio/ogg/opus) to Spanish text using Gemini Flash via agy
 */
export async function transcribeAudioMessage(base64Data: string, msgId = 'msg'): Promise<string | null> {
  const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
  const tempOgg = path.join('/tmp', `wa-${msgId}.ogg`);
  const tempWav = path.join('/tmp', `wa-${msgId}.wav`);

  try {
    // 1. Write audio buffer to temp file
    await fs.promises.writeFile(tempOgg, Buffer.from(cleanBase64, 'base64'));

    // 2. Convert OGG/Opus to 16kHz WAV using ffmpeg
    await execFileAsync('ffmpeg', ['-y', '-i', tempOgg, '-ar', '16000', '-ac', '1', tempWav], {
      timeout: 10000,
    });

    // 3. Transcribe audio using agy (Gemini 3.8 Flash natively understands audio)
    const prompt = `Transcribe strictly the spoken words in the audio file ${tempWav} into Spanish text. Output ONLY the raw transcript, with proper punctuation, without adding quotes, conversational filler, markdown formatting or explanation. If the audio is silent or unintelligible, output NOTHING.`;

    const { stdout } = await execFileAsync(
      '/home/telchar/.local/bin/agy',
      ['--model', 'gemini-3.8-flash-low', '--effort', 'low', '-p', prompt],
      {
        timeout: 25000,
        env: {
          ...process.env,
          HOME: '/home/telchar',
          PATH: `/home/telchar/.local/bin:${process.env.PATH}`,
        },
      }
    );

    let transcript = stdout.trim();
    // Clean up any extraneous prefixes
    transcript = transcript.replace(/^\*\*Transcription:\*\*\s*/i, '');
    transcript = transcript.replace(/^["'>\s]+|["'\s]+$/g, '').trim();

    return transcript || null;
  } catch (err: any) {
    console.error('[transcribeAudioMessage error]:', err?.message || err);
    return null;
  } finally {
    // Clean up temporary files
    try {
      if (fs.existsSync(tempOgg)) await fs.promises.unlink(tempOgg);
      if (fs.existsSync(tempWav)) await fs.promises.unlink(tempWav);
    } catch {}
  }
}
