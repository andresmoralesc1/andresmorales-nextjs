// fetch-rss.ts — Aggregates AI news from TechCrunch, MIT Tech Review,
// The Verge, and VentureBeat. Returns a deduplicated list of recent items
// with title, link, summary, source, and published date.

export interface NewsItem {
  title: string;
  link: string;
  summary: string;
  source: string;
  publishedAt: string; // ISO timestamp
}

const FEEDS: Array<{ url: string; source: string }> = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch' },
  { url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', source: 'MIT Technology Review' },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', source: 'The Verge' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat' },
];

// Crude RSS/Atom parser. Good enough for the four feeds we care about.
// We avoid a dependency on `rss-parser` because the cron runs offline-friendly
// (via npx) and we'd rather not add 1MB of node_modules for a 4-feed reader.
function parseRss(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  // Match `<item>` blocks (RSS) and `<entry>` blocks (Atom).
  const itemRe = /<item[\s>]([\s\S]*?)<\/item>|<entry[\s>]([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml))) {
    const block = (match[1] ?? match[2] ?? '').trim();
    const title = extractTag(block, 'title') ?? '';
    const link =
      extractTag(block, 'link') ??
      extractAttr(block, 'link', 'href') ??
      '';
    const description =
      extractTag(block, 'description') ??
      extractTag(block, 'summary') ??
      extractTag(block, 'content') ??
      '';
    const pubDate =
      extractTag(block, 'pubDate') ??
      extractTag(block, 'published') ??
      extractTag(block, 'updated') ??
      '';
    if (!title || !link) continue;
    items.push({
      title: stripHtml(title).trim(),
      link: link.trim(),
      summary: stripHtml(description).trim().slice(0, 600),
      source,
      publishedAt: parseDate(pubDate),
    });
  }
  return items;
}

function extractTag(block: string, tag: string): string | null {
  // Handles CDATA-wrapped tags (`<title><![CDATA[...]]></title>`) and
  // plain text tags. Greedy enough for typical feed content.
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = re.exec(block);
  if (!m) return null;
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function extractAttr(block: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]+)"`, 'i');
  const m = re.exec(block);
  return m ? m[1] : null;
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ');
}

function parseDate(raw: string): string {
  if (!raw) return new Date().toISOString();
  const d = new Date(raw);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

// Keywords that filter the 50-ish items per feed down to AI-relevant ones.
const AI_KEYWORDS = [
  'ai',
  'llm',
  'gpt',
  'agent',
  'claude',
  'openai',
  'anthropic',
  'model',
  'automation',
  'chatbot',
  'gemini',
  'mistral',
  'llama',
  'deepseek',
  'neural',
];

export async function fetchRecentAiNews(): Promise<NewsItem[]> {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const all: NewsItem[] = [];
  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'andresmorales-news-pipeline/1.0' },
      });
      if (!res.ok) {
        console.warn(`[fetch-rss] ${feed.source} returned ${res.status}, skipping.`);
        continue;
      }
      const xml = await res.text();
      const items = parseRss(xml, feed.source);
      all.push(...items);
    } catch (err) {
      console.warn(
        `[fetch-rss] ${feed.source} fetch failed: ${(err as Error).message}`,
      );
    }
  }

  // Filter: must mention AI keywords in title or summary, and be recent.
  const filtered = all.filter((item) => {
    if (new Date(item.publishedAt).getTime() < sevenDaysAgo) return false;
    const haystack = `${item.title} ${item.summary}`.toLowerCase();
    return AI_KEYWORDS.some((kw) => haystack.includes(kw));
  });

  // Deduplicate by normalized title (case + whitespace).
  const seen = new Set<string>();
  const deduped: NewsItem[] = [];
  for (const item of filtered) {
    const key = item.title.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  // Newest first.
  deduped.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return deduped.slice(0, 10);
}