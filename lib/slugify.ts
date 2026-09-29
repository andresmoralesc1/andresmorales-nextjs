/**
 * Adds stable id="slug" attributes to every <h1>..<h6> in the HTML
 * returned by marked. The slug is derived from the heading text using
 * the same algorithm marked uses internally (lowercase, spaces →
 * hyphens, strip non-alphanumerics, collapse consecutive hyphens).
 * Returns the modified HTML string. No-op if there are no headings.
 *
 * Why post-process rather than configure marked's renderer:
 *   marked's renderer API was deprecated in v15 in favor of
 *   extensions, and our existing call sites use marked.parse(md,
 *   { async: false }) — they expect a sync string back. A regex pass
 *   keeps both lib/blog.ts and lib/markdown.tsx using the same
 *   minimal API and keeps the slug logic in one place.
 */

const NON_SLUG = /[^\w\- ]+/g;
const WHITESPACE = /\s+/g;
const DASHES = /\-+/g;

export function slugify(text: string): string {
  return text
    .replace(NON_SLUG, '')
    .trim()
    .toLowerCase()
    .replace(WHITESPACE, '-')
    .replace(DASHES, '-')
    .replace(/^-+|-+$/g, '');
}

const HEADING_RE = /<h([1-6])(?![^>]*\bid=)([^>]*)>([\s\S]*?)<\/h\1>/g;

export function addHeadingIds(html: string): string {
  return html.replace(HEADING_RE, (full, level, attrs, inner) => {
    const slug = slugify(inner.replace(/<[^>]+>/g, ''));
    if (!slug) return full;
    return `<h${level} id="${slug}"${attrs}>${inner}</h${level}>`;
  });
}

