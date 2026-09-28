import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names safely.
 *
 * - clsx(): conditional class joining (handles arrays, objects, falsy)
 * - twMerge(): resolves conflicting Tailwind utilities so the LAST
 *   occurrence wins (e.g. `cn('px-2', 'px-4')` returns 'px-4' instead
 *   of producing both classes in the DOM)
 *
 * The same pattern used in shadcn/ui. New to this codebase as part
 * of the Radix NavigationMenu adoption (lib/utils.ts is the standard
 * location for the cn() helper).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
