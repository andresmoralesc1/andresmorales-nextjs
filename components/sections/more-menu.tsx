'use client';

import Link from 'next/link';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

interface LinkItem {
  href: string;
  title: string;
  description?: string;
}

interface Props {
  trigger: string;
  learnLabel: string;
  learnDescription: string;
  ctaLabel: string;
  ctaHref: string;
  items: LinkItem[];
}

/**
 * Server-friendly wrapper around the Radix NavigationMenu primitive.
 * Used by the desktop header for the 'More' mega-menu trigger.
 *
 * Why this exists (instead of inlining the primitive in the header):
 *   - Keeps the header file free of UI primitives — it only deals
 *     with layout.
 *   - Centralizes the 'Learn' section shape (header + 4 items) so a
 *     future second section (e.g. 'Compare') just adds another
 *     <NavigationMenuContent> here, not in the header.
 *
 * Radix provides the auto-centering viewport, the indicator arrow,
 * keyboard navigation, and a hover-intent (the menu doesn't close
 * when the cursor traverses the trigger-to-panel gap).
 */
export function MoreMenu({
  trigger,
  learnLabel,
  learnDescription,
  ctaLabel,
  ctaHref,
  items,
}: Props) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
            {trigger}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 md:p-5 w-[min(22rem,calc(100vw-2rem))]">
              <div className="mb-3">
                <p className="text-xs uppercase tracking-widest text-text font-secondary font-bold">
                  {learnLabel}
                </p>
                <p className="text-sm text-text mt-1">
                  {learnDescription}
                </p>
              </div>
              <ul className="grid gap-1">
                {items.map((item) => (
                  <li key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className="block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-theme-1/10 hover:text-accent focus:bg-theme-1/10"
                      >
                        <div className="text-sm font-medium leading-none text-secondary">
                          {item.title}
                        </div>
                        {item.description ? (
                          <p className="line-clamp-2 text-xs text-text leading-snug mt-1">
                            {item.description}
                          </p>
                        ) : null}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-theme-9">
                <NavigationMenuLink asChild>
                  <Link
                    href={ctaHref}
                    className="text-sm font-secondary font-bold text-accent hover:opacity-80 transition-opacity inline-flex items-center gap-1.5"
                  >
                    {ctaLabel} <span aria-hidden="true">→</span>
                  </Link>
                </NavigationMenuLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
