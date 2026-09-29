import { marked } from 'marked';
import { addHeadingIds } from '@/lib/slugify';

/**
 * Lightweight markdown → HTML for the content cluster
 * (long-form articles under /guide/[slug]).
 *
 * Uses `marked` (already a project dep) for the conversion. We do not add
 * a syntax highlighter, math support, or any other plugin — the cluster
 * is technical writing, not a code tutorial, and we want the smallest
 * possible client bundle.
 *
 * After marked renders, we post-process to add stable id="slug"
 * attributes on every heading. The ArticleToc component links to
 * these ids — without them the in-page navigation doesn't work.
 * lib/slugify.ts is the single source of slug logic for the project
 * (also used by lib/blog.ts so blog posts get the same treatment).
 */
export function renderMarkdown(md: string): string {
  return addHeadingIds(marked.parse(md, { async: false }) as string);
}
