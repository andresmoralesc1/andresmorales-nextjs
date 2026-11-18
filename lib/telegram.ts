// Server-side Telegram notification helper for Andres Morales
// Sends alerts on new briefs, accepted proposals, and manual CRM pings.

export interface TelegramButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export async function sendTelegramNotification(
  message: string,
  options?: {
    chatId?: string;
    botToken?: string;
    buttons?: TelegramButton[][];
    parseMode?: 'Markdown' | 'HTML';
  }
): Promise<{ ok: boolean; error?: string }> {
  const token = options?.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = options?.chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { ok: false, error: 'Telegram bot token or chat ID not configured' };
  }

  try {
    const payload: Record<string, any> = {
      chat_id: chatId,
      text: message,
      parse_mode: options?.parseMode || 'HTML',
      disable_web_page_preview: true,
    };

    if (options?.buttons && options.buttons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: options.buttons,
      };
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.description || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network error' };
  }
}
