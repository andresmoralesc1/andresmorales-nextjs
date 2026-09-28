import { marked } from 'marked';

/**
 * Lightweight markdown → HTML for the content cluster
 * (long-form articles under /guide/[slug]).
 *
 * Uses `marked` (already a project dep) for the conversion. We do not add
 * a syntax highlighter, math support, or any other plugin — the cluster
 * is technical writing, not a code tutorial, and we want the smallest
 * possible client bundle.
 */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}
