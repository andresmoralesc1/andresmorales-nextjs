import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface MailcowMessage {
  guid: string;
  date: string;
  subject: string;
  snippet: string;
}

function decodeRfc2047(raw: string): string {
  const unlined = raw.replace(/\r?\n\s*/g, ' ');
  return unlined
    .replace(/=\?([^?]+)\?([QB])\?([^?]+)\?=/gi, (_, charset, enc, text) => {
      if (enc.toUpperCase() === 'B') {
        try {
          return Buffer.from(text, 'base64').toString('utf-8');
        } catch {
          return text;
        }
      }
      const qSpace = text.replace(/_/g, ' ');
      const bytes: number[] = [];
      for (let i = 0; i < qSpace.length; i++) {
        if (
          qSpace[i] === '=' &&
          i + 2 < qSpace.length &&
          /^[0-9A-Fa-f]{2}$/.test(qSpace.slice(i + 1, i + 3))
        ) {
          bytes.push(parseInt(qSpace.slice(i + 1, i + 3), 16));
          i += 2;
        } else {
          bytes.push(qSpace.charCodeAt(i));
        }
      }
      try {
        return Buffer.from(bytes).toString('utf-8');
      } catch {
        return text;
      }
    })
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchMailcowEmailsForLead(email: string): Promise<MailcowMessage[]> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return [];
  }

  const safeEmail = email.replace(/[^a-zA-Z0-9@._+-]/g, '');

  try {
    // Search by Reply-To, From, or To
    const cmd = `sudo docker exec mailcowdockerized-dovecot-mailcow-1 doveadm fetch -u info@andresmorales.com.co "guid date.received hdr.subject body.snippet" OR HEADER Reply-To "${safeEmail}" OR FROM "${safeEmail}" TO "${safeEmail}"`;
    const { stdout } = await execAsync(cmd, { timeout: 8000 });

    if (!stdout || !stdout.trim()) {
      return [];
    }

    // Parse doveadm output blocks
    const messages: MailcowMessage[] = [];
    const blocks = stdout.split(/\n(?=guid:)/g);

    for (const block of blocks) {
      if (!block.trim().startsWith('guid:')) continue;

      const guidMatch = block.match(/guid:\s*(.+)/);
      const dateMatch = block.match(/date\.received:\s*(.+)/);
      const subjectMatch = block.match(/hdr\.subject:\s*([\s\S]*?)(?=body\.snippet:|$)/);
      const snippetMatch = block.match(/body\.snippet:\s*([\s\S]*)/);

      const guid = guidMatch ? guidMatch[1].trim() : '';
      const date = dateMatch ? dateMatch[1].trim() : '';
      const rawSubject = subjectMatch ? subjectMatch[1].trim() : '(Sin asunto)';
      const rawSnippet = snippetMatch ? snippetMatch[1].trim() : '';

      if (guid) {
        messages.push({
          guid,
          date,
          subject: decodeRfc2047(rawSubject),
          snippet: rawSnippet.slice(0, 300),
        });
      }
    }

    // Sort by date descending
    return messages.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (err) {
    console.warn('[mailcow-inbox] Could not fetch emails for', safeEmail, err);
    return [];
  }
}
