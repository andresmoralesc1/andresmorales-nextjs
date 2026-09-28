/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Tailwind-aware className joiner used across the UI primitives. Local
 * fork to avoid pulling in clsx + tailwind-merge for a one-callsite
 * pattern. Promote to a real cn() (clsx + tailwind-merge) when the call
 * sites grow past ~5 or when a consumer needs conditional tailwind
 * merge semantics.
 */
export function cn(...inputs: Array<string | undefined | false | null>): string {
  return inputs.filter(Boolean).join(' ');
}
